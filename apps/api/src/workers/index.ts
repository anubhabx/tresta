/**
 * Worker process entry point
 * 
 * Starts all BullMQ workers:
 * - Outbox worker (ensures reliable job enqueuing)
 * - Notification worker (sends via Ably + queues emails)
 * - Email worker (sends emails with quota management)
 * 
 * Run this as a separate process from the web server:
 * ts-node src/workers/index.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma, disconnectPrisma } from '@workspace/database/prisma';
import { disconnectRedis } from '../lib/redis.js';
// import { outboxWorker } from './outbox.worker.js'; // Lazy load instead
// import { notificationWorker } from './notification.worker.js';
// import { emailWorker } from './email.worker.js';
import { startDailyDigestJob } from '../jobs/daily-digest.job.js';
import { startReconciliationJob } from '../jobs/reconciliation.job.js';
import { scheduleWidgetAnalyticsJobs } from '../jobs/widget-analytics.job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from apps/api directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Starting workers and cron jobs...');

if (process.env.DISABLE_WORKERS === 'true') {
  console.log('⚠️ Workers and Cron Jobs are DISABLED via DISABLE_WORKERS env var.');
  // Keep process alive to satisfy 'concurrently' or similar runners, but do nothing
  setInterval(() => { }, 100000);
} else {
  // Start workers (dynamic import to avoid connection if disabled)
  // Store cleanup functions
  const { createOutboxWorker } = await import('./outbox.worker.js');
  const { createNotificationWorker } = await import('./notification.worker.js');
  const { createEmailWorker } = await import('./email.worker.js');

  const outbox = createOutboxWorker();
  const notificationWorker = createNotificationWorker();
  const emailWorker = createEmailWorker();

  // Attach to global or let them run. We need to close them on shutdown.
  // Ideally we export a cleanup function from this module to be used by graceful shutdown,
  // but gracefulShutdown is defined in this scope, so we can access them via let variables if defined outside.
}

let activeOutbox: ReturnType<typeof import('./outbox.worker.js').createOutboxWorker> | undefined;
let activeNotificationWorker: any; // Type inference tricky with dynamic import
let activeEmailWorker: any;

// To handle scope properly, we might need to restructure a bit, but for now let's just make the startup block assign to module-level vars? 
// No, top-level await is used here inside the else block.
// Let's rely on the fact that existing logic used await import inside shutdown.
// But now we instantiated them! We can't just import and expect to find "outboxWorker" exported.
// We must capture the instances.

// REDOING logic:
// We need to store instances to close them.
// Let's use a global object or simple let variables in this module scope.
const workers: any = {};

if (process.env.DISABLE_WORKERS !== 'true') {
  startDailyDigestJob();
  startReconciliationJob();
  scheduleWidgetAnalyticsJobs();

  const { createOutboxWorker } = await import('./outbox.worker.js');
  const { createNotificationWorker } = await import('./notification.worker.js');
  const { createEmailWorker } = await import('./email.worker.js');

  workers.outbox = createOutboxWorker();
  workers.notification = createNotificationWorker();
  workers.email = createEmailWorker();
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down workers...`);

  try {
    // Stop cron jobs
    const { dailyDigestJob } = await import('../jobs/daily-digest.job.js');
    const { reconciliationJob } = await import('../jobs/reconciliation.job.js');
    const { performanceCheckJob, analyticsCleanupJob } = await import('../jobs/widget-analytics.job.js');
    dailyDigestJob.stop();
    reconciliationJob.stop();
    performanceCheckJob.stop();
    analyticsCleanupJob.stop();
    console.log('Cron jobs stopped');

    if (process.env.DISABLE_WORKERS !== 'true') {
      // Close workers
      if (workers.outbox) await workers.outbox.cleanup();
      if (workers.notification) await workers.notification.close();
      if (workers.email) await workers.email.close();

      console.log('Workers closed');
    }

    // Disconnect from databases
    await disconnectPrisma();
    await disconnectRedis();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

console.log('Workers started successfully');
console.log('Press Ctrl+C to stop');
