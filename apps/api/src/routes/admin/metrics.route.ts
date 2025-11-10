import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { getRedisClient } from '../../lib/redis.ts';
import { REDIS_KEYS, getCurrentDateUTC } from '../../lib/redis-keys.ts';
import { ResponseHandler } from '../../lib/response.ts';

const router: Router = Router();

/**
 * GET /admin/metrics
 * Get system metrics and quota information
 * 
 * Returns:
 * - Email quota usage (current day)
 * - Ably connection count
 * - Metrics counters
 * - Last 7 days of email usage history
 * 
 * Requires admin authentication (should be added via middleware)
 */
router.get(
  '/metrics',
  async (req: Request, res: Response, next: NextFunction) => {
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
      const last7Days = await prisma.emailUsage.findMany({
        orderBy: { date: 'desc' },
        take: 7,
      });

      // Get DLQ stats
      const dlqCount = await prisma.deadLetterJob.count({
        where: { retried: false },
      });

      // Get outbox stats
      const outboxPending = await prisma.notificationOutbox.count({
        where: { status: 'pending' },
      });

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
  }
);

export default router;
