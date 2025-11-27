import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { getRedisClient } from '../../lib/redis.js';
import { REDIS_KEYS, getCurrentDateUTC } from '../../lib/redis-keys.js';
import { ResponseHandler } from '../../lib/response.js';
import { handlePrismaError } from '../../lib/errors.js';

/**
 * GET /admin/metrics
 * Get system metrics and quota information
 */
export const getMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const redis = getRedisClient();
    const today = getCurrentDateUTC();
    
    // Get current email quota
    const emailQuota = await redis.get(REDIS_KEYS.EMAIL_QUOTA(today));
    const emailQuotaLocked = await redis.get(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    const nextRetry = await redis.get(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    
    // Get Ably connection count
    const ablyConnections = await redis.get(REDIS_KEYS.ABLY_CONNECTIONS);
    
    // Get metrics counters
    const [
      notificationsSent,
      emailsSent,
      emailsDeferred,
      emailsFailed,
    ] = await Promise.all([
      redis.get(REDIS_KEYS.METRICS_NOTIFICATIONS_SENT),
      redis.get(REDIS_KEYS.METRICS_EMAILS_SENT),
      redis.get(REDIS_KEYS.METRICS_EMAILS_DEFERRED),
      redis.get(REDIS_KEYS.METRICS_EMAILS_FAILED),
    ]);
    
    // Get last 7 days of email usage from database
    let last7Days, dlqCount, outboxPending;
    try {
      [last7Days, dlqCount, outboxPending] = await Promise.all([
        prisma.emailUsage.findMany({
          orderBy: { date: 'desc' },
          take: 7,
        }),
        prisma.deadLetterJob.count({
          where: { retried: false },
        }),
        prisma.notificationOutbox.count({
          where: { status: 'pending' },
        }),
      ]);
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.success(res, {
      data: {
        emailQuota: {
          used: parseInt(emailQuota || '0'),
          limit: 200,
          percentage: Math.round((parseInt(emailQuota || '0') / 200) * 100),
          remaining: 200 - parseInt(emailQuota || '0'),
          locked: emailQuotaLocked === '1',
          nextRetry: nextRetry || null,
        },
        ablyConnections: {
          current: parseInt(ablyConnections || '0'),
          limit: 200,
          percentage: Math.round((parseInt(ablyConnections || '0') / 200) * 100),
        },
        metrics: {
          notificationsSent: parseInt(notificationsSent || '0'),
          emailsSent: parseInt(emailsSent || '0'),
          emailsDeferred: parseInt(emailsDeferred || '0'),
          emailsFailed: parseInt(emailsFailed || '0'),
        },
        queues: {
          dlqCount,
          outboxPending,
        },
        history: last7Days,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
