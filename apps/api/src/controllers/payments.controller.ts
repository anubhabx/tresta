import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  NotFoundError,
  handlePrismaError,
  UnauthorizedError,
  InternalServerError,
} from "../lib/errors.js";
import { ResponseHandler } from "../lib/response.js";
import {
  createRazorpaySubscription,
  verifyPaymentSignature,
} from "../services/razorpay.service.js";
import { Subscriptions } from "razorpay/dist/types/subscriptions.js";
import { requireUserId } from "../lib/auth.js";
import { PLAN_LIMITS } from "../config/constants.js";

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { planId } = req.body; // Razorpay Plan ID from static pricing.ts
    const userId = requireUserId(req);

    if (!planId) {
      throw new BadRequestError("Plan ID is required");
    }

    // All paid subscriptions are PRO (no Plan table lookup needed)
    const userPlanType = "PRO" as const;

    // Create Subscription on Razorpay
    let subscription: Subscriptions.RazorpaySubscription;
    try {
      subscription = await createRazorpaySubscription(planId);
    } catch (err: any) {
      throw new InternalServerError(
        "Failed to create subscription with payment provider",
        {
          providerError: err.message,
          planId: planId,
        },
      );
    }

    if (!subscription || !subscription.id) {
      throw new Error("Failed to create Razorpay subscription");
    }

    // Create or Update Subscription in DB
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "INCOMPLETE", // Will be ACTIVE after verification
        externalSubscriptionId: subscription.id,
        userPlan: userPlanType,
        currentPeriodStart: subscription.current_start
          ? new Date(subscription.current_start * 1000)
          : null,
        currentPeriodEnd: subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null,
      },
      update: {
        status: "INCOMPLETE",
        externalSubscriptionId: subscription.id,
        userPlan: userPlanType,
        currentPeriodStart: subscription.current_start
          ? new Date(subscription.current_start * 1000)
          : null,
        currentPeriodEnd: subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null,
      },
    });

    return ResponseHandler.success(res, {
      message: "Subscription initiated",
      data: {
        subscriptionId: subscription.id,
        key: process.env.RAZORPAY_KEY_ID,
        planName: "Pro Plan",
      },
    });
  } catch (error) {
    next(handlePrismaError(error));
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;
    const userId = requireUserId(req);

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      throw new BadRequestError("Missing payment verification details");
    }

    const isValid = verifyPaymentSignature(
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestError("Invalid payment signature");
    }

    // Update Subscription status to ACTIVE
    // Fetch latest details from Razorpay to get updated start/end times
    const { getSubscription } = await import("../services/razorpay.service.js");
    let currentPeriodStart: Date | undefined;
    let currentPeriodEnd: Date | undefined;

    try {
      const subDetails = await getSubscription(razorpay_subscription_id);
      if (subDetails.current_start)
        currentPeriodStart = new Date(subDetails.current_start * 1000);
      if (subDetails.current_end)
        currentPeriodEnd = new Date(subDetails.current_end * 1000);
    } catch (e) {
      console.error(
        `[WARNING] Failed to fetch Razorpay subscription details for ${razorpay_subscription_id} — billing period dates will not be set.`,
        e,
      );
    }

    const periodData: Record<string, Date> = {};
    if (currentPeriodStart) periodData.currentPeriodStart = currentPeriodStart;
    if (currentPeriodEnd) periodData.currentPeriodEnd = currentPeriodEnd;

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        externalSubscriptionId: razorpay_subscription_id,
        userId,
      },
    });

    if (!existingSubscription) {
      throw new NotFoundError("Subscription not found for current user");
    }

    const subscription = await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: "ACTIVE",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        ...periodData,
      },
    });

    // Set user plan to PRO (no Plan table lookup needed)
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "PRO",
      },
    });

    return ResponseHandler.success(res, {
      message: "Payment verified and subscription active",
      data: subscription,
    });
  } catch (error) {
    next(handlePrismaError(error));
  }
};

