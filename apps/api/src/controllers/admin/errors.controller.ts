import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.js';
import { handlePrismaError } from '../../lib/errors.js';

/**
 * GET /admin/errors
 * Get paginated list of error logs with filters
 */
export const getErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      archived: false,
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
    let errors;
    try {
      errors = await prisma.errorLog.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    const hasMore = errors.length > pageSize;
    const results = hasMore ? errors.slice(0, pageSize) : errors;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]?.id : null;

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
};
