import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, handlePrismaError, UnauthorizedError } from "../lib/errors.js";

import { getUsageCount } from "../services/usage.service.js";

// Helper to get limit from Plan JSON
const getLimit = (plan: any, resource: string): number => {
    if (!plan || !plan.limits) return 0; // Default to 0 if no limits defined
    const limits = plan.limits as Record<string, any>;
    return limits[resource] || 0; // Return specific limit
};

export const checkUsageLimit = (resource: "projects" | "widgets" | "testimonials" | "teamMembers") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new UnauthorizedError("Authentication required");
            }

            // Fetch user with subscription and plan
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscription: {
                        include: {
                            plan: true
                        }
                    }
                }
            });

            if (!user) {
                throw new UnauthorizedError("User not found");
            }

            // Determine effective plan
            let plan = user.subscription?.status === 'ACTIVE' ? user.subscription.plan : null;

            // If no active subscription plan, try to find the "FREE" plan from DB to get its limits
            if (!plan) {
                plan = await prisma.plan.findFirst({
                    where: { type: 'FREE', isActive: true }
                });
            }

            if (!plan) {
                // Fallback hardcoded limits for safety if DB is empty
                const fallbackLimits: Record<typeof resource, number> = {
                    projects: 1,
                    widgets: 1,
                    testimonials: 10,
                    teamMembers: 1
                };
                const limit = fallbackLimits[resource];
                console.warn("No plan found for user, using fallback limits.");

                // Check usage using service
                const count = await getUsageCount(resource, userId);
                if (count >= limit) {
                    return res.status(403).json({
                        code: "LIMIT_EXCEEDED",
                        message: `You have reached the limit for ${resource} on your current plan.`,
                        limit,
                        current: count,
                        resource
                    });
                }
                return next();
            }

            const limit = getLimit(plan, resource);
            // -1 or Infinity could mean unlimited
            if (limit === -1) {
                return next();
            }

            // Check usage using service
            const count = await getUsageCount(resource, userId);

            if (count >= limit) {
                // Return specific error structure for frontend to intercept
                return res.status(403).json({
                    code: "LIMIT_EXCEEDED", // Global error handler looks for this
                    message: `You have reached the limit for ${resource} (${limit}) on the ${plan.name}.`,
                    limit,
                    current: count,
                    resource,
                    planName: plan.name
                });
            }

            next();
        } catch (error) {
            next(handlePrismaError(error));
        }
    };
};

