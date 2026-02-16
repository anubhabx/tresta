import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

import { Prisma, prisma } from "@workspace/database/prisma";

import { verifyRazorpayWebhookSignature } from "../services/razorpay.service.js";
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
      };
    };
    invoice?: {
      entity?: {
        status?: string;
        subscription_id?: string;
        payment_id?: string;
      };
    };
  };
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

  return Buffer.from(JSON.stringify(req.body || {}));
};

const toDate = (epochSeconds?: number): Date | undefined => {
  if (!epochSeconds || Number.isNaN(epochSeconds)) {
    return undefined;
  }

  return new Date(epochSeconds * 1000);
};

const getSubscriptionId = (payload: RazorpayEventPayload): string | undefined => {
  return (
    payload.payload?.subscription?.entity?.id ||
    payload.payload?.payment?.entity?.subscription_id ||
    payload.payload?.invoice?.entity?.subscription_id
  );
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
    res.status(400).json({ success: false, message: "Missing webhook signature configuration" });
    return;
  }

  const rawBody = getRawBody(req);
  const rawBodyString = rawBody.toString("utf8");

  const isValidSignature = verifyRazorpayWebhookSignature(
    rawBodyString,
    signature,
    secret,
  );

  if (!isValidSignature) {
    res.status(400).json({ success: false, message: "Invalid Razorpay webhook signature" });
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

  const subscriptionId = getSubscriptionId(payload);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.paymentWebhookEvent.create({
        data: {
          provider: "razorpay",
          providerEventId,
          eventType: payload.event,
          subscriptionId,
          payload: payload as unknown as Prisma.InputJsonValue,
          status: "processing",
        },
      });

      if (!subscriptionId) {
        await tx.paymentWebhookEvent.update({
          where: { providerEventId },
          data: {
            status: "ignored",
            processedAt: new Date(),
          },
        });
        return;
      }

      const subscription = await tx.subscription.findUnique({
        where: { externalSubscriptionId: subscriptionId },
      });

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
      if (subscription.lastWebhookAt && eventCreatedAt < subscription.lastWebhookAt) {
        await tx.paymentWebhookEvent.update({
          where: { providerEventId },
          data: {
            status: "stale",
            processedAt: new Date(),
          },
        });
        return;
      }

      const providerStatusFromPayload = payload.payload?.subscription?.entity?.status;
      const providerStatus = providerStatusFromPayload || subscription.providerStatus || undefined;

      const paymentEntity = payload.payload?.payment?.entity;
      const invoiceEntity = payload.payload?.invoice?.entity;

      const lastPaymentStatus = paymentEntity?.status || subscription.lastPaymentStatus || undefined;
      const lastInvoiceStatus = invoiceEntity?.status || subscription.lastInvoiceStatus || undefined;

      const mappedStatus = mapProviderSignalsToInternal(
        providerStatus,
        lastInvoiceStatus,
        lastPaymentStatus,
      );

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
            Boolean(payload.payload?.subscription?.entity?.cancel_at_cycle_end) ||
            subscription.cancelAtPeriodEnd,
          razorpayPaymentId:
            paymentEntity?.id || invoiceEntity?.payment_id || subscription.razorpayPaymentId || undefined,
          lastPaymentStatus,
          lastInvoiceStatus,
          lastWebhookEventId: providerEventId,
          lastWebhookEventType: payload.event,
          lastWebhookAt: eventCreatedAt,
        },
      });

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
    console.error("Razorpay webhook processing failed", error);

    try {
      await prisma.paymentWebhookEvent.update({
        where: { providerEventId },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown webhook error",
          processedAt: new Date(),
        },
      });
    } catch {
      // Ignore secondary failures
    }

    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};
