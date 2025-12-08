
import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
    BadRequestError,
    NotFoundError,
    handlePrismaError,
    UnauthorizedError,
} from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';
import {
    createRazorpaySubscription,
    verifyRazorpaySignature,
} from '../services/razorpay.service.js';

export const createSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { planId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            throw new UnauthorizedError("User not authenticated");
        }

        if (!planId) {
            throw new BadRequestError("Plan ID is required");
        }

        const plan = await prisma.plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            throw new NotFoundError("Plan not found");
        }

        if (!plan.razorpayPlanId) {
            throw new BadRequestError("This plan is not configured for payments (missing Razorpay ID)");
        }

        // Create Subscription on Razorpay
        const subscription = await createRazorpaySubscription(plan.razorpayPlanId);

        if (!subscription || !subscription.id) {
            throw new Error("Failed to create Razorpay subscription");
        }

        // Create or Update Subscription in DB
        // We upsert to allow retry or upgrade
        await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                planId: plan.id,
                status: "INCOMPLETE", // Will be ACTIVE after verification
                externalSubscriptionId: subscription.id,
                userPlan: plan.type, // Legacy enum
            },
            update: {
                planId: plan.id,
                status: "INCOMPLETE",
                externalSubscriptionId: subscription.id,
                userPlan: plan.type,
            },
        });

        return ResponseHandler.success(res, {
            message: "Subscription initiated",
            data: {
                subscriptionId: subscription.id,
                key: process.env.RAZORPAY_KEY_ID,
                planName: plan.name,
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

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
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
        const subscription = await prisma.subscription.update({
            where: { externalSubscriptionId: razorpay_subscription_id },
            data: {
                status: "ACTIVE",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                razorpayOrderId: razorpay_subscription_id, // For subscription flow, they map closely or we store sub ID
                // Optional: Update plan details in case they changed
            },
        });

        // Also update User's relation if not already correct (UserPlan enum)
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (plan) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    plan: plan.type, // Update the legacy enum on User model too for fast access
                }
            });
        }

        return ResponseHandler.success(res, {
            message: "Payment verified and subscription active",
            data: subscription,
        });
    } catch (error) {
        next(handlePrismaError(error));
    }
};
