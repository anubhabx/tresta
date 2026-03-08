/**
 * Test script for cron jobs
 * 
 * This script tests the cron job logic without waiting for scheduled times
 * Run with: ts-node src/scripts/test-cron-jobs.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { prisma } from '@workspace/database/prisma';
import { getRedisClient, disconnectRedis } from '../lib/redis.js';
import { REDIS_KEYS, getCurrentDateUTC } from '../lib/redis-keys.js';
import { logger } from '../lib/logger.js';
import { NotificationService } from '../services/notification.service.js';
import { checkAndAlertQuota } from '../utils/alerts.js';

const cronJobsTestLogger = logger.child({ module: 'script-test-cron-jobs' });

function ensure(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function testQuotaManagement() {
  cronJobsTestLogger.info('Testing quota management');

  const redis = getRedisClient();
  const today = getCurrentDateUTC();

  // Clear any existing quota for today
  await redis.del(REDIS_KEYS.EMAIL_QUOTA(today));
  await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
  await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);

  cronJobsTestLogger.info('Cleared existing quota keys');

  // Test 1: Normal increment
  const result1 = await NotificationService.tryIncrementEmailUsage('normal');
  cronJobsTestLogger.info({ result1 }, 'First increment result');
  ensure(result1.success === true && result1.count === 1, 'First increment should succeed');

  // Test 2: Multiple increments
  for (let i = 0; i < 159; i++) {
    await NotificationService.tryIncrementEmailUsage('normal');
  }
  const result2 = await NotificationService.tryIncrementEmailUsage('normal');
  cronJobsTestLogger.info({ result2 }, '160th email result');
  ensure(result2.success === true && result2.count === 160, '160th email should succeed');

  // Test 3: Check alert at 80%
  await checkAndAlertQuota(160);
  cronJobsTestLogger.info('Alert check at 80% completed');

  // Test 4: Increment to 200
  for (let i = 0; i < 40; i++) {
    await NotificationService.tryIncrementEmailUsage('normal');
  }
  const result4 = await NotificationService.tryIncrementEmailUsage('normal');
  cronJobsTestLogger.info({ result4 }, '201st email result');
  ensure(result4.success === false && result4.count === 200, '201st email should fail');

  // Test 5: High priority bypass
  const result5 = await NotificationService.tryIncrementEmailUsage('high');
  cronJobsTestLogger.info({ result5 }, 'High priority bypass result');
  ensure(result5.success === true && result5.count === 201, 'High priority should bypass quota');

  // Test 6: Quota lock
  await NotificationService.setQuotaLock();
  const isLocked = await NotificationService.isQuotaLocked();
  const nextRetry = await NotificationService.getNextRetryTime();
  cronJobsTestLogger.info({ isLocked, nextRetry }, 'Quota lock result');
  ensure(isLocked === true, 'Quota should be locked');

  cronJobsTestLogger.info('Quota management tests passed');
}

async function testReconciliation() {
  cronJobsTestLogger.info('Testing reconciliation');

  const redis = getRedisClient();
  const today = getCurrentDateUTC();

  // Set a test count in Redis
  await redis.set(REDIS_KEYS.EMAIL_QUOTA(today), '150');
  cronJobsTestLogger.info('Set Redis quota to 150');

  // Run snapshot
  await NotificationService.snapshotEmailUsage(today, 150);
  cronJobsTestLogger.info('Snapshot created');

  // Verify in database
  const usage = await prisma.emailUsage.findUnique({
    where: { date: today },
  });

  cronJobsTestLogger.info({ count: usage?.count, lastSnapshotCount: usage?.lastSnapshotCount }, 'Database record after reconciliation');
  ensure(usage?.count === 150, 'Count should be 150');

  cronJobsTestLogger.info('Reconciliation test passed');
}

async function testCronSchedules() {
  cronJobsTestLogger.info('Testing cron schedules');

  // Import cron jobs
  const { dailyDigestJob } = await import('../jobs/daily-digest.job.js');
  const { reconciliationJob } = await import('../jobs/reconciliation.job.js');

  // Check cron expressions
  cronJobsTestLogger.info(
    {
      dailyDigest: dailyDigestJob.cronTime.source,
      reconciliation: reconciliationJob.cronTime.source,
    },
    'Cron expressions',
  );

  ensure(dailyDigestJob.cronTime.source === '0 9 * * *', 'Daily digest should run at 9 AM UTC');
  ensure(reconciliationJob.cronTime.source === '59 23 * * *', 'Reconciliation should run at 11:59 PM UTC');

  cronJobsTestLogger.info('Cron schedule tests passed');
}

async function testDistributedLock() {
  cronJobsTestLogger.info('Testing distributed lock');

  const redis = getRedisClient();
  const lockKey = REDIS_KEYS.LOCK_DIGEST;

  // Clear any existing lock
  await redis.del(lockKey);

  // Test 1: Acquire lock
  const lock1 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
  cronJobsTestLogger.info({ lock1 }, 'First lock acquisition');
  ensure(lock1 === 'OK', 'First lock should succeed');

  // Test 2: Try to acquire again (should fail)
  const lock2 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
  cronJobsTestLogger.info({ lock2 }, 'Second lock acquisition');
  ensure(lock2 === null, 'Second lock should fail');

  // Test 3: Release lock
  await redis.del(lockKey);
  const lock3 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
  cronJobsTestLogger.info({ lock3 }, 'Lock after release');
  ensure(lock3 === 'OK', 'Lock after release should succeed');

  // Cleanup
  await redis.del(lockKey);

  cronJobsTestLogger.info('Distributed lock tests passed');
}

async function main() {
  cronJobsTestLogger.info('Starting cron job tests');

  try {
    await testQuotaManagement();
    await testReconciliation();
    await testCronSchedules();
    await testDistributedLock();

    cronJobsTestLogger.info('All cron job tests passed');
  } catch (error) {
    cronJobsTestLogger.error({ error }, 'Cron job test failed');
    process.exit(1);
  } finally {
    await disconnectRedis();
    await prisma.$disconnect();
  }
}

main();
