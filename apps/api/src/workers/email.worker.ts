import { Worker } from 'bullmq';
import { Resend } from 'resend';
import { prisma } from '@workspace/database/prisma';
import { NotificationService } from '../services/notification.service.ts';
import { getRedisClient } from '../lib/redis.ts';

const redisUrl = process.env.REDIS_URL;
const resendApiKey = process.env.RESEND_API_KEY;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is required');
}

if (!resendApiKey) {
  console.warn('RESEND_API_KEY not configured - email sending will be mocked');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Email worker - processes email sending with quota management
 * 
 * Handles:
 * - Atomic quota check and increment
 * - Email sending via Resend
 * - Quota alerts
 * - Transient vs permanent error handling
 * 
 * Rate limited to 10 emails per minute (matches Resend free tier)
 */
export const emailWorker = new Worker(
  'send-email',
  async (job) => {
    const { userId, notificationId, priority = 'normal' } = job.data;

    // Atomic check-and-increment quota (Lua script)
    const { success, count } = await NotificationService.tryIncrementEmailUsage(priority);
    
    if (!success) {
      console.log(`Email quota exhausted (${count}/200), deferring email ${notificationId}`);
      // Don't retry quota failures - will be picked up by next day's digest
      throw new Error('QUOTA_EXCEEDED');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if real emails are enabled
    if (process.env.ENABLE_REAL_EMAILS !== 'true') {
      console.log('[MOCK] Email:', {
        to: notification.user.email,
        subject: notification.title,
        notificationId,
        count: `${count}/200`,
      });
      return;
    }

    if (!resend) {
      throw new Error('RESEND_API_KEY not configured');
    }

    try {
      // TODO: Implement email templates
      // For now, send a simple email
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Tresta <notifications@tresta.app>',
        to: notification.user.email,
        subject: notification.title,
        html: `
          <div>
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.link ? `<a href="${notification.link}">View Details</a>` : ''}
          </div>
        `,
        text: `${notification.title}\n\n${notification.message}${notification.link ? `\n\nView Details: ${notification.link}` : ''}`,
        headers: {
          'List-Unsubscribe': `<${process.env.APP_URL}/settings/notifications>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      // Check for quota alerts
      await checkAndAlertQuota(count);
      
      console.log(`Email sent successfully: ${notificationId} (${count}/200 today)`);
    } catch (error: any) {
      // Distinguish between transient and permanent failures
      if (error.statusCode === 429 || error.statusCode >= 500) {
        // Transient error - retry with backoff
        throw new Error(`TRANSIENT_ERROR: ${error.message}`);
      } else {
        // Permanent error (invalid email, etc.) - don't retry
        console.error(`Permanent email error for ${notificationId}:`, error);
        throw new Error(`PERMANENT_ERROR: ${error.message}`);
      }
    }
  },
  {
    connection: {
      url: redisUrl,
      ...(redisUrl.startsWith('rediss://') && {
        tls: { rejectUnauthorized: false },
      }),
    },
    limiter: {
      max: 10, // 10 emails per minute (matches Resend free tier)
      duration: 60000,
    },
    settings: {
      backoffStrategy: (attemptsMade: number) => {
        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        return Math.min(Math.pow(2, attemptsMade) * 1000, 30000);
      },
    },
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Email ${job.id} sent successfully`);
});

emailWorker.on('failed', async (job, err) => {
  console.error(`Email ${job?.id} failed:`, err);
  
  // Don't persist quota failures to DLQ (expected behavior)
  if (err.message.includes('QUOTA_EXCEEDED')) {
    return;
  }
  
  if (!job) return;

  // Determine error type and extract metadata
  const errorType = err.message.includes('TRANSIENT_ERROR') ? 'transient' : 'permanent';
  const statusCode = (err as any).statusCode || null;
  const providerResponse = (err as any).response 
    ? JSON.stringify((err as any).response).substring(0, 1000)
    : null;
  
  // Build retry history
  const retryHistory = job.attemptsMade 
    ? Array.from({ length: job.attemptsMade }, (_, i) => ({
        attempt: i + 1,
        timestamp: new Date().toISOString(),
      }))
    : [];
  
  // Persist to DLQ with detailed metadata
  await prisma.deadLetterJob.create({
    data: {
      jobId: job.id!,
      queue: 'send-email',
      data: job.data,
      error: err.message,
      errorType,
      statusCode,
      providerResponse,
      retryHistory,
      failedAt: new Date(),
    },
  });
});

/**
 * Check email quota and send alerts at key thresholds
 */
async function checkAndAlertQuota(count: number): Promise<void> {
  // Alert at 80% (160 emails)
  if (count === 160) {
    console.warn(`⚠️ Email quota at 80% (${count}/200)`);
    // TODO: Implement Slack alerts
  }
  
  // Alert at 90% (180 emails)
  if (count === 180) {
    console.warn(`⚠️ Email quota at 90% (${count}/200) - approaching limit`);
    // TODO: Implement Slack alerts
  }
  
  // Alert at 100% (200 emails)
  if (count === 200) {
    console.warn(`🚨 Email quota exhausted (200/200) - non-critical emails deferred`);
    // TODO: Implement Slack alerts
  }
}

// Call reconciliation on boot
NotificationService.reconcileEmailUsageOnBoot()
  .then(() => console.log('Email usage reconciliation completed'))
  .catch(err => console.error('Email usage reconciliation failed:', err));

console.log('Email worker started');
