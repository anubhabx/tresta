/**
 * Test daily digest job logic
 * 
 * This script manually triggers the digest job logic to verify it works
 * Run with: ts-node src/scripts/test-digest-logic.ts
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
import { NotificationType } from '@workspace/database/prisma';

async function testDigestLogic() {
  console.log('🧪 Testing Daily Digest Logic...\n');
  
  const redis = getRedisClient();
  const today = getCurrentDateUTC();
  
  try {
    // Setup: Clear quota and locks
    console.log('1. Setting up test environment...');
    await redis.del(REDIS_KEYS.EMAIL_QUOTA(today));
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    await redis.del(REDIS_KEYS.LOCK_DIGEST);
    console.log('   ✅ Environment cleared\n');
    
    // Test 1: Distributed lock
    console.log('2. Testing distributed lock...');
    const lockKey = REDIS_KEYS.LOCK_DIGEST;
    const lock1 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
    console.log(`   First lock: ${lock1}`);
    
    const lock2 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
    console.log(`   Second lock (should fail): ${lock2}`);
    
    if (lock1 !== 'OK' || lock2 !== null) {
      throw new Error('Distributed lock test failed');
    }
    
    await redis.del(lockKey);
    console.log('   ✅ Distributed lock works correctly\n');
    
    // Test 2: Quota lock check
    console.log('3. Testing quota lock check...');
    const isLocked1 = await NotificationService.isQuotaLocked();
    console.log(`   Quota locked (should be false): ${isLocked1}`);
    
    await NotificationService.setQuotaLock();
    const isLocked2 = await NotificationService.isQuotaLocked();
    const nextRetry = await NotificationService.getNextRetryTime();
    console.log(`   Quota locked (should be true): ${isLocked2}`);
    console.log(`   Next retry: ${nextRetry}`);
    
    if (isLocked1 !== false || isLocked2 !== true) {
      throw new Error('Quota lock check failed');
    }
    
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    console.log('   ✅ Quota lock check works correctly\n');
    
    // Test 3: Find users with email enabled
    console.log('4. Testing user query...');
    const users = await prisma.user.findMany({
      where: {
        notificationPreferences: {
          emailEnabled: true,
        },
      },
      include: {
        notificationPreferences: true,
      },
      take: 5, // Limit for testing
    });
    console.log(`   Found ${users.length} users with email enabled`);
    console.log('   ✅ User query works correctly\n');
    
    // Test 4: Query notifications (if users exist)
    if (users.length > 0) {
      console.log('5. Testing notification query...');
      const testUser = users[0];

      if (!testUser) {
        console.log('   ⚠️ Unable to load a sample user; skipping notification query test');
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const notifications = await prisma.notification.findMany({
          where: {
            userId: testUser.id,
            createdAt: { gte: yesterday },
            type: {
              notIn: [
                NotificationType.TESTIMONIAL_FLAGGED,
                NotificationType.SECURITY_ALERT,
              ],
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        console.log(`   Found ${notifications.length} notifications for user ${testUser.email}`);
        console.log('   ✅ Notification query works correctly\n');
      }
    }
    
    // Test 5: Quota increment
    console.log('6. Testing quota increment...');
    const result1 = await NotificationService.tryIncrementEmailUsage('normal');
    console.log(`   First increment: success=${result1.success}, count=${result1.count}`);
    
    const result2 = await NotificationService.tryIncrementEmailUsage('normal');
    console.log(`   Second increment: success=${result2.success}, count=${result2.count}`);
    
    if (!result1.success || !result2.success || result2.count !== 2) {
      throw new Error('Quota increment test failed');
    }
    console.log('   ✅ Quota increment works correctly\n');
    
    // Test 6: Quota exhaustion
    console.log('7. Testing quota exhaustion...');
    await redis.set(REDIS_KEYS.EMAIL_QUOTA(today), '200');
    const result3 = await NotificationService.tryIncrementEmailUsage('normal');
    console.log(`   At limit: success=${result3.success}, count=${result3.count}`);
    
    if (result3.success !== false || result3.count !== 200) {
      throw new Error('Quota exhaustion test failed');
    }
    console.log('   ✅ Quota exhaustion works correctly\n');
    
    // Test 7: High priority bypass
    console.log('8. Testing high priority bypass...');
    const result4 = await NotificationService.tryIncrementEmailUsage('high');
    console.log(`   High priority: success=${result4.success}, count=${result4.count}`);
    
    if (!result4.success || result4.count !== 201) {
      throw new Error('High priority bypass test failed');
    }
    console.log('   ✅ High priority bypass works correctly\n');
    
    console.log('🎉 All digest logic tests passed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await redis.del(REDIS_KEYS.EMAIL_QUOTA(today));
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    await redis.del(REDIS_KEYS.LOCK_DIGEST);
    await disconnectRedis();
    await prisma.$disconnect();
  }
}

testDigestLogic();
