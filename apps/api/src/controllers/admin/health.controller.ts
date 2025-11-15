import type { Request, Response, NextFunction } from 'express';
import { Queue } from 'bullmq';
import { prisma } from '@workspace/database/prisma';
import { getRedisClient } from '../../lib/redis.ts';

/**
 * GET /healthz
 * Liveness probe - is the service running?
 */
export const healthCheck = (req: Request, res: Response) => {
  res.json({ status: 'ok' });
};

/**
 * GET /readyz
 * Readiness probe - is the service ready to accept traffic?
 */
export const readinessCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const checks: Record<string, boolean> = {};
    let allHealthy = true;

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
      checks.database = false;
      allHealthy = false;
    }

    // Check Redis connection
    try {
      const redis = getRedisClient();
      await redis.ping();
      checks.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      checks.redis = false;
      allHealthy = false;
    }

    // Check BullMQ queues
    try {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        throw new Error('REDIS_URL not configured');
      }

      const notificationQueue = new Queue('notifications', {
        connection: {
          url: redisUrl,
          ...(redisUrl.startsWith('rediss://') && {
            tls: { rejectUnauthorized: false },
          }),
        },
      });

      await notificationQueue.getJobCounts();
      checks.bullmq = true;
    } catch (error) {
      console.error('BullMQ health check failed:', error);
      checks.bullmq = false;
      allHealthy = false;
    }

    const status = allHealthy ? 200 : 503;
    res.status(status).json({
      status: allHealthy ? 'ready' : 'not ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
