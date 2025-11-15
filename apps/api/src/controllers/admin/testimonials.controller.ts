import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.ts';
import { BadRequestError, NotFoundError, handlePrismaError } from '../../lib/errors.ts';

/**
 * GET /admin/testimonials
 * Get paginated list of testimonials with search and filters
 */
export const listTestimonials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    let testimonials;
    try {
      testimonials = await prisma.testimonial.findMany({
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
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    const hasMore = testimonials.length > pageSize;
    const results = hasMore ? testimonials.slice(0, pageSize) : testimonials;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]?.id : null;
    
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
};

/**
 * PATCH /admin/testimonials/:id/status
 * Update moderation status of a single testimonial
 */
export const updateTestimonialStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED', 'FLAGGED'].includes(status)) {
      throw new BadRequestError('Invalid status. Must be APPROVED, REJECTED, or FLAGGED');
    }
    
    let testimonial;
    try {
      testimonial = await prisma.testimonial.findUnique({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    if (!testimonial) {
      throw new NotFoundError('Testimonial not found');
    }
    
    let updated;
    try {
      updated = await prisma.testimonial.update({
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
    } catch (error) {
      throw handlePrismaError(error);
    }
    
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
};

/**
 * POST /admin/testimonials/bulk-update
 * Bulk update moderation status of multiple testimonials
 */
export const bulkUpdateTestimonials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids, status, dryRun = false } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError('ids must be a non-empty array');
    }
    
    if (ids.length > 100) {
      throw new BadRequestError('Cannot update more than 100 testimonials at once');
    }
    
    if (!['APPROVED', 'REJECTED', 'FLAGGED'].includes(status)) {
      throw new BadRequestError('Invalid status. Must be APPROVED, REJECTED, or FLAGGED');
    }
    
    // Fetch testimonials to be updated
    let testimonials;
    try {
      testimonials = await prisma.testimonial.findMany({
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
    } catch (error) {
      throw handlePrismaError(error);
    }
    
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
    let result;
    try {
      result = await prisma.testimonial.updateMany({
        where: { id: { in: ids } },
        data: {
          moderationStatus: status,
          isApproved: status === 'APPROVED',
          isPublished: status === 'APPROVED',
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    return ResponseHandler.success(res, {
      data: {
        affected: result.count,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};
