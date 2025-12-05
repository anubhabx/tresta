import { prisma } from '@workspace/database/prisma';

export class PlanService {
    /**
     * Get all active plans
     */
    static async getPlans() {
        return prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { amount: 'asc' },
        });
    }

    /**
     * Get plan by slug
     */
    static async getPlanBySlug(slug: string) {
        return prisma.plan.findUnique({
            where: { slug },
        });
    }

    /**
     * Get user's current plan limits
     */
    static async getUserLimits(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });

        if (!user) throw new Error('User not found');

        // Default to Free plan if no subscription or plan found
        const plan = user.subscription?.plan || await prisma.plan.findUnique({ where: { slug: 'free' } });

        if (!plan) throw new Error('Default plan not found');

        return {
            maxProjects: plan.maxProjects,
            maxTestimonials: plan.maxTestimonials,
            maxApiRequests: plan.maxApiRequests,
            planName: plan.name,
            planSlug: plan.slug,
        };
    }

    /**
     * Check if user can perform action based on limits
     */
    static async checkLimit(userId: string, resource: 'projects' | 'testimonials' | 'apiRequests', currentCount: number) {
        const limits = await PlanService.getUserLimits(userId);
        let limit = 0;

        switch (resource) {
            case 'projects':
                limit = limits.maxProjects;
                break;
            case 'testimonials':
                limit = limits.maxTestimonials;
                break;
            case 'apiRequests':
                limit = limits.maxApiRequests;
                break;
        }

        // -1 means unlimited
        if (limit === -1) return true;

        return currentCount < limit;
    }
}
