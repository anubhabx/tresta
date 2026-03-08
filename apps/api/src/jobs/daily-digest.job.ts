import { CronJob } from 'cron';
import { prisma } from '@workspace/database/prisma';
import { Resend } from 'resend';
import { getRedisClient } from '../lib/redis.js';
import { REDIS_KEYS } from '../lib/redis-keys.js';
import { NotificationService } from '../services/notification.service.js';
import { renderDigestTemplate, renderPlainTextDigest } from '../templates/notification-email.js';
import { NotificationType } from '@workspace/database/prisma';
import {
  assertResendApiKey,
  isRealEmailDeliveryEnabled,
} from '../config/email-delivery.js';
import { logger } from '../lib/logger.js';

const realEmailEnabled = isRealEmailDeliveryEnabled();
const resend = realEmailEnabled ? new Resend(assertResendApiKey()) : null;
const dailyDigestLogger = logger.child({ module: 'daily-digest-job' });

/**
 * Daily digest job - sends batched email summaries
 * 
 * Runs at 9 AM UTC for all users with emailEnabled=true
 * Respects email quota (200/day) and implements backpressure
 * 
 * IMPORTANT: Run this on a dedicated worker dyno/process, NOT on web dyno
 * (can take >30s for many users, would timeout on Basic web dyno)
 */
export const dailyDigestJob = new CronJob(
  '0 9 * * *', // Every day at 9 AM UTC
  async () => {
    dailyDigestLogger.info('Starting daily digest job');

    const redis = getRedisClient();

    // Distributed lock to prevent concurrent digest runs (clock skew, redeploy)
    const lockKey = REDIS_KEYS.LOCK_DIGEST;
    const lockAcquired = await redis.set(lockKey, '1', 'EX', 3600, 'NX'); // 1 hour lock

    if (!lockAcquired) {
      dailyDigestLogger.warn('Digest job already running, skipping');
      return;
    }

    try {
      // Check if quota is already locked
      const quotaLocked = await NotificationService.isQuotaLocked();
      if (quotaLocked) {
        const nextRetry = await NotificationService.getNextRetryTime();
        dailyDigestLogger.warn({ nextRetry }, 'Email quota locked, skipping digest job');
        return;
      }

      // Get all users with email enabled
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            emailEnabled: true,
          },
        },
        include: {
          notificationPreferences: true,
        },
      });

  dailyDigestLogger.info({ userCount: users.length }, 'Processing daily digest');

      let sentCount = 0;
      let skippedCount = 0;
      let noNotificationsCount = 0;

      for (const user of users) {
        // Get non-critical notifications from last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const notifications = await prisma.notification.findMany({
          where: {
            userId: user.id,
            createdAt: { gte: yesterday },
            // Exclude critical types (already sent immediately)
            type: {
              notIn: [
                NotificationType.TESTIMONIAL_FLAGGED,
                NotificationType.SECURITY_ALERT
              ]
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to 50 per digest
        });

        if (notifications.length === 0) {
          noNotificationsCount++;
          continue; // Skip if no notifications
        }

        if (!realEmailEnabled) {
          dailyDigestLogger.info({ userEmail: user.email, notificationCount: notifications.length }, 'Mock digest email');
          sentCount++;
          continue;
        }

        // Atomic check-and-increment quota
        const { success, count } = await NotificationService.tryIncrementEmailUsage('normal');

        if (!success) {
          dailyDigestLogger.warn({ count }, 'Email quota exhausted, stopping digest job');
          skippedCount++;

          // Lock quota for rest of day and record next retry time
          await NotificationService.setQuotaLock();
          break;
        }

        if (!resend) {
          dailyDigestLogger.error('RESEND_API_KEY not configured');
          break;
        }

        // Send digest email
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Tresta <notifications@tresta.app>',
            to: user.email,
            subject: `Your Daily Digest - ${notifications.length} update${notifications.length > 1 ? 's' : ''}`,
            html: renderDigestTemplate(user, notifications),
            text: renderPlainTextDigest(user, notifications),
            headers: {
              'List-Unsubscribe': `<${process.env.APP_URL}/settings/notifications>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          });

          sentCount++;
          dailyDigestLogger.info(
            { userEmail: user.email, notificationCount: notifications.length, count },
            'Digest sent successfully',
          );

          // Check for quota alerts
          const { checkAndAlertQuota } = await import('../utils/alerts.js');
          await checkAndAlertQuota(count);
        } catch (error) {
          dailyDigestLogger.error({ userEmail: user.email, error }, 'Failed to send digest');
          // Continue with other users
        }
      }

      dailyDigestLogger.info(
        { sentCount, skippedCount, noNotificationsCount },
        'Daily digest job completed',
      );
    } catch (error) {
      dailyDigestLogger.error({ error }, 'Daily digest job error');
    } finally {
      // Release lock
      await redis.del(lockKey);
    }
  },
  null,
  false, // Don't start automatically
  'UTC'
);

/**
 * Start the daily digest job
 * Call this from your worker process
 */
export function startDailyDigestJob() {
  dailyDigestJob.start();
  dailyDigestLogger.info('Daily digest job scheduled (9 AM UTC)');
}
