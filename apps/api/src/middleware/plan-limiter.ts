import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { PlanService } from '../services/plan.service.js';
import { prisma } from '@workspace/database/prisma';

export const planLimitMiddleware = (resource: 'projects' | 'testimonials' | 'apiRequests') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            // Count current usage
            let currentCount = 0;
            if (resource === 'projects') {
                currentCount = await prisma.project.count({ where: { userId } });
            } else if (resource === 'testimonials') {
                const projectId = req.params.projectId || req.body.projectId;
                if (projectId) {
                    currentCount = await prisma.testimonial.count({ where: { projectId } });
                } else {
                    return next();
                }
            } else if (resource === 'apiRequests') {
                return next();
            }

            const canProceed = await PlanService.checkLimit(userId, resource, currentCount);

            if (!canProceed) {
                return res.status(403).json({
                    error: `Plan limit reached for ${resource}. Please upgrade your plan.`,
                });
            }

            next();
        } catch (error) {
            console.error('Plan limit check failed:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
