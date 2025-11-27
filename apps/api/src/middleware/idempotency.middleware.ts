import type { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis.js';
import { REDIS_KEYS } from '../lib/redis-keys.js';

/**
 * Idempotency middleware for webhook endpoints (Clerk retries)
 * 
 * Prevents duplicate processing of webhook events by checking Redis
 * for a key combining webhook ID and event type
 * 
 * Usage:
 * router.post('/webhook', idempotencyMiddleware, handler);
 * 
 * The middleware expects the webhook payload to have:
 * - id: Unique webhook event ID
 * - type: Event type (e.g., 'user.created', 'user.updated')
 * 
 * If the event has already been processed, returns 200 with a message
 * Otherwise, marks the event as processing and continues to the handler
 */
export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const webhookId = req.body?.id;
    const eventType = req.body?.type;

    if (!webhookId || !eventType) {
      // No idempotency key provided, continue without check
      return next();
    }

    const redis = getRedisClient();
    // Include both ID and event type to avoid suppressing legitimate updates
    const key = REDIS_KEYS.IDEMPOTENCY(webhookId, eventType);

    // Check if already processed
    const exists = await redis.get(key);
    if (exists) {
      console.log(`Webhook ${webhookId} (${eventType}) already processed (idempotent)`);
      res.status(200).json({
        success: true,
        message: 'Already processed (idempotent)',
      });
      return;
    }

    // Mark as processing (24 hour TTL)
    await redis.setex(key, 86400, '1');

    next();
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    // Don't block the request if Redis fails
    next();
  }
}
