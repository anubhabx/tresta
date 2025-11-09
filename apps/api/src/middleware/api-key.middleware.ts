/**
 * API Key Authentication Middleware
 * Validates API keys and attaches authorization data to requests
 */

import type { Request, Response, NextFunction } from 'express';
import { validateApiKey, incrementUsage } from '../services/api-key.service.ts';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.ts';
import type { ApiKey } from '@workspace/database/prisma';

/**
 * Rate limiter storage (in-memory)
 * In production, consider using Redis for distributed rate limiting
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for an API key
 */
function checkRateLimit(apiKey: ApiKey): { allowed: boolean; resetAt?: number } {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const resetAt = now + hourInMs;
  
  const entry = rateLimitStore.get(apiKey.id);
  
  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    rateLimitStore.set(apiKey.id, {
      count: 1,
      resetAt,
    });
    return { allowed: true };
  }
  
  // Check if limit exceeded
  if (entry.count >= apiKey.rateLimit) {
    return { allowed: false, resetAt: entry.resetAt };
  }
  
  // Increment count
  entry.count++;
  return { allowed: true };
}

/**
 * Extend Express Request type with API key data
 */
declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      apiKeyPermissions?: Record<string, boolean>;
    }
  }
}

/**
 * Middleware to validate API key from Authorization header
 * Usage: router.get('/protected', validateApiKeyMiddleware, handler)
 */
export async function validateApiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError('API key is required. Please provide an API key in the Authorization header.');
    }
    
    // Support both "Bearer token" and direct key format
    const apiKey = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    
    if (!apiKey) {
      throw new UnauthorizedError('Invalid API key format');
    }
    
    // Validate the API key
    const validation = await validateApiKey(apiKey);
    
    if (!validation.isValid || !validation.apiKey) {
      throw new UnauthorizedError(validation.reason || 'Invalid API key');
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(validation.apiKey);
    
    if (!rateLimit.allowed) {
      const resetInSeconds = rateLimit.resetAt 
        ? Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        : 3600;
      
      res.setHeader('Retry-After', resetInSeconds.toString());
      res.setHeader('X-RateLimit-Limit', validation.apiKey.rateLimit.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', rateLimit.resetAt?.toString() || '');
      
      throw new ForbiddenError(
        `Rate limit exceeded. You can make ${validation.apiKey.rateLimit} requests per hour. Please try again in ${resetInSeconds} seconds.`
      );
    }
    
    // Set rate limit headers
    const entry = rateLimitStore.get(validation.apiKey.id);
    if (entry) {
      res.setHeader('X-RateLimit-Limit', validation.apiKey.rateLimit.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, validation.apiKey.rateLimit - entry.count).toString());
      res.setHeader('X-RateLimit-Reset', entry.resetAt.toString());
    }
    
    // Increment usage count asynchronously (don't wait for it)
    incrementUsage(validation.apiKey.id).catch(err => {
      console.error('Failed to increment API key usage:', err);
    });
    
    // Attach API key data to request
    req.apiKey = validation.apiKey;
    req.apiKeyPermissions = (validation.apiKey.permissions as Record<string, boolean>) || {};
    
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check if API key has a specific permission
 * Usage: router.get('/widgets', validateApiKeyMiddleware, requirePermission('widgets'), handler)
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.apiKey) {
        throw new UnauthorizedError('API key validation required');
      }
      
      const permissions = req.apiKeyPermissions || {};
      
      if (!permissions[permission]) {
        throw new ForbiddenError(`API key does not have permission: ${permission}`);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if API key belongs to a specific project
 * Usage: router.get('/widgets/:widgetId', validateApiKeyMiddleware, requireProjectAccess('widgetId'), handler)
 */
export function requireProjectAccess(projectIdParam: string = 'projectId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.apiKey) {
        throw new UnauthorizedError('API key validation required');
      }
      
      // Get project ID from route params or query
      const projectId = req.params[projectIdParam] || req.query[projectIdParam];
      
      if (!projectId) {
        throw new ForbiddenError('Project ID not found in request');
      }
      
      // Check if API key's project matches
      if (req.apiKey.projectId !== projectId) {
        throw new ForbiddenError('API key does not have access to this project');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional API key middleware - validates if present but doesn't require it
 * Useful for endpoints that support both authenticated and public access
 */
export async function optionalApiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    // If no API key provided, just continue
    if (!authHeader) {
      return next();
    }
    
    // If API key provided, validate it
    await validateApiKeyMiddleware(req, res, next);
  } catch (error) {
    // If validation fails with optional middleware, continue anyway
    // The endpoint can decide how to handle unauthenticated requests
    next();
  }
}
