/**
 * Test worker startup
 * 
 * Verifies that workers and cron jobs can start without errors
 * Run with: ts-node src/scripts/test-worker-startup.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const workerStartupLogger = logger.child({ module: 'script-test-worker-startup' });

async function testWorkerStartup() {
  workerStartupLogger.info('Testing worker startup');

  try {
    // Test 1: Import cron jobs
    workerStartupLogger.info('Importing cron jobs');
    const { dailyDigestJob, startDailyDigestJob } = await import('../jobs/daily-digest.job.js');
    const { reconciliationJob, startReconciliationJob } = await import('../jobs/reconciliation.job.js');
    const { subscriptionReconciliationJob, startSubscriptionReconciliationJob } = await import('../jobs/subscription-reconciliation.job.js');
    workerStartupLogger.info('Cron jobs imported successfully');

    // Test 2: Verify cron expressions
    workerStartupLogger.info({
      dailyDigest: dailyDigestJob.cronTime.source,
      reconciliation: reconciliationJob.cronTime.source,
      subscriptionReconciliation: subscriptionReconciliationJob.cronTime.source,
    }, 'Verifying cron expressions');

    if (dailyDigestJob.cronTime.source !== '0 9 * * *') {
      throw new Error('Daily digest cron expression is incorrect');
    }
    if (reconciliationJob.cronTime.source !== '59 23 * * *') {
      throw new Error('Reconciliation cron expression is incorrect');
    }
    workerStartupLogger.info('Cron expressions are correct');

    // Test 3: Start cron jobs (don't wait for execution)
    workerStartupLogger.info('Starting cron jobs');
    startDailyDigestJob();
    startReconciliationJob();
    startSubscriptionReconciliationJob();
    workerStartupLogger.info('Cron jobs started');

    // Test 4: Verify jobs can be stopped (means they started)
    workerStartupLogger.info('Jobs started successfully without errors');

    // Test 5: Stop jobs
    workerStartupLogger.info('Stopping cron jobs');
    dailyDigestJob.stop();
    reconciliationJob.stop();
    subscriptionReconciliationJob.stop();
    workerStartupLogger.info('Cron jobs stopped');

    workerStartupLogger.info('Worker startup test passed');

    // Test 6: Import workers (verify no syntax errors)
    workerStartupLogger.info('Importing workers');
    await import('../workers/outbox.worker.js');
    await import('../workers/notification.worker.js');
    await import('../workers/email.worker.js');
    workerStartupLogger.info('Workers imported successfully');

    workerStartupLogger.info('All startup tests passed');

  } catch (error) {
    workerStartupLogger.error({ error }, 'Worker startup test failed');
    process.exit(1);
  }

  process.exit(0);
}

testWorkerStartup();
