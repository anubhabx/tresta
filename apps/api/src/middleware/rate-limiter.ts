import type { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from '../lib/redis.ts';
import { REDIS_KEYS, REDIS_TTL } from '../lib/redis-keys.ts';

/**
 * Rate limiter instances
 * Using rate-limiter-flexible with Redis backend for distributed rate limiting
 */

// API rate limiter: 100 requests per minute per user
const apiRateLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: 'tresta:ratelimit:api:notifications',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Email rate limiter: 10 emails per hour per user
const emailRateLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: 'tresta:ratelimit:email',
  points: 10,
  duration: 3600, // Per hour
});

/**
 * Express middleware for API rate limiting
 * 
 * Limits authenticated users to 100 requests per minute
 * Adds standard rate limit headers to responses
 * Returns 429 with Retry-After header when limit exceeded
 * 
 * Usage:
 * router.get('/api/notifications', rateLimitMiddleware, handler);
 */
export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.auth?.userId;

  if (!userId) {
    // Skip rate limiting for unauthenticated requests
    return next();
  }

  try {
    const rateLimitRes = await apiRateLimiter.consume(userId);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    );

    next();
  } catch (error: any) {
    // Rate limit exceeded
    if (error.remainingPoints !== undefined) {
      res.setHeader('X-RateLimit-Limit', '100');
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + error.msBeforeNext).toISOString()
      );
      res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000).toString());

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      // Redis error - don't block the request
      console.error('Rate limiter error:', error);
      next();
    }
  }
}

/**
 * Email rate limiting middleware
 * 
 * Limits users to 10 email-triggering actions per hour
 * Used for endpoints that trigger immediate emails
 * 
 * Usage:
 * router.post('/api/notifications/send-email', emailRateLimitMiddleware, handler);
 */
export async function emailRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.auth?.userId;

  if (!userId) {
    return next();
  }

  try {
    const rateLimitRes = await emailRateLimiter.consume(userId);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', '10');
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    );

    next();
  } catch (error: any) {
    // Rate limit exceeded
    if (error.remainingPoints !== undefined) {
      res.setHeader('X-RateLimit-Limit', '10');
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + error.msBeforeNext).toISOString()
      );
      res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000).toString());

      res.status(429).json({
        success: false,
        error: 'Too many email requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      // Redis error - don't block the request
      console.error('Email rate limiter error:', error);
      next();
    }
  }
}

/**
 * Create a custom rate limiter with specific limits
 * 
 * @param points - Number of requests allowed
 * @param duration - Time window in seconds
 * @param keyPrefix - Redis key prefix
 * @returns Rate limiter middleware
 * 
 * @example
 * const strictLimiter = createRateLimiter(10, 60, 'strict');
 * router.post('/api/sensitive', strictLimiter, handler);
 */
export function createRateLimiter(
  points: number,
  duration: number,
  keyPrefix: string
) {
  const limiter = new RateLimiterRedis({
    storeClient: getRedisClient(),
    keyPrefix: `tresta:ratelimit:${keyPrefix}`,
    points,
    duration,
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.auth?.userId;

    if (!userId) {
      return next();
    }

    try {
      const rateLimitRes = await limiter.consume(userId);

      res.setHeader('X-RateLimit-Limit', points.toString());
      res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
      );

      next();
    } catch (error: any) {
      if (error.remainingPoints !== undefined) {
        res.setHeader('X-RateLimit-Limit', points.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader(
          'X-RateLimit-Reset',
          new Date(Date.now() + error.msBeforeNext).toISOString()
        );
        res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000).toString());

        res.status(429).json({
          success: false,
          error: 'Too many requests',
          retryAfter: Math.ceil(error.msBeforeNext / 1000),
        });
      } else {
        console.error('Rate limiter error:', error);
        next();
      }
    }
  };
}
