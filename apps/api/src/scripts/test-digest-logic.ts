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
import { logger } from '../lib/logger.js';
import { NotificationService } from '../services/notification.service.js';
import { NotificationType } from '@workspace/database/prisma';

const digestLogicLogger = logger.child({ module: 'script-test-digest-logic' });

async function testDigestLogic() {
  digestLogicLogger.info('Testing daily digest logic');
  
  const redis = getRedisClient();
  const today = getCurrentDateUTC();
  
  try {
    // Setup: Clear quota and locks
    digestLogicLogger.info('Setting up test environment');
    await redis.del(REDIS_KEYS.EMAIL_QUOTA(today));
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    await redis.del(REDIS_KEYS.LOCK_DIGEST);
    digestLogicLogger.info('Environment cleared');
    
    // Test 1: Distributed lock
    digestLogicLogger.info('Testing distributed lock');
    const lockKey = REDIS_KEYS.LOCK_DIGEST;
    const lock1 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
    digestLogicLogger.info({ lock1 }, 'First lock result');
    
    const lock2 = await redis.set(lockKey, '1', 'EX', 3600, 'NX');
    digestLogicLogger.info({ lock2 }, 'Second lock result');
    
    if (lock1 !== 'OK' || lock2 !== null) {
      throw new Error('Distributed lock test failed');
    }
    
    await redis.del(lockKey);
    digestLogicLogger.info('Distributed lock works correctly');
    
    // Test 2: Quota lock check
    digestLogicLogger.info('Testing quota lock check');
    const isLocked1 = await NotificationService.isQuotaLocked();
    digestLogicLogger.info({ isLocked1 }, 'Initial quota lock state');
    
    await NotificationService.setQuotaLock();
    const isLocked2 = await NotificationService.isQuotaLocked();
    const nextRetry = await NotificationService.getNextRetryTime();
    digestLogicLogger.info({ isLocked2, nextRetry }, 'Quota lock state after locking');
    
    if (isLocked1 !== false || isLocked2 !== true) {
      throw new Error('Quota lock check failed');
    }
    
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    digestLogicLogger.info('Quota lock check works correctly');
    
    // Test 3: Find users with email enabled
    digestLogicLogger.info('Testing user query');
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
    digestLogicLogger.info({ userCount: users.length }, 'User query works correctly');
    
    // Test 4: Query notifications (if users exist)
    if (users.length > 0) {
      digestLogicLogger.info('Testing notification query');
      const testUser = users[0];

      if (!testUser) {
        digestLogicLogger.warn('Unable to load a sample user; skipping notification query test');
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

        digestLogicLogger.info(
          { notificationCount: notifications.length, userEmail: testUser.email },
          'Notification query works correctly',
        );
      }
    }
    
    // Test 5: Quota increment
    digestLogicLogger.info('Testing quota increment');
    const result1 = await NotificationService.tryIncrementEmailUsage('normal');
    digestLogicLogger.info({ result1 }, 'First increment result');
    
    const result2 = await NotificationService.tryIncrementEmailUsage('normal');
    digestLogicLogger.info({ result2 }, 'Second increment result');
    
    if (!result1.success || !result2.success || result2.count !== 2) {
      throw new Error('Quota increment test failed');
    }
    digestLogicLogger.info('Quota increment works correctly');
    
    // Test 6: Quota exhaustion
    digestLogicLogger.info('Testing quota exhaustion');
    await redis.set(REDIS_KEYS.EMAIL_QUOTA(today), '200');
    const result3 = await NotificationService.tryIncrementEmailUsage('normal');
    digestLogicLogger.info({ result3 }, 'Quota exhaustion result');
    
    if (result3.success !== false || result3.count !== 200) {
      throw new Error('Quota exhaustion test failed');
    }
    digestLogicLogger.info('Quota exhaustion works correctly');
    
    // Test 7: High priority bypass
    digestLogicLogger.info('Testing high priority bypass');
    const result4 = await NotificationService.tryIncrementEmailUsage('high');
    digestLogicLogger.info({ result4 }, 'High priority result');
    
    if (!result4.success || result4.count !== 201) {
      throw new Error('High priority bypass test failed');
    }
    digestLogicLogger.info('High priority bypass works correctly');
    
    digestLogicLogger.info('All digest logic tests passed');
    
  } catch (error) {
    digestLogicLogger.error({ error }, 'Digest logic test failed');
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
