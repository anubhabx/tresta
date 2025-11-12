import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.ts';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.ts';

const router: Router = Router();

/**
 * GET /admin/errors
 * Get paginated list of error logs with filters
 * 
 * Query params:
 * - cursor: Error ID for cursor-based pagination
 * - limit: Number of records per page (default: 50, max: 100)
 * - severity: Filter by severity (ERROR, WARNING, CRITICAL)
 * - type: Filter by error type
 * - startDate: Filter by start date (ISO string)
 * - endDate: Filter by end date (ISO string)
 * - search: Search query for error message/stacktrace
 * 
 * Returns:
 * - errors: Array of error log entries
 * - nextCursor: Cursor for next page (null if no more pages)
 * - hasMore: Boolean indicating if more pages exist
 */
router.get(
  '/errors',
  adminReadRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        cursor,
        limit = '50',
        severity,
        type,
        startDate,
        endDate,
        search,
      } = req.query;

      const pageSize = Math.min(parseInt(limit as string), 100);

      // Build where clause
      const where: any = {
        archived: false, // Only show non-archived errors by default
      };

      if (severity) {
        where.severity = severity;
      }

      if (type) {
        where.errorType = type;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      if (search) {
        where.OR = [
          { message: { contains: search as string, mode: 'insensitive' } },
          { stackTrace: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Fetch errors with cursor pagination
      const errors = await prisma.errorLog.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
      });

      const hasMore = errors.length > pageSize;
      const results = hasMore ? errors.slice(0, pageSize) : errors;
      const nextCursor = hasMore ? results[results.length - 1].id : null;

      return ResponseHandler.success(res, {
        data: {
          errors: results.map((error) => ({
            id: error.id,
            severity: error.severity,
            errorType: error.errorType,
            message: error.message,
            stackTrace: error.stackTrace,
            requestId: error.requestId,
            sentryEventId: error.sentryEventId,
            userId: error.userId,
            metadata: error.metadata,
            createdAt: error.createdAt,
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

export default router;
