import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

import { Prisma, prisma } from "@workspace/database/prisma";
import { logger } from "../lib/logger.js";

import { verifyWebhookSignature } from "../services/razorpay.service.js";
import { mapProviderSignalsToInternal } from "../services/subscription-status.service.js";

type RazorpayEventPayload = {
  event: string;
  created_at?: number;
  payload?: {
    subscription?: {
      entity?: {
        id?: string;
        status?: string;
        current_start?: number;
        current_end?: number;
        plan_id?: string;
        customer_id?: string;
        cancel_at_cycle_end?: boolean | number;
      };
    };
    payment?: {
      entity?: {
        id?: string;
        status?: string;
        subscription_id?: string;
        amount?: number;
        currency?: string;
        notes?: Record<string, unknown>;
      };
    };
    invoice?: {
      entity?: {
        id?: string;
        status?: string;
        subscription_id?: string;
        payment_id?: string;
        amount?: number;
        amount_paid?: number;
        currency?: string;
        short_url?: string;
        invoice_url?: string;
        notes?: Record<string, unknown>;
        line_items?: Array<{
          subscription_id?: string;
        }>;
      };
    };
  };
};

const SUPPORTED_EVENT_PREFIXES = [
  "subscription.",
  "invoice.",
  "payment.",
] as const;

const razorpayWebhookLogger = logger.child({ module: 'razorpay-webhook' });

/**
 * Extract the invoice short_url from an existing rawSnapshot.
 * Used to preserve download URLs when a payment.* event would overwrite
 * a record that was previously created by an invoice.* event.
 */
const getExistingInvoiceUrl = (rawSnapshot: unknown): string | null => {
  if (!rawSnapshot || typeof rawSnapshot !== "object") return null;
  const snap = rawSnapshot as {
    payload?: {
      invoice?: { entity?: { short_url?: string; invoice_url?: string } };
    };
  };
  return (
    snap.payload?.invoice?.entity?.short_url ??
    snap.payload?.invoice?.entity?.invoice_url ??
    null
  );
};

/**
 * Merge the incoming webhook payload with an existing rawSnapshot,
 * preserving the invoice entity (and its short_url) if the incoming
 * event is a payment.* event that doesn't carry invoice data.
 */
const mergeSnapshot = (
  incoming: RazorpayEventPayload,
  existingSnapshot: unknown,
): RazorpayEventPayload => {
  // If the incoming event already has invoice data, use it as-is.
  if (incoming.payload?.invoice?.entity?.short_url) {
    return incoming;
  }

  // If no existing snapshot to merge from, use incoming as-is.
  if (!existingSnapshot || typeof existingSnapshot !== "object") {
    return incoming;
  }

  const existing = existingSnapshot as RazorpayEventPayload;
  const existingInvoice = existing.payload?.invoice;

  // If the old snapshot has invoice data with a download URL, preserve it.
  if (
    existingInvoice?.entity?.short_url ||
    existingInvoice?.entity?.invoice_url
  ) {
    return {
      ...incoming,
      payload: {
        ...incoming.payload,
        invoice: existingInvoice,
      },
    };
  }

  return incoming;
};

const isSupportedWebhookEvent = (eventName: string): boolean => {
  return SUPPORTED_EVENT_PREFIXES.some((prefix) =>
    eventName.startsWith(prefix),
  );
};

const getRawBody = (req: Request): Buffer => {
  const maybeRawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (Buffer.isBuffer(maybeRawBody)) {
    return maybeRawBody;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === "string") {
    return Buffer.from(req.body);
  }

  throw new Error(
    "Raw request body is required for webhook signature verification",
  );
};

const toDate = (epochSeconds?: number): Date | undefined => {
  if (!epochSeconds || Number.isNaN(epochSeconds)) {
    return undefined;
  }

  return new Date(epochSeconds * 1000);
};

const getNoteString = (
  notes: Record<string, unknown> | undefined,
  key: string,
): string | undefined => {
  if (!notes || typeof notes[key] !== "string") {
    return undefined;
  }

  const value = String(notes[key]).trim();
  return value.length > 0 ? value : undefined;
};

