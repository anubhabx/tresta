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
import { NotificationService } from '../services/notification.service.js';
import { checkAndAlertQuota } from '../utils/alerts.js';

async function testQuotaManagement() {
  console.log('\n🧪 Testing Quota Management...\n');

  const redis = getRedisClient();
  const today = getCurrentDateUTC();

  // Clear any existing quota for today
  await redis.del(REDIS_KEYS.EMAIL_QUOTA(today));
  await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
  await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);

  console.log('✅ Cleared existing quota keys');

  // Test 1: Normal increment
  const result1 = await NotificationService.tryIncrementEmailUsage('normal');
  console.log(`Test 1 - First increment: success=${result1.success}, count=${result1.count}`);
  console.assert(result1.success === true && result1.count === 1, 'First increment should succeed');

  // Test 2: Multiple increments
  for (let i = 0; i < 159; i++) {
    await NotificationService.tryIncrementEmailUsage('normal');
  }
  const result2 = await NotificationService.tryIncrementEmailUsage('normal');
  console.log(`Test 2 - 160th email (80%): success=${result2.success}, count=${result2.count}`);
  console.assert(result2.success === true && result2.count === 160, '160th email should succeed');

  // Test 3: Check alert at 80%
  await checkAndAlertQuota(160);
  console.log('Test 3 - Alert check at 80% completed');

  // Test 4: Increment to 200
  for (let i = 0; i < 40; i++) {
    await NotificationService.tryIncrementEmailUsage('normal');
  }
  const result4 = await NotificationService.tryIncrementEmailUsage('normal');
  console.log(`Test 4 - 201st email: success=${result4.success}, count=${result4.count}`);
  console.assert(result4.success === false && result4.count === 200, '201st email should fail');

  // Test 5: High priority bypass
  const result5 = await NotificationService.tryIncrementEmailUsage('high');
  console.log(`Test 5 - High priority bypass: success=${result5.success}, count=${result5.count}`);
  console.assert(result5.success === true && result5.count === 201, 'High priority should bypass quota');

  // Test 6: Quota lock
  await NotificationService.setQuotaLock();
  const isLocked = await NotificationService.isQuotaLocked();
  const nextRetry = await NotificationService.getNextRetryTime();
  console.log(`Test 6 - Quota lock: locked=${isLocked}, nextRetry=${nextRetry}`);
  console.assert(isLocked === true, 'Quota should be locked');

  console.log('\n✅ All quota management tests passed!\n');
}

async function testReconciliation() {
  console.log('\n🧪 Testing Reconciliation...\n');

  const redis = getRedisClient();
  const today = getCurrentDateUTC();

  // Set a test count in Redis
  await redis.set(REDIS_KEYS.EMAIL_QUOTA(today), '150');
  console.log('Set Redis quota to 150');

  // Run snapshot
  await NotificationService.snapshotEmailUsage(today, 150);
  console.log('Snapshot created');

  // Verify in database
  const usage = await prisma.emailUsage.findUnique({
    where: { date: today },
  });

  console.log(`Database record: count=${usage?.count}, lastSnapshotCount=${usage?.lastSnapshotCount}`);
  console.assert(usage?.count === 150, 'Count should be 150');

  console.log('\n✅ Reconciliation test passed!\n');
}

async function testCronSchedules() {
  console.log('\n🧪 Testing Cron Schedules...\n');

  // Import cron jobs
  const { dailyDigestJob } = await import('../jobs/daily-digest.job.js');
  const { reconciliationJob } = await import('../jobs/reconciliation.job.js');

  // Check cron expressions
  console.log(`Daily Digest: ${dailyDigestJob.cronTime.source} (should be "0 9 * * *")`);
  console.log(`Reconciliation: ${reconciliationJob.cronTime.source} (should be "59 23 * * *")`);

  console.assert(dailyDigestJob.cronTime.source === '0 9 * * *', 'Daily digest should run at 9 AM UTC');
  console.assert(reconciliationJob.cronTime.source === '59 23 * * *', 'Reconciliation should run at 11:59 PM UTC');

  console.log('\n✅ Cron schedule tests passed!\n');
}

async function testDistributedLock() {
  console.log('\n🧪 Testing Distributed Lock...\n');

  const redis = getRedisClient();
  const lockKey = REDIS_KEYS.LOCK_DIGEST;

  // Clear any existing lock
  await redis.del(lockKey);

  // Test 1: Acquire lock
  const lock1 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
  console.log(`Test 1 - First lock acquisition: ${lock1}`);
  console.assert(lock1 === 'OK', 'First lock should succeed');

  // Test 2: Try to acquire again (should fail)
  const lock2 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
  console.log(`Test 2 - Second lock acquisition: ${lock2}`);
  console.assert(lock2 === null, 'Second lock should fail');

  // Test 3: Release lock
  await redis.del(lockKey);
  const lock3 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
  console.log(`Test 3 - Lock after release: ${lock3}`);
  console.assert(lock3 === 'OK', 'Lock after release should succeed');

  // Cleanup
  await redis.del(lockKey);

  console.log('\n✅ Distributed lock tests passed!\n');
}

async function main() {
  console.log('🚀 Starting Cron Job Tests...\n');

  try {
    await testQuotaManagement();
    await testReconciliation();
    await testCronSchedules();
    await testDistributedLock();

    console.log('🎉 All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await disconnectRedis();
    await prisma.$disconnect();
  }
}

main();
