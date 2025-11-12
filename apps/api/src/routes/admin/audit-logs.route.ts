import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.ts';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.ts';

const router: Router = Router();

/**
 * GET /admin/audit-logs
 * Get paginated list of audit logs with filters
 * 
 * Query params:
 * - cursor: Log ID for cursor-based pagination
 * - limit: Number of records per page (default: 50, max: 100)
 * - adminId: Filter by admin user ID
 * - actionType: Filter by action type (method)
 * - targetType: Filter by target type
 * - startDate: Filter by start date (ISO string)
 * - endDate: Filter by end date (ISO string)
 * - search: Search query for action/path
 * 
 * Returns:
 * - logs: Array of audit log entries
 * - nextCursor: Cursor for next page (null if no more pages)
 * - hasMore: Boolean indicating if more pages exist
 */
router.get(
  '/audit-logs',
  adminReadRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        cursor,
        limit = '50',
        adminId,
        actionType,
        targetType,
        startDate,
        endDate,
        search,
      } = req.query;

      const pageSize = Math.min(parseInt(limit as string), 100);

      // Build where clause
      const where: any = {};

      if (adminId) {
        where.adminId = adminId;
      }

      if (actionType) {
        where.method = actionType;
      }

      if (targetType) {
        where.targetType = targetType;
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
          { action: { contains: search as string, mode: 'insensitive' } },
          { path: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Fetch logs with cursor pagination
      const logs = await prisma.auditLog.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
      });

      const hasMore = logs.length > pageSize;
      const results = hasMore ? logs.slice(0, pageSize) : logs;
      const nextCursor = hasMore ? results[results.length - 1].id : null;

      return ResponseHandler.success(res, {
        data: {
          logs: results.map((log) => ({
            id: log.id,
            adminId: log.adminId,
            action: log.action,
            method: log.method,
            path: log.path,
            targetType: log.targetType,
            targetId: log.targetId,
            requestBody: log.requestBody,
            statusCode: log.statusCode,
            success: log.success,
            requestId: log.requestId,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            createdAt: log.createdAt,
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
