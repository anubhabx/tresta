import type { Request, Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import { prisma } from '@workspace/database/prisma';
import { BadRequestError, NotFoundError, handlePrismaError } from '../../lib/errors.ts';
import { ResponseHandler } from '../../lib/response.ts';

/**
 * Get Redis connection config for BullMQ
 */
function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required');
  }

  return {
    url: redisUrl,
    ...(redisUrl.startsWith('rediss://') && {
      tls: { rejectUnauthorized: false },
    }),
  };
}

/**
 * GET /admin/dlq
 * List failed jobs in Dead Letter Queue
 */
export const listDLQJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { queue, limit = '50', errorType } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    
    const where: any = { retried: false };
    
    if (queue) {
      where.queue = queue as string;
    }
    
    if (errorType && (errorType === 'transient' || errorType === 'permanent')) {
      where.errorType = errorType;
    }
    
    let failedJobs, total;
    try {
      [failedJobs, total] = await Promise.all([
        prisma.deadLetterJob.findMany({
          where,
          orderBy: { failedAt: 'desc' },
          take: limitNum,
        }),
        prisma.deadLetterJob.count({ where }),
      ]);
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.success(res, {
      data: {
        jobs: failedJobs,
        total,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/dlq/:id/requeue
 * Requeue a failed job
 */
export const requeueJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    let failedJob;
    try {
      failedJob = await prisma.deadLetterJob.findUnique({
        where: { id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!failedJob) {
      throw new NotFoundError('Failed job not found');
    }

    if (failedJob.retried) {
      throw new BadRequestError('Job has already been retried');
    }

    // Create appropriate queue
    const queue = new Queue(failedJob.queue, {
      connection: getRedisConnection(),
    });

    // Determine job name based on queue
    const jobName = failedJob.queue === 'notifications' 
      ? 'send-notification' 
      : 'send-email';

    // Re-add to queue with retry prefix
    await queue.add(
      jobName,
      failedJob.data,
      {
        jobId: `retry-${failedJob.jobId}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );

    // Mark as retried in DLQ
    try {
      await prisma.deadLetterJob.update({
        where: { id },
        data: {
          retried: true,
          retriedAt: new Date(),
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.success(res, {
      message: 'Job requeued successfully',
      data: {
        jobId: `retry-${failedJob.jobId}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/dlq/stats
 * Get DLQ statistics
 */
export const getDLQStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let totalFailed, totalRetried, byQueue, byErrorType, recentFailures;
    try {
      [totalFailed, totalRetried, byQueue, byErrorType, recentFailures] = await Promise.all([
        prisma.deadLetterJob.count({ where: { retried: false } }),
        prisma.deadLetterJob.count({ where: { retried: true } }),
        prisma.deadLetterJob.groupBy({
          by: ['queue'],
          where: { retried: false },
          _count: true,
        }),
        prisma.deadLetterJob.groupBy({
          by: ['errorType'],
          where: { retried: false },
          _count: true,
        }),
        prisma.deadLetterJob.findMany({
          where: { retried: false },
          orderBy: { failedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            queue: true,
            errorType: true,
            failedAt: true,
            error: true,
          },
        }),
      ]);
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.success(res, {
      data: {
        totalFailed,
        totalRetried,
        byQueue: byQueue.map(q => ({ queue: q.queue, count: q._count })),
        byErrorType: byErrorType.map(e => ({ errorType: e.errorType, count: e._count })),
        recentFailures,
      },
    });
  } catch (error) {
    next(error);
  }
};
