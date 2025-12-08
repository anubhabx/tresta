import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, handlePrismaError, UnauthorizedError } from "../lib/errors.js";

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
            // If subscription is ACTIVE, use subscription plan.
            // Otherwise use default/free logic (if we have a default Plan record for FREE).
            // For now, let's assume we use subscription.plan if exists, or fallback to hardcoded defaults or fetch "Free" plan.
            let plan = user.subscription?.status === 'ACTIVE' ? user.subscription.plan : null;

            // If no active subscription plan, try to find the "FREE" plan from DB to get its limits
            if (!plan) {
                plan = await prisma.plan.findFirst({
                    where: { type: 'FREE', isActive: true }
                });
            }

            // If still no plan (e.g. initial setup missing), allow small default or block?
            // Let's block to be safe, or allow 1.
            // Better to have seeded FREE plan.
            if (!plan) {
                // Fallback hardcoded limits for safety if DB is empty
                const fallbackLimits: Record<typeof resource, number> = {
                    projects: 1,
                    widgets: 1,
                    testimonials: 10,
                    teamMembers: 1
                };
                const limit = fallbackLimits[resource];
                // We need to count usage.
                // ... duplicate logic below.
                // Ideally we shouldn't be here if seeding is correct.
                console.warn("No plan found for user, using fallback limits.");

                // Check usage
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

// Helper to count usage based on resource type
async function getUsageCount(resource: string, userId: string): Promise<number> {
    switch (resource) {
        case "projects":
            return await prisma.project.count({ where: { userId, isActive: true } });
        case "widgets":
            // Widgets are usually per project, but maybe global limit?
            // If we limit total widgets across all projects logic:
            // Need to join projects.
            // simple version:
            return await prisma.widget.count({
                where: {
                    Project: {
                        userId: userId
                    }
                }
            });
        case "testimonials":
            // Total testimonials collected?
            return await prisma.testimonial.count({
                where: {
                    User: { id: userId } // If testimonials are linked to user directly (owner)
                    // Or via Project if that's the ownership model. Schema says Testimonial has userId.
                }
            });
        default:
            return 0;
    }
}
