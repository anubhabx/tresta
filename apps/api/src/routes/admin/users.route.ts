import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.ts';
import { AppError } from '../../lib/errors.ts';
import { adminReadRateLimitMiddleware, adminHeavyRateLimitMiddleware } from '../../middleware/rate-limiter.ts';

const router: Router = Router();

/**
 * GET /admin/users
 * Get paginated list of users with search and filters
 * 
 * Query params:
 * - cursor: User ID for cursor-based pagination
 * - limit: Number of records per page (default: 50, max: 100)
 * - search: Search query for name/email (prefix match)
 * - plan: Filter by user plan (FREE, PRO)
 * 
 * Returns:
 * - users: Array of user objects with project/testimonial counts
 * - nextCursor: Cursor for next page (null if no more pages)
 * - hasMore: Boolean indicating if more pages exist
 */
router.get(
  '/users',
  adminReadRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cursor, limit = '50', search, plan } = req.query;
      
      const pageSize = Math.min(parseInt(limit as string), 100);
      
      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { email: { startsWith: search as string, mode: 'insensitive' } },
          { firstName: { startsWith: search as string, mode: 'insensitive' } },
          { lastName: { startsWith: search as string, mode: 'insensitive' } },
        ];
      }
      
      if (plan && (plan === 'FREE' || plan === 'PRO')) {
        where.plan = plan;
      }
      
      // Fetch users with cursor pagination
      const users = await prisma.user.findMany({
        where,
        take: pageSize + 1, // Fetch one extra to check if there are more
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          plan: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              testimonials: true,
            },
          },
        },
      });
      
      const hasMore = users.length > pageSize;
      const results = hasMore ? users.slice(0, pageSize) : users;
      const nextCursor = hasMore ? results[results.length - 1].id : null;
      
      return ResponseHandler.success(res, {
        data: {
          users: results.map(user => ({
            id: user.id,
            email: user.email,
            name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A',
            avatar: user.avatar,
            plan: user.plan,
            projectCount: user._count.projects,
            testimonialCount: user._count.testimonials,
            joinedAt: user.createdAt,
          })),
          nextCursor,
          hasMore,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /admin/users/:id
 * Get detailed information about a specific user
 * 
 * Returns:
 * - User details
 * - Projects with testimonial counts by status
 * - Subscription information
 */
router.get(
  '/users/:id',
  adminReadRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          subscription: true,
          projects: {
            include: {
              _count: {
                select: {
                  testimonials: true,
                },
              },
              testimonials: {
                select: {
                  moderationStatus: true,
                },
              },
            },
          },
          _count: {
            select: {
              testimonials: true,
              apiKeys: true,
            },
          },
        },
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Calculate testimonial counts by status for each project
      const projectsWithStats = user.projects.map(project => {
        const statusCounts = project.testimonials.reduce((acc, t) => {
          acc[t.moderationStatus] = (acc[t.moderationStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          id: project.id,
          name: project.name,
          slug: project.slug,
          visibility: project.visibility,
          projectType: project.projectType,
          isActive: project.isActive,
          createdAt: project.createdAt,
          testimonialCounts: {
            total: project._count.testimonials,
            pending: statusCounts.PENDING || 0,
            approved: statusCounts.APPROVED || 0,
            rejected: statusCounts.REJECTED || 0,
            flagged: statusCounts.FLAGGED || 0,
          },
        };
      });
      
      return ResponseHandler.success(res, {
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          plan: user.plan,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          subscription: user.subscription ? {
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          } : null,
          projects: projectsWithStats,
          stats: {
            projectCount: user.projects.length,
            testimonialCount: user._count.testimonials,
            apiKeyCount: user._count.apiKeys,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /admin/users/:id/export
 * Generate DSAR export for a user
 * 
 * Returns:
 * - downloadUrl: Signed S3 URL for downloading the export
 * - expiresAt: Expiration timestamp for the URL
 */
router.post(
  '/users/:id/export',
  adminHeavyRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Fetch all user data
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          projects: {
            include: {
              testimonials: true,
              widgets: true,
              apiKeys: {
                select: {
                  id: true,
                  name: true,
                  keyPrefix: true,
                  permissions: true,
                  usageCount: true,
                  isActive: true,
                  createdAt: true,
                  lastUsedAt: true,
                },
              },
            },
          },
          testimonials: true,
          subscription: true,
          notifications: true,
          notificationPreferences: true,
        },
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // TODO: Generate export file and upload to S3
      // TODO: Generate signed URL with 1-hour expiry
      // TODO: Log export action in audit log
      
      // For now, return a placeholder response
      return ResponseHandler.success(res, {
        data: {
          message: 'Export generation not yet implemented',
          userData: {
            id: user.id,
            email: user.email,
            plan: user.plan,
            projectCount: user.projects.length,
            testimonialCount: user.testimonials.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
