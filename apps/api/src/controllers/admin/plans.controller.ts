
import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from '../../lib/errors.js';
import { ResponseHandler } from '../../lib/response.js';

export const listAllPlans = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return ResponseHandler.success(res, {
            message: "All plans retrieved successfully",
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

export const getPlanMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Get all plans
        const plans = await prisma.plan.findMany();
        const planMap = new Map(plans.map(p => [p.id, p]));

        // 2. Aggregate subscriptions by Plan and Status
        const subscriptionStats = await prisma.subscription.groupBy({
            by: ['planId', 'status'],
            _count: {
                id: true
            }
        });

        // 3. Process metrics
        let totalMRR = 0; // In paise
        const planMetrics = plans.map(plan => {
            const stats = subscriptionStats.filter(s => s.planId === plan.id);

            const activeCount = stats.find(s => s.status === 'ACTIVE')?._count.id || 0;
            const pastDueCount = stats.find(s => s.status === 'PAST_DUE')?._count.id || 0;
            const canceledCount = stats.find(s => s.status === 'CANCELED')?._count.id || 0;
            const incompleteCount = stats.find(s => s.status === 'INCOMPLETE')?._count.id || 0;

            const totalCount = activeCount + pastDueCount + canceledCount + incompleteCount;

            // Calculate MRR contribution (normalize yearly to monthly)
            let mrrContribution = 0;
            if (activeCount > 0) {
                if (plan.interval === 'year') {
                    mrrContribution = (plan.price / 12) * activeCount;
                } else {
                    mrrContribution = plan.price * activeCount;
                }
            }

            totalMRR += mrrContribution;

            return {
                planId: plan.id,
                planName: plan.name,
                interval: plan.interval,
                price: plan.price,
                active: activeCount,
                canceled: canceledCount,
                total: totalCount,
                mrr: mrrContribution
            };
        });

        // 4. Also count users on "Free" plan (users with no subscription or plan='FREE' relation)
        // Note: The Subscription model tracks paid subs. Free users might just have User.plan = 'FREE' and no subscription record.
        const freeUsers = await prisma.user.count({
            where: {
                plan: 'FREE'
            }
        });

        return ResponseHandler.success(res, {
            message: "Plan metrics retrieved successfully",
            data: {
                overview: {
                    totalMRR, // In paise
                    totalFreeUsers: freeUsers
                },
                breakdown: planMetrics
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getPlanById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const plan = await prisma.plan.findUnique({
            where: { id },
        });

        if (!plan) {
            throw new NotFoundError("Plan not found");
        }

        return ResponseHandler.success(res, {
            message: "Plan details retrieved successfully",
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};
