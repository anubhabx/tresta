import type { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getAuth } from '@clerk/express';
import { getRedisClient } from '../lib/redis.ts';

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

// Admin read operations: 100 requests per minute per admin
const adminReadRateLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: 'tresta:ratelimit:admin:read',
  points: 100,
  duration: 60,
});

// Admin write operations: 30 requests per minute per admin
const adminWriteRateLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: 'tresta:ratelimit:admin:write',
  points: 30,
  duration: 60,
});

// Admin heavy operations (bulk, exports): 10 requests per 5 minutes per admin
const adminHeavyRateLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: 'tresta:ratelimit:admin:heavy',
  points: 10,
  duration: 300, // 5 minutes
});

// Public IP-based limiter: 300 requests per 5 minutes per IP
const publicIpRateLimiter = new RateLimiterRedis({
  storeClient: getRedisClient(),
  keyPrefix: 'tresta:ratelimit:public:ip',
  points: 300,
  duration: 300,
});

function getClientIp(req: Request): string {
  const forwarded = (req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for']) as string | undefined;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

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
  const { userId } = getAuth(req);

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
 * Public rate limiting middleware (IP-based)
 *
 * Limits unauthenticated/public endpoints by IP address to prevent abuse
 * while keeping limits high enough for legitimate embed traffic.
 */
export async function publicRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const clientIp = getClientIp(req);

  if (!clientIp) {
    return next();
  }

  try {
    const rateLimitRes = await publicIpRateLimiter.consume(clientIp);

    res.setHeader('X-RateLimit-Limit', '300');
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    );
    res.setHeader('X-RateLimit-Key', clientIp);

    next();
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      res.setHeader('X-RateLimit-Limit', '300');
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + error.msBeforeNext).toISOString()
      );
      res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000).toString());
      res.setHeader('X-RateLimit-Key', clientIp);

      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      console.error('Public rate limiter error:', error);
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
  const { userId } = getAuth(req);

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
    const { userId } = getAuth(req);

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

/**
 * Admin read operations rate limiting middleware
 * 
 * Limits admin users to 100 read requests per minute
 * Used for GET endpoints in admin panel
 */
export async function adminReadRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = getAuth(req);

  if (!userId) {
    return next();
  }

  try {
    const rateLimitRes = await adminReadRateLimiter.consume(userId);

    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    );

    next();
  } catch (error: any) {
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
        error: 'Too many admin read requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      console.error('Admin read rate limiter error:', error);
      next();
    }
  }
}

/**
 * Admin write operations rate limiting middleware
 * 
 * Limits admin users to 30 write requests per minute
 * Used for POST, PUT, PATCH, DELETE endpoints in admin panel
 */
export async function adminWriteRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = getAuth(req);

  if (!userId) {
    return next();
  }

  try {
    const rateLimitRes = await adminWriteRateLimiter.consume(userId);

    res.setHeader('X-RateLimit-Limit', '30');
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    );

    next();
  } catch (error: any) {
    if (error.remainingPoints !== undefined) {
      res.setHeader('X-RateLimit-Limit', '30');
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + error.msBeforeNext).toISOString()
      );
      res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000).toString());

      res.status(429).json({
        success: false,
        error: 'Too many admin write requests',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      console.error('Admin write rate limiter error:', error);
      next();
    }
  }
}

/**
 * Admin heavy operations rate limiting middleware
 * 
 * Limits admin users to 10 heavy operations per 5 minutes
 * Used for bulk operations, exports, and other resource-intensive endpoints
 */
export async function adminHeavyRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = getAuth(req);

  if (!userId) {
    return next();
  }

  try {
    const rateLimitRes = await adminHeavyRateLimiter.consume(userId);

    res.setHeader('X-RateLimit-Limit', '10');
    res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString()
    );

    next();
  } catch (error: any) {
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
        error: 'Too many heavy admin operations. Please wait before retrying.',
        retryAfter: Math.ceil(error.msBeforeNext / 1000),
      });
    } else {
      console.error('Admin heavy rate limiter error:', error);
      next();
    }
  }
}
