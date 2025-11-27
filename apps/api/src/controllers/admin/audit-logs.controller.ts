import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.js';
import { handlePrismaError } from '../../lib/errors.js';

/**
 * GET /admin/audit-logs
 * Get paginated list of audit logs with filters
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    let logs;
    try {
      logs = await prisma.auditLog.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    const hasMore = logs.length > pageSize;
    const results = hasMore ? logs.slice(0, pageSize) : logs;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]?.id : null;

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
};
