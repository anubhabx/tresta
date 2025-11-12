import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.ts';
import { AppError } from '../../lib/errors.ts';
import {
  adminReadRateLimitMiddleware,
  adminWriteRateLimitMiddleware,
  adminHeavyRateLimitMiddleware,
} from '../../middleware/rate-limiter.ts';
import { auditLog } from '../../middleware/audit-log.middleware.ts';

const router: Router = Router();

/**
 * GET /admin/testimonials
 * Get paginated list of testimonials with search and filters
 * 
 * Query params:
 * - cursor: Testimonial ID for cursor-based pagination
 * - limit: Number of records per page (default: 50, max: 100)
 * - search: Search query for content/author (prefix match)
 * - status: Filter by moderation status (PENDING, APPROVED, REJECTED, FLAGGED)
 * - rating: Filter by rating (1-5)
 * - projectId: Filter by project ID
 * 
 * Returns:
 * - testimonials: Array of testimonial objects
 * - nextCursor: Cursor for next page (null if no more pages)
 * - hasMore: Boolean indicating if more pages exist
 */
router.get(
  '/testimonials',
  adminReadRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        cursor,
        limit = '50',
        search,
        status,
        rating,
        projectId,
      } = req.query;
      
      const pageSize = Math.min(parseInt(limit as string), 100);
      
      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { content: { contains: search as string, mode: 'insensitive' } },
          { authorName: { startsWith: search as string, mode: 'insensitive' } },
          { authorEmail: { startsWith: search as string, mode: 'insensitive' } },
        ];
      }
      
      if (status) {
        where.moderationStatus = status;
      }
      
      if (rating) {
        where.rating = parseInt(rating as string);
      }
      
      if (projectId) {
        where.projectId = projectId;
      }
      
      // Fetch testimonials with cursor pagination
      const testimonials = await prisma.testimonial.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          Project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
      
      const hasMore = testimonials.length > pageSize;
      const results = hasMore ? testimonials.slice(0, pageSize) : testimonials;
      const nextCursor = hasMore ? results[results.length - 1].id : null;
      
      return ResponseHandler.success(res, {
        data: {
          testimonials: results.map(t => ({
            id: t.id,
            authorName: t.authorName,
            authorEmail: t.authorEmail,
            authorRole: t.authorRole,
            authorCompany: t.authorCompany,
            content: t.content,
            rating: t.rating,
            moderationStatus: t.moderationStatus,
            moderationScore: t.moderationScore,
            isOAuthVerified: t.isOAuthVerified,
            autoPublished: t.autoPublished,
            createdAt: t.createdAt,
            user: t.User ? {
              id: t.User.id,
              email: t.User.email,
              name: [t.User.firstName, t.User.lastName]
                .filter(Boolean)
                .join(' ') || 'N/A',
            } : null,
            project: t.Project ? {
              id: t.Project.id,
              name: t.Project.name,
              slug: t.Project.slug,
            } : null,
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
 * PATCH /admin/testimonials/:id/status
 * Update moderation status of a single testimonial
 * 
 * Body:
 * - status: New moderation status (APPROVED, REJECTED, FLAGGED)
 * 
 * Returns:
 * - Updated testimonial
 */
router.patch(
  '/testimonials/:id/status',
  adminWriteRateLimitMiddleware,
  auditLog,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['APPROVED', 'REJECTED', 'FLAGGED'].includes(status)) {
        throw new AppError('Invalid status. Must be APPROVED, REJECTED, or FLAGGED', 400);
      }
      
      const testimonial = await prisma.testimonial.findUnique({
        where: { id },
      });
      
      if (!testimonial) {
        throw new AppError('Testimonial not found', 404);
      }
      
      const updated = await prisma.testimonial.update({
        where: { id },
        data: {
          moderationStatus: status,
          isApproved: status === 'APPROVED',
          isPublished: status === 'APPROVED',
        },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          Project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
      
      // TODO: Log action in audit log
      // TODO: Send notification to project owner
      
      return ResponseHandler.success(res, {
        data: {
          id: updated.id,
          moderationStatus: updated.moderationStatus,
          isApproved: updated.isApproved,
          isPublished: updated.isPublished,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /admin/testimonials/bulk-update
 * Bulk update moderation status of multiple testimonials
 * 
 * Body:
 * - ids: Array of testimonial IDs (max 100)
 * - status: New moderation status (APPROVED, REJECTED, FLAGGED)
 * - dryRun: If true, return preview without making changes
 * 
 * Returns:
 * - affected: Number of testimonials affected
 * - preview: Array of testimonials that will be updated (if dryRun)
 */
router.post(
  '/testimonials/bulk-update',
  adminHeavyRateLimitMiddleware,
  auditLog,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, status, dryRun = false } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError('ids must be a non-empty array', 400);
      }
      
      if (ids.length > 100) {
        throw new AppError('Cannot update more than 100 testimonials at once', 400);
      }
      
      if (!['APPROVED', 'REJECTED', 'FLAGGED'].includes(status)) {
        throw new AppError('Invalid status. Must be APPROVED, REJECTED, or FLAGGED', 400);
      }
      
      // Fetch testimonials to be updated
      const testimonials = await prisma.testimonial.findMany({
        where: { id: { in: ids } },
        include: {
          Project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      if (dryRun) {
        return ResponseHandler.success(res, {
          data: {
            affected: testimonials.length,
            preview: testimonials.map(t => ({
              id: t.id,
              authorName: t.authorName,
              content: t.content.substring(0, 100),
              currentStatus: t.moderationStatus,
              newStatus: status,
              project: t.Project ? {
                id: t.Project.id,
                name: t.Project.name,
              } : null,
            })),
          },
        });
      }
      
      // Perform bulk update
      const result = await prisma.testimonial.updateMany({
        where: { id: { in: ids } },
        data: {
          moderationStatus: status,
          isApproved: status === 'APPROVED',
          isPublished: status === 'APPROVED',
        },
      });
      
      // TODO: Log bulk action in audit log
      // TODO: Send notifications to project owners
      
      return ResponseHandler.success(res, {
        data: {
          affected: result.count,
          status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
