import { NotificationType } from '@workspace/database/prisma';
import { prisma } from '@workspace/database/prisma';
import { getRedisClient } from '../lib/redis.ts';
import { REDIS_KEYS, getTTLToMidnightUTC, getCurrentDateUTC } from '../lib/redis-keys.ts';
import { sanitizeNotificationContent, sanitizeMetadata } from '../utils/sanitize.ts';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

interface QuotaResult {
  success: boolean;
  count: number;
}

/**
 * NotificationService
 * 
 * Handles notification creation, delivery, and email quota management
 * Uses transactional outbox pattern for reliable job enqueuing
 */
export class NotificationService {
  /**
   * Atomic check-and-increment email quota using Lua script
   * 
   * This Lua script ensures:
   * - Atomic check-and-increment operation
   * - TTL set only on first increment (key creation)
   * - High priority bypasses quota limits
   * - Returns both success flag and current count
   * 
   * @param priority - 'high' for critical emails (bypasses quota), 'normal' for regular emails
   * @returns Object with success flag and current count
   * 
   * @example
   * const { success, count } = await NotificationService.tryIncrementEmailUsage('normal');
   * if (success) {
   *   // Send email
   * } else {
   *   // Quota exhausted, defer email
   * }
   */
  static async tryIncrementEmailUsage(priority: 'high' | 'normal' = 'normal'): Promise<QuotaResult> {
    const redis = getRedisClient();
    const today = getCurrentDateUTC();
    const key = REDIS_KEYS.EMAIL_QUOTA(today);
    
    // Lua script for atomic check-and-increment with TTL handling
    // This script is idempotent and safe for concurrent execution
    const luaScript = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local priority = ARGV[2]
      local ttl = tonumber(ARGV[3])
      
      -- Get current count (0 if key doesn't exist)
      local current = tonumber(redis.call('GET', key) or '0')
      local isNewKey = (current == 0)
      
      -- High priority bypasses quota
      if priority == 'high' then
        local newCount = redis.call('INCR', key)
        -- Set TTL only if this is a new key
        if isNewKey then
          redis.call('EXPIRE', key, ttl)
        end
        return {1, newCount}
      end
      
      -- Normal priority respects quota
      if current >= limit then
        return {0, current}
      end
      
      -- Increment and set TTL if new key
      local newCount = redis.call('INCR', key)
      if isNewKey then
        redis.call('EXPIRE', key, ttl)
      end
      
      return {1, newCount}
    `;
    
    // Calculate TTL to midnight UTC
    const ttl = getTTLToMidnightUTC();
    
    // Execute Lua script
    const result = await redis.eval(
      luaScript,
      1,
      key,
      '200', // limit
      priority,
      ttl.toString()
    ) as [number, number];
    
    const [success, count] = result;
    
    // Snapshot to DB every 10 emails (async, non-blocking)
    if (success && count % 10 === 0) {
      this.snapshotEmailUsage(today, count).catch(err => {
        console.error('Failed to snapshot email usage:', err);
      });
    }
    
    return { success: success === 1, count };
  }

  /**
   * Snapshot email usage to database for historical tracking
   * 
   * Called periodically (not on every email) to reduce DB load
   * Tracks lastSnapshotCount for reconciliation safety
   * 
   * @param date - Date in YYYY-MM-DD format (UTC)
   * @param count - Current email count from Redis
   */
  static async snapshotEmailUsage(date: string, count: number): Promise<void> {
    try {
      await prisma.emailUsage.upsert({
        where: { date },
        update: { 
          count,
          lastSnapshotCount: count,
        },
        create: { 
          date, 
          count,
          lastSnapshotCount: count,
        },
      });
    } catch (error) {
      console.error('Failed to snapshot email usage:', error);
      // Non-critical - Redis is source of truth
    }
  }

  /**
   * Reconcile email usage on boot (heal missed snapshots)
   * 
   * Compares Redis count with last DB snapshot and updates if needed
   * Should be called when the email worker starts
   */
  static async reconcileEmailUsageOnBoot(): Promise<void> {
    const redis = getRedisClient();
    const today = getCurrentDateUTC();
    const key = REDIS_KEYS.EMAIL_QUOTA(today);
    
    const redisCount = parseInt(await redis.get(key) || '0');
    
    if (redisCount === 0) {
      return; // No emails sent today
    }

    const dbUsage = await prisma.emailUsage.findUnique({
      where: { date: today },
    });

    if (!dbUsage || dbUsage.lastSnapshotCount < redisCount) {
      // Missed snapshots - reconcile now
      console.log(`Reconciling email usage: Redis=${redisCount}, DB=${dbUsage?.lastSnapshotCount || 0}`);
      await this.snapshotEmailUsage(today, redisCount);
    }
  }

  /**
   * Set quota lock when email quota is exhausted
   * 
   * Prevents digest job from attempting to send emails when quota is full
   * Sets lock with 1-hour TTL and stores next retry timestamp
   * 
   * @returns Next retry timestamp (ISO string)
   */
  static async setQuotaLock(): Promise<string> {
    const redis = getRedisClient();
    const nextRetryAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
    
    await redis.setex(REDIS_KEYS.EMAIL_QUOTA_LOCKED, 3600, '1');
    await redis.setex(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY, 3600, nextRetryAt);
    
    console.log(`Email quota locked until ${nextRetryAt}`);
    return nextRetryAt;
  }

  /**
   * Check if quota is currently locked
   * 
   * @returns True if quota is locked, false otherwise
   */
  static async isQuotaLocked(): Promise<boolean> {
    const redis = getRedisClient();
    const locked = await redis.get(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    return locked === '1';
  }

  /**
   * Get next retry timestamp when quota is locked
   * 
   * @returns Next retry timestamp (ISO string) or null if not locked
   */
  static async getNextRetryTime(): Promise<string | null> {
    const redis = getRedisClient();
    return await redis.get(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
  }

  /**
   * Clear quota lock (for testing or manual override)
   */
  static async clearQuotaLock(): Promise<void> {
    const redis = getRedisClient();
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_LOCKED);
    await redis.del(REDIS_KEYS.EMAIL_QUOTA_NEXT_RETRY);
    console.log('Email quota lock cleared');
  }

  /**
   * Create and send a notification using transactional outbox pattern
   * 
   * Ensures notification is never lost even if worker dies before enqueue
   * Uses Prisma transaction to create notification + outbox entry atomically
   * 
   * @param params - Notification parameters
   * @returns Created notification
   */
  static async create(params: CreateNotificationParams) {
    // Sanitize content to prevent XSS attacks
    const sanitizedParams = {
      ...params,
      title: sanitizeNotificationContent(params.title),
      message: sanitizeNotificationContent(params.message),
      metadata: params.metadata ? sanitizeMetadata(params.metadata) : undefined,
    };

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create notification
      const notification = await tx.notification.create({
        data: sanitizedParams,
      });

      // Create outbox entry in same transaction
      await tx.notificationOutbox.create({
        data: {
          notificationId: notification.id,
          jobType: 'send-notification',
          payload: {
            notificationId: notification.id,
            userId: params.userId,
            type: params.type,
          },
          status: 'pending',
        },
      });

      return notification;
    });

    // Enqueue immediately (best effort - outbox worker will catch failures)
    try {
      await this.enqueueFromOutbox(result.id);
    } catch (error) {
      console.error('Failed to enqueue notification, will be picked up by outbox worker:', error);
    }

    return result;
  }

  /**
   * Enqueue notification from outbox (idempotent)
   * 
   * Checks job idempotency and enqueues to BullMQ if not already processed
   * Updates outbox status and creates idempotency record
   * 
   * @param notificationId - Notification ID to enqueue
   */
  static async enqueueFromOutbox(notificationId: string): Promise<void> {
    const outboxEntry = await prisma.notificationOutbox.findFirst({
      where: {
        notificationId,
        status: 'pending',
      },
    });

    if (!outboxEntry) {
      return; // Already enqueued or doesn't exist
    }

    // Check job idempotency
    const jobKey = `notification:${notificationId}`;
    const existing = await prisma.jobIdempotency.findUnique({
      where: { jobKey },
    });

    if (existing && existing.status === 'completed') {
      // Already processed
      await prisma.notificationOutbox.update({
        where: { id: outboxEntry.id },
        data: { status: 'enqueued', enqueuedAt: new Date() },
      });
      return;
    }

    // Enqueue job to BullMQ
    const { Queue } = await import('bullmq');
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    const notificationQueue = new Queue('notifications', {
      connection: {
        url: redisUrl,
        ...(redisUrl.startsWith('rediss://') && {
          tls: { rejectUnauthorized: false },
        }),
      },
    });

    await notificationQueue.add(
      'send-notification',
      outboxEntry.payload,
      {
        jobId: `notification-${notificationId}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );

    // Update outbox and idempotency
    await prisma.$transaction([
      prisma.notificationOutbox.update({
        where: { id: outboxEntry.id },
        data: { status: 'enqueued', enqueuedAt: new Date() },
      }),
      prisma.jobIdempotency.upsert({
        where: { jobKey },
        create: {
          jobKey,
          jobId: `notification-${notificationId}`,
          status: 'processing',
        },
        update: {
          jobId: `notification-${notificationId}`,
          status: 'processing',
        },
      }),
    ]);
  }