const getSubscriptionId = (
  payload: RazorpayEventPayload,
): string | undefined => {
  const paymentNotes = payload.payload?.payment?.entity?.notes;
  const invoiceNotes = payload.payload?.invoice?.entity?.notes;
  const invoiceLineItems = payload.payload?.invoice?.entity?.line_items;

  return (
    payload.payload?.subscription?.entity?.id ||
    payload.payload?.payment?.entity?.subscription_id ||
    getNoteString(paymentNotes, "subscription_id") ||
    getNoteString(paymentNotes, "razorpay_subscription_id") ||
    payload.payload?.invoice?.entity?.subscription_id ||
    getNoteString(invoiceNotes, "subscription_id") ||
    getNoteString(invoiceNotes, "razorpay_subscription_id") ||
    invoiceLineItems?.find((lineItem) => lineItem.subscription_id)
      ?.subscription_id
  );
};

const getPaymentId = (payload: RazorpayEventPayload): string | undefined => {
  return (
    payload.payload?.payment?.entity?.id ||
    payload.payload?.invoice?.entity?.payment_id
  );
};

const getInvoiceId = (payload: RazorpayEventPayload): string | undefined => {
  return payload.payload?.invoice?.entity?.id;
};

const getProviderStatusFromEvent = (eventName: string): string | undefined => {
  const [scope, state] = eventName.split(".");
  if (scope !== "subscription" || !state) {
    return undefined;
  }

  switch (state) {
    case "activated":
    case "resumed":
    case "charged":
      return "active";
    case "authenticated":
      return "authenticated";
    case "cancelled":
      return "cancelled";
    case "completed":
      return "completed";
    case "pending":
      return "pending";
    case "halted":
      return "halted";
    case "paused":
      return "paused";
    default:
      return undefined;
  }
};

const getInvoiceStatusFromEvent = (eventName: string): string | undefined => {
  switch (eventName) {
    case "invoice.paid":
      return "paid";
    case "invoice.partially_paid":
      return "partially_paid";
    case "invoice.expired":
      return "expired";
    default:
      return undefined;
  }
};

const getPaymentStatusFromEvent = (eventName: string): string | undefined => {
  switch (eventName) {
    case "payment.captured":
      return "captured";
    case "payment.authorized":
      return "authorized";
    case "payment.failed":
      return "failed";
    default:
      return undefined;
  }
};

const getInternalStatusOverride = (
  eventName: string,
): "ACTIVE" | "PAST_DUE" | "PAUSED" | "CANCELED" | undefined => {
  switch (eventName) {
    case "subscription.activated":
    case "subscription.resumed":
    case "subscription.charged":
    case "invoice.paid":
    case "payment.captured":
      return "ACTIVE";
    case "subscription.pending":
    case "subscription.halted":
    case "invoice.partially_paid":
    case "invoice.expired":
    case "payment.failed":
      return "PAST_DUE";
    case "subscription.paused":
      return "PAUSED";
    case "subscription.cancelled":
    case "subscription.completed":
      return "CANCELED";
    default:
      return undefined;
  }
};

