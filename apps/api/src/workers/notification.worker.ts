import { Worker } from 'bullmq';
import { prisma } from '@workspace/database/prisma';
import { NotificationService } from '../services/notification.service.js';
import { POP_WORKER_OPTIONS } from '../lib/worker-options.js';
import { logger } from '../lib/logger.js';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is required');
}

const notificationWorkerLogger = logger.child({ module: 'notification-worker' });

/**
 * Notification worker - processes notification delivery
 * 
 * Handles:
 * - Sending notifications via Ably (real-time)
 * - Queuing emails if applicable
 * - Updating job idempotency status
 * 
 * Rate limited to 100 jobs per minute
 */
export const createNotificationWorker = () => {
  const notificationWorker = new Worker(
    'notifications',
    async (job) => {
      const { notificationId, userId, requestId } = job.data;
      const jobLogger = notificationWorkerLogger.child({ requestId, jobId: job.id, notificationId, userId });

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        jobLogger.error('Notification not found during worker processing');
        throw new Error('Notification not found');
      }

      // Send via Ably (real-time)
      await NotificationService.sendViaAbly(userId, notification);

      // Send via email if applicable
      await NotificationService.sendViaEmail(userId, notification);

      // Update job idempotency status
      const jobKey = `notification:${notificationId}`;
      await prisma.jobIdempotency.update({
        where: { jobKey },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    },
    {
      connection: {
        url: redisUrl,
        ...(redisUrl.startsWith('rediss://') && {
          tls: { rejectUnauthorized: false },
        }),
      },
      limiter: {
        max: 100, // 100 jobs
        duration: 60000, // per minute
      },
      ...POP_WORKER_OPTIONS,
    }
  );

  notificationWorker.on('completed', (job) => {
    notificationWorkerLogger.info({ jobId: job.id, requestId: job.data?.requestId }, 'Notification sent successfully');
  });

  notificationWorker.on('failed', async (job, err) => {
    notificationWorkerLogger.error({ jobId: job?.id, requestId: job?.data?.requestId, err }, 'Notification worker job failed');

    if (!job) return;

    // Determine error type
    const errorType = err.message.includes('TRANSIENT') ? 'transient' : 'permanent';
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
        queue: 'notifications',
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

  return notificationWorker;
}

notificationWorkerLogger.info('Notification worker factory ready');
