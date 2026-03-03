import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { disconnectPrisma } from '@workspace/database/prisma';
import { disconnectRedis } from '../lib/redis.js';
import { closeAllQueues } from '../lib/queues.js';
import { startDailyDigestJob, dailyDigestJob } from '../jobs/daily-digest.job.js';
import { startReconciliationJob, reconciliationJob } from '../jobs/reconciliation.job.js';
import {
  startSubscriptionReconciliationJob,
  subscriptionReconciliationJob,
} from '../jobs/subscription-reconciliation.job.js';
import {
  scheduleWidgetAnalyticsJobs,
  performanceCheckJob,
  analyticsCleanupJob,
} from '../jobs/widget-analytics.job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

type OutboxRuntime = {
  cleanup: () => Promise<unknown>;
};

type WorkerRuntime = {
  close: () => Promise<unknown>;
};

const workers: {
  outbox?: OutboxRuntime;
  notification?: WorkerRuntime;
  email?: WorkerRuntime;
} = {};

let auditRetryInterval: NodeJS.Timeout | undefined;

async function startWorkersAndJobs(): Promise<void> {
  if (process.env.DISABLE_WORKERS === 'true') {
    console.log('⚠️ Workers and Cron Jobs are DISABLED via DISABLE_WORKERS env var.');
    return;
  }

  startDailyDigestJob();
  startReconciliationJob();
  startSubscriptionReconciliationJob();
  scheduleWidgetAnalyticsJobs();

  const { retryFailedAuditLogs } = await import('../middleware/audit-log.middleware.js');
  auditRetryInterval = setInterval(() => {
    retryFailedAuditLogs().catch((error: unknown) => {
      console.error('Audit log retry cycle failed:', error);
    });
  }, 60_000);

  const { createOutboxWorker } = await import('./outbox.worker.js');
  const { createNotificationWorker } = await import('./notification.worker.js');
  const { createEmailWorker } = await import('./email.worker.js');

  workers.outbox = createOutboxWorker();
  workers.notification = createNotificationWorker();
  workers.email = createEmailWorker();
}

async function stopWorkersAndJobs(): Promise<void> {
  try {
    dailyDigestJob.stop();
    reconciliationJob.stop();
    subscriptionReconciliationJob.stop();
    performanceCheckJob.stop();
    analyticsCleanupJob.stop();
  } catch (error) {
    console.error('Failed to stop one or more cron jobs:', error);
  }

  if (auditRetryInterval) {
    clearInterval(auditRetryInterval);
    auditRetryInterval = undefined;
  }

  if (process.env.DISABLE_WORKERS !== 'true') {
    if (workers.outbox) {
      await workers.outbox.cleanup();
    }
    if (workers.notification) {
      await workers.notification.close();
    }
    if (workers.email) {
      await workers.email.close();
    }
  }

  await closeAllQueues();
  await disconnectPrisma();
  await disconnectRedis();
}

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received, shutting down workers...`);

  try {
    await stopWorkersAndJobs();
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  void gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  void gracefulShutdown('unhandledRejection');
});

console.log('Starting workers and cron jobs...');
await startWorkersAndJobs();
console.log('Workers started successfully');
console.log('Press Ctrl+C to stop');