  /**
   * Send notification via Ably (real-time)
   * 
   * @param userId - User ID to send notification to
   * @param notification - Notification data
   */
  static async sendViaAbly(userId: string, notification: any): Promise<void> {
    if (process.env.ENABLE_REAL_NOTIFICATIONS !== 'true') {
      console.log('[MOCK] Ably notification:', notification);
      return;
    }

    // TODO: Implement Ably integration (will implement in Phase 2)
    console.log(`Would send Ably notification to user ${userId}`);
  }

  /**
   * Send notification via email (if applicable)
   * 
   * Checks user preferences and determines if email should be sent
   * Critical events get immediate emails, non-critical go to daily digest
   * 
   * @param userId - User ID
   * @param notification - Notification data
   */
  static async sendViaEmail(userId: string, notification: any): Promise<void> {
    // Check user preferences
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs?.emailEnabled) {
      return; // User has disabled emails
    }

    // Check if critical event
    const isCritical = [
      NotificationType.TESTIMONIAL_FLAGGED,
      NotificationType.SECURITY_ALERT,
    ].includes(notification.type);

    if (isCritical) {
      // TODO: Queue immediate email (will implement when we create email worker)
      console.log(`Would queue immediate email for notification ${notification.id}`);
    }
    // Non-critical emails handled by daily digest job
  }
}
