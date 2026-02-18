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

export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { planId } = req.body; // This is now the Razorpay Plan ID directly
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
        key: process.env.RAZORPAY_KEY_ID,
        planName: plan?.name || "Pro Plan", // Fallback name
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
      planId,
    } = req.body;
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
        `[WARNING] Failed to fetch Razorpay subscription details for ${razorpay_subscription_id} — billing period dates will not be set.`,
        e,
      );
    }

    const periodData: Record<string, Date> = {};
    if (currentPeriodStart) periodData.currentPeriodStart = currentPeriodStart;
    if (currentPeriodEnd) periodData.currentPeriodEnd = currentPeriodEnd;

    const subscription = await prisma.subscription.update({
      where: { externalSubscriptionId: razorpay_subscription_id },
      data: {
        status: "ACTIVE",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        razorpayOrderId: razorpay_subscription_id,
        ...periodData,
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
    let plan = subscription?.plan;

    // If no active DB plan linked, check subscription enum type to fallback to a PRO structure
    if (!plan && subscription?.userPlan === "PRO") {
      plan = {
        id: "pro-legacy-or-static",
        name: "Pro Plan",
        description: "Unlimited access",
        type: "PRO",
        price: subscription.amount || 30000,
        currency: subscription.currency || "INR",
        interval: subscription.interval || "month",
        limits: { projects: -1, testimonials: -1, widgets: -1 },
        isActive: true,
        razorpayPlanId: subscription.externalSubscriptionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }

    // If no active plan, fetch free details
    if (!plan) {
      plan = await prisma.plan.findFirst({
        where: { type: "FREE" },
      });
    }

    // Get usage stats
    const { getUsageStats } = await import("../services/usage.service.js");
    const usage = await getUsageStats(userId);

    return ResponseHandler.success(res, {
      data: {
        plan: plan
          ? {
              id: plan.id,
              name: plan.name,
              interval: plan.interval,
              price: plan.price,
              limits: plan.limits,
              type: plan.type,
            }
          : null,
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