export const getSubscriptionDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const subscription = user.subscription;

    // Build plan details from static config based on user.plan enum
    const planType = user.plan; // FREE or PRO
    const limits = PLAN_LIMITS[planType] ?? PLAN_LIMITS.FREE;
    const isActive = subscription?.status === "ACTIVE";

    const planData =
      planType === "PRO"
        ? {
            id: "pro",
            name: "Pro Plan",
            interval: subscription?.interval || "month",
            price: subscription?.amount || 30000,
            limits,
            type: "PRO" as const,
          }
        : {
            id: "free",
            name: "Free Plan",
            interval: "month",
            price: 0,
            limits,
            type: "FREE" as const,
          };

    // Get usage stats
    const { getUsageStats } = await import("../services/usage.service.js");
    const usage = await getUsageStats(userId);

    return ResponseHandler.success(res, {
      data: {
        plan: planData,
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null,
        usage: usage,
      },
    });
  } catch (error) {
    next(handlePrismaError(error));
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUserId(req);

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || !subscription.externalSubscriptionId) {
      throw new BadRequestError("No active subscription found to cancel");
    }

    // Call Razorpay to cancel
    const { cancelRazorpaySubscription } = await import(
      "../services/razorpay.service.js"
    );
    // We cancel at period end usually to let them finish what they paid for
    await cancelRazorpaySubscription(subscription.externalSubscriptionId);

    // Update DB
    const updatedSub = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        // Status might remain 'ACTIVE' until the period ends and webhook fires 'subscription.cancelled'
        // But we mark it as intentionally cancelling.
      },
    });

    return ResponseHandler.success(res, {
      message:
        "Subscription scheduled for cancellation at the end of the billing period.",
      data: {
        cancelAtPeriodEnd: updatedSub.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSub.currentPeriodEnd,
      },
    });
  } catch (error) {
    next(handlePrismaError(error));
  }
};

const getInvoiceDownloadUrl = (rawSnapshot: unknown): string | null => {
  if (!rawSnapshot || typeof rawSnapshot !== "object") {
    return null;
  }

  const snapshot = rawSnapshot as {
    payload?: {
      invoice?: {
        entity?: {
          short_url?: string;
          invoice_url?: string;
        };
      };
    };
    invoice?: {
      short_url?: string;
      invoice_url?: string;
    };
  };

  return (
    snapshot.payload?.invoice?.entity?.short_url ??
    snapshot.payload?.invoice?.entity?.invoice_url ??
    snapshot.invoice?.short_url ??
    snapshot.invoice?.invoice_url ??
    null
  );
};

export const listUserInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = requireUserId(req);

    const records = await prisma.subscriptionPayment.findMany({
      where: {
        userId,
        OR: [
          { externalInvoiceId: { not: null } },
          { paymentStatus: { not: null } },
          { invoiceStatus: { not: null } },
        ],
      },
      orderBy: [{ eventCreatedAt: "desc" }, { createdAt: "desc" }],
      take: 25,
      select: {
        id: true,
        externalInvoiceId: true,
        amount: true,
        currency: true,
        paymentStatus: true,
        invoiceStatus: true,
        paidAt: true,
        eventCreatedAt: true,
        createdAt: true,
        rawSnapshot: true,
      },
    });

    // Map records and resolve download URLs, with Razorpay API fallback
    const invoicePromises = records.map(async (record) => {
      let downloadUrl = getInvoiceDownloadUrl(record.rawSnapshot);

      // Fallback: if no URL in snapshot but we have an invoice ID, fetch from Razorpay API
      if (!downloadUrl && record.externalInvoiceId) {
        try {
          const { fetchRazorpayInvoice } = await import(
            "../services/razorpay.service.js"
          );
          const invoiceDetails = await fetchRazorpayInvoice(
            record.externalInvoiceId,
          );
          downloadUrl =
            invoiceDetails?.short_url ?? invoiceDetails?.invoice_url ?? null;
        } catch {
          // Silently fail — download URL will be null
        }
      }

      return {
        id: record.id,
        invoiceId: record.externalInvoiceId,
        amount: record.amount,
        currency: record.currency,
        status: record.invoiceStatus ?? record.paymentStatus ?? "unknown",
        paidAt: record.paidAt?.toISOString() ?? null,
        date:
          record.eventCreatedAt?.toISOString() ??
          record.createdAt.toISOString(),
        downloadUrl,
      };
    });

    const invoices = await Promise.all(invoicePromises);

    return ResponseHandler.success(res, {
      data: {
        invoices,
      },
    });
  } catch (error) {
    next(handlePrismaError(error));
  }
};
