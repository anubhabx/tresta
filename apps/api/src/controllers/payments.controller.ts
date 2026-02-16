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
  verifyRazorpaySignature,
} from "../services/razorpay.service.js";
import { Subscriptions } from "razorpay/dist/types/subscriptions.js";
import { ZodError } from "zod";
import {
  parseCreateSubscriptionRequest,
  parseVerifyPaymentRequest,
} from "../validators/payments.validator.js";
import type {
  PlanLimits,
  SubscriptionDetailsData,
  SubscriptionPlanSummary,
} from "@workspace/types";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown provider error";
};

const getNumberLimit = (
  limits: Record<string, unknown>,
  key: string,
  fallback: number,
): number => {
  const value = limits[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
};

const toPlanLimits = (limits: unknown): PlanLimits => {
  if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
    return {
      projects: 0,
      widgets: 0,
      testimonials: 0,
    };
  }

  const source = limits as Record<string, unknown>;
  const normalized: PlanLimits = {
    projects: getNumberLimit(source, "projects", 0),
    widgets: getNumberLimit(source, "widgets", 0),
    testimonials: getNumberLimit(source, "testimonials", 0),
  };

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[key] = value;
    }
  }

  return normalized;
};

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { planId } = parseCreateSubscriptionRequest(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!planId) {
      throw new BadRequestError("Plan ID is required");
    }

    // Optional: Try to find the plan in our DB to link it, but don't block if missing
    // This maintains compatibility if the admin panel is still updating the Plan table
    const plan = await prisma.plan.findUnique({
      where: { razorpayPlanId: planId },
    });

    // Determine user plan type (fallback to PRO for any paid subscription)
    const userPlanType = plan?.type || "PRO";
    const dbPlanId = plan?.id || null;

    // Create Subscription on Razorpay
    let subscription: Subscriptions.RazorpaySubscription;
    try {
      subscription = await createRazorpaySubscription(planId);
    } catch (err: unknown) {
      throw new InternalServerError(
        "Failed to create subscription with payment provider",
        {
          providerError: getErrorMessage(err),
          planId: planId,
        },
      );
    }

    if (!subscription || !subscription.id) {
      throw new Error("Failed to create Razorpay subscription");
    }

    // Create or Update Subscription in DB
    // We upsert to allow retry or upgrade
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: dbPlanId,
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
        planId: dbPlanId,
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
        key: process.env.RAZORPAY_KEY_ID || undefined,
        planName: plan?.name || "Pro Plan", // Fallback name
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        new BadRequestError("Invalid subscription request payload", {
          issues: error.issues,
        }),
      );
    }
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
      planId,
    } = parseVerifyPaymentRequest(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      throw new BadRequestError("Missing payment verification details");
    }

    const isValid = verifyRazorpaySignature(
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
        "Failed to fetch Razorpay subscription details during verification",
        e,
      );
      // Non-blocking, we proceed with activation
    }

    const subscription = await prisma.subscription.update({
      where: { externalSubscriptionId: razorpay_subscription_id },
      data: {
        status: "ACTIVE",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        razorpayOrderId: razorpay_subscription_id,
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    // Also update User's relation if not already correct (UserPlan enum)
    // Try to find plan again if possible, or default to PRO
    // Note: verifyPayment endpoint uses `planId` from body which is the Razorpay Plan ID now
    const plan = await prisma.plan.findUnique({
      where: { razorpayPlanId: planId },
    });
    const userPlanType = plan?.type || "PRO";

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: userPlanType,
      },
    });

    return ResponseHandler.success(res, {
      message: "Payment verified and subscription active",
      data: subscription,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        new BadRequestError("Invalid payment verification payload", {
          issues: error.issues,
        }),
      );
    }
    next(handlePrismaError(error));
  }
};

export const getSubscriptionDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const subscription = user.subscription;

    let planSummary: SubscriptionPlanSummary | null = null;

    if (subscription?.plan) {
      planSummary = {
        id: subscription.plan.id,
        name: subscription.plan.name,
        interval: subscription.plan.interval,
        price: subscription.plan.price,
        limits: toPlanLimits(subscription.plan.limits),
        type: subscription.plan.type,
      };
    }

    // If no active DB plan linked, check subscription enum type to fallback to PRO structure
    if (!planSummary && subscription?.userPlan === "PRO") {
      planSummary = {
        id: "pro-legacy-or-static",
        name: "Pro Plan",
        interval: subscription.interval || "month",
        price: subscription.amount || 30000,
        limits: { projects: -1, testimonials: -1, widgets: -1 },
        type: "PRO",
      };
    }

    // If no active plan, fetch free details
    if (!planSummary) {
      const freePlan = await prisma.plan.findFirst({
        where: { type: "FREE" },
      });

      if (freePlan) {
        planSummary = {
          id: freePlan.id,
          name: freePlan.name,
          interval: freePlan.interval,
          price: freePlan.price,
          limits: toPlanLimits(freePlan.limits),
          type: freePlan.type,
        };
      }
    }

    // Get usage stats
    const { getUsageStats } = await import("../services/usage.service.js");
    const usage = await getUsageStats(userId);

    const payload: SubscriptionDetailsData = {
      plan: planSummary,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd
              ? subscription.currentPeriodEnd.toISOString()
              : null,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
      usage: usage
        ? {
            projects: usage.projects,
            widgets: usage.widgets,
            testimonials: usage.testimonials,
          }
        : null,
    };

    return ResponseHandler.success(res, {
      data: payload,
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
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

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

export const resumeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || !subscription.externalSubscriptionId) {
      throw new BadRequestError("No active subscription found to resume");
    }

    if (!subscription.cancelAtPeriodEnd) {
      return ResponseHandler.success(res, {
        message:
          "Subscription is already active and not scheduled for cancellation.",
      });
    }

    // Razorpay does not support "un-cancelling" a scheduled cancellation via API.
    // We must ask the user to create a new subscription (Renew).
    throw new BadRequestError(
      "Resumption not supported. Please subscribe again to renew your plan.",
    );
  } catch (error) {
    next(handlePrismaError(error));
  }
};