const getProviderEventId = (req: Request, rawBody: Buffer): string => {
  const headerEventId = req.header("x-razorpay-event-id");
  if (headerEventId) {
    return `razorpay:${headerEventId}`;
  }

  const hash = crypto.createHash("sha256").update(rawBody).digest("hex");
  return `razorpay:hash:${hash}`;
};

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const signature = req.header("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    res.status(400).json({
      success: false,
      message: "Missing webhook signature configuration",
    });
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = getRawBody(req);
  } catch {
    res
      .status(400)
      .json({ success: false, message: "Missing raw request body" });
    return;
  }

  const rawBodyString = rawBody.toString("utf8");

  const isValidSignature = verifyWebhookSignature(
    rawBodyString,
    signature,
    secret,
  );

  if (!isValidSignature) {
    res
      .status(400)
      .json({ success: false, message: "Invalid Razorpay webhook signature" });
    return;
  }

  let payload: RazorpayEventPayload;
  try {
    payload = JSON.parse(rawBodyString) as RazorpayEventPayload;
  } catch {
    res.status(400).json({ success: false, message: "Invalid JSON payload" });
    return;
  }

  if (!payload.event) {
    res.status(400).json({ success: false, message: "Missing event type" });
    return;
  }

  const providerEventId = getProviderEventId(req, rawBody);

  const existingEvent = await prisma.paymentWebhookEvent.findUnique({
    where: { providerEventId },
  });

  if (existingEvent) {
    res.status(200).json({ success: true, message: "Already processed" });
    return;
  }

  if (!isSupportedWebhookEvent(payload.event)) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "razorpay",
        providerEventId,
        eventType: payload.event,
        subscriptionId: getSubscriptionId(payload),
        payload: payload as unknown as Prisma.InputJsonValue,
        status: "ignored",
        processedAt: new Date(),
        error: "Unsupported event type",
      },
    });

    res
      .status(200)
      .json({ success: true, message: `Event ${payload.event} ignored` });
    return;
  }

  const subscriptionIdFromPayload = getSubscriptionId(payload);
  const paymentIdFromPayload = getPaymentId(payload);
  const invoiceIdFromPayload = getInvoiceId(payload);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentWebhookEvent.create({
        data: {
          provider: "razorpay",
          providerEventId,
          eventType: payload.event,
          subscriptionId: subscriptionIdFromPayload,
          payload: payload as unknown as Prisma.InputJsonValue,
          status: "processing",
        },
      });

      let subscription = subscriptionIdFromPayload
        ? await tx.subscription.findUnique({
            where: { externalSubscriptionId: subscriptionIdFromPayload },
          })
        : null;

      if (!subscription && paymentIdFromPayload) {
        subscription = await tx.subscription.findFirst({
          where: { razorpayPaymentId: paymentIdFromPayload },
        });
      }

      if (!subscription) {
        await tx.paymentWebhookEvent.update({
          where: { providerEventId },
          data: {
            status: "ignored",
            processedAt: new Date(),
            error: "No matching local subscription",
          },
        });
        return;
      }

      const eventCreatedAt = toDate(payload.created_at) || new Date();
      if (
        subscription.lastWebhookAt &&
        eventCreatedAt < subscription.lastWebhookAt
      ) {
        await tx.paymentWebhookEvent.update({
          where: { providerEventId },
          data: {
            status: "stale",
            processedAt: new Date(),
          },
        });
        return;
      }

      const providerStatusFromPayload =
        payload.payload?.subscription?.entity?.status;
      const providerStatusFromEvent = getProviderStatusFromEvent(payload.event);
      const providerStatus =
        providerStatusFromPayload ||
        providerStatusFromEvent ||
        subscription.providerStatus ||
        undefined;

      const paymentEntity = payload.payload?.payment?.entity;
      const invoiceEntity = payload.payload?.invoice?.entity;

      const paymentStatusFromEvent = getPaymentStatusFromEvent(payload.event);
      const invoiceStatusFromEvent = getInvoiceStatusFromEvent(payload.event);

      const lastPaymentStatus =
        paymentEntity?.status ||
        paymentStatusFromEvent ||
        subscription.lastPaymentStatus ||
        undefined;
      const lastInvoiceStatus =
        invoiceEntity?.status ||
        invoiceStatusFromEvent ||
        subscription.lastInvoiceStatus ||
        undefined;

      const mappedStatusFromSignals = mapProviderSignalsToInternal(
        providerStatus,
        lastInvoiceStatus,
        lastPaymentStatus,
      );
      const mappedStatus =
        getInternalStatusOverride(payload.event) || mappedStatusFromSignals;

      const currentPeriodStart =
        toDate(payload.payload?.subscription?.entity?.current_start) ||
        subscription.currentPeriodStart ||
        undefined;
      const currentPeriodEnd =
        toDate(payload.payload?.subscription?.entity?.current_end) ||
        subscription.currentPeriodEnd ||
        undefined;

      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          providerStatus,
          status: mappedStatus,
          externalCustomerId:
            payload.payload?.subscription?.entity?.customer_id ||
            subscription.externalCustomerId ||
            undefined,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd:
            payload.payload?.subscription?.entity?.cancel_at_cycle_end !==
            undefined
              ? Boolean(
                  payload.payload?.subscription?.entity?.cancel_at_cycle_end,
                )
              : subscription.cancelAtPeriodEnd,
          razorpayPaymentId:
            paymentEntity?.id ||
            invoiceEntity?.payment_id ||
            paymentIdFromPayload ||
            subscription.razorpayPaymentId ||
            undefined,
          lastPaymentStatus,
          lastInvoiceStatus,
          lastWebhookEventId: providerEventId,
          lastWebhookEventType: payload.event,
          lastWebhookAt: eventCreatedAt,
        },
      });

      const hasPaymentSignal =
        payload.event.startsWith("payment.") ||
        payload.event.startsWith("invoice.");
      if (hasPaymentSignal && (paymentIdFromPayload || invoiceIdFromPayload)) {
        const paymentAmount =
          payload.payload?.payment?.entity?.amount ||
          payload.payload?.invoice?.entity?.amount_paid ||
          payload.payload?.invoice?.entity?.amount ||
          subscription.amount ||
          null;
        const paymentCurrency =
          payload.payload?.payment?.entity?.currency ||
          payload.payload?.invoice?.entity?.currency ||
          subscription.currency ||
          null;

        // Build the base payment record data (without rawSnapshot — that gets merged below)
        const basePaymentData = {
          provider: "razorpay",
          externalPaymentId: paymentIdFromPayload,
          externalInvoiceId: invoiceIdFromPayload,
          externalSubscriptionId: subscription.externalSubscriptionId,
          userId: subscription.userId,
          subscriptionId: subscription.id,
          planId: subscription.planId,
          paymentStatus: lastPaymentStatus,
          invoiceStatus: lastInvoiceStatus,
          amount: paymentAmount,
          currency: paymentCurrency,
          eventType: payload.event,
          eventCreatedAt,
          paidAt:
            payload.event === "payment.captured" ||
            payload.event === "invoice.paid"
              ? eventCreatedAt
              : undefined,
          failedAt:
            payload.event === "payment.failed" ? eventCreatedAt : undefined,
        };

        if (paymentIdFromPayload) {
          // Fetch existing record to merge snapshots (preserve invoice short_url)
          const existingPayment = await tx.subscriptionPayment.findUnique({
            where: {
              provider_externalPaymentId: {
                provider: "razorpay",
                externalPaymentId: paymentIdFromPayload,
              },
            },
            select: { rawSnapshot: true },
          });

          const mergedSnapshot = mergeSnapshot(
            payload,
            existingPayment?.rawSnapshot,
          );

          const paymentRecordData = {
            ...basePaymentData,
            rawSnapshot: mergedSnapshot as unknown as Prisma.InputJsonValue,
          };

          await tx.subscriptionPayment.upsert({
            where: {
              provider_externalPaymentId: {
                provider: "razorpay",
                externalPaymentId: paymentIdFromPayload,
              },
            },
            create: paymentRecordData,
            update: paymentRecordData,
          });
        } else if (invoiceIdFromPayload) {
          // Fetch existing record to merge snapshots (preserve invoice short_url)
          const existingPayment = await tx.subscriptionPayment.findUnique({
            where: {
              provider_externalInvoiceId: {
                provider: "razorpay",
                externalInvoiceId: invoiceIdFromPayload,
              },
            },
            select: { rawSnapshot: true },
          });

          const mergedSnapshot = mergeSnapshot(
            payload,
            existingPayment?.rawSnapshot,
          );

          const paymentRecordData = {
            ...basePaymentData,
            rawSnapshot: mergedSnapshot as unknown as Prisma.InputJsonValue,
          };

          await tx.subscriptionPayment.upsert({
            where: {
              provider_externalInvoiceId: {
                provider: "razorpay",
                externalInvoiceId: invoiceIdFromPayload,
              },
            },
            create: paymentRecordData,
            update: paymentRecordData,
          });
        }
      }

      if (mappedStatus === "ACTIVE") {
        await tx.user.update({
          where: { id: subscription.userId },
          data: {
            plan: subscription.userPlan,
          },
        });
      }

      if (mappedStatus === "CANCELED") {
        await tx.user.update({
          where: { id: subscription.userId },
          data: {
            plan: "FREE",
          },
        });
      }

      await tx.paymentWebhookEvent.update({
        where: { providerEventId },
        data: {
          status: "processed",
          processedAt: new Date(),
        },
      });
    });

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    razorpayWebhookLogger.error({ error, providerEventId }, 'Razorpay webhook processing failed');

    try {
      await prisma.paymentWebhookEvent.update({
        where: { providerEventId },
        data: {
          status: "failed",
          error:
            error instanceof Error ? error.message : "Unknown webhook error",
          processedAt: new Date(),
        },
      });
    } catch {
      // Ignore secondary failures
    }

    res
      .status(500)
      .json({ success: false, message: "Webhook processing failed" });
  }
};
