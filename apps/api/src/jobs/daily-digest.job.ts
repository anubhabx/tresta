import { CronJob } from 'cron';
import { prisma } from '@workspace/database/prisma';
import { Resend } from 'resend';
import { getRedisClient } from '../lib/redis.js';
import { REDIS_KEYS } from '../lib/redis-keys.js';
import { NotificationService } from '../services/notification.service.js';
import { renderDigestTemplate, renderPlainTextDigest } from '../templates/notification-email.js';
import { NotificationType } from '@workspace/database/prisma';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    console.log('🔔 Starting daily digest job...');

    const redis = getRedisClient();

    // Distributed lock to prevent concurrent digest runs (clock skew, redeploy)
    const lockKey = REDIS_KEYS.LOCK_DIGEST;
    const lockAcquired = await redis.set(lockKey, '1', 'EX', 3600, 'NX'); // 1 hour lock

    if (!lockAcquired) {
      console.log('⚠️ Digest job already running, skipping');
      return;
    }

    try {
      // Check if quota is already locked
      const quotaLocked = await NotificationService.isQuotaLocked();
      if (quotaLocked) {
        const nextRetry = await NotificationService.getNextRetryTime();
        console.log(`⚠️ Email quota locked until ${nextRetry}, skipping digest job`);
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

      console.log(`📧 Processing digest for ${users.length} users`);

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

        // Atomic check-and-increment quota
        const { success, count } = await NotificationService.tryIncrementEmailUsage('normal');

        if (!success) {
          console.log(`⚠️ Email quota exhausted (${count}/200), stopping digest job`);
          skippedCount++;

          // Lock quota for rest of day and record next retry time
          await NotificationService.setQuotaLock();
          break;
        }

        // Check if real emails are enabled
        if (process.env.ENABLE_REAL_EMAILS !== 'true') {
          console.log(`[MOCK] Digest email for ${user.email}: ${notifications.length} notifications (${count}/200)`);
          sentCount++;
          continue;
        }

        if (!resend) {
          console.error('❌ RESEND_API_KEY not configured');
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
          console.log(`✅ Digest sent to ${user.email}: ${notifications.length} notifications (${count}/200)`);

          // Check for quota alerts
          const { checkAndAlertQuota } = await import('../utils/alerts.js');
          await checkAndAlertQuota(count);
        } catch (error) {
          console.error(`❌ Failed to send digest to ${user.email}:`, error);
          // Continue with other users
        }
      }

      console.log(`✅ Daily digest job completed:`);
      console.log(`   - Sent: ${sentCount}`);
      console.log(`   - Skipped (quota): ${skippedCount}`);
      console.log(`   - No notifications: ${noNotificationsCount}`);
    } catch (error) {
      console.error('❌ Daily digest job error:', error);
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
  console.log('✅ Daily digest job scheduled (9 AM UTC)');
}
