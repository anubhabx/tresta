import type { Request, Response, NextFunction } from 'express';
import Ably from 'ably';
import { InternalServerError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { ResponseHandler } from '../lib/response.js';
import { requireUserId } from '../lib/auth.js';

const ablyApiKey = process.env.ABLY_API_KEY;
const ablyControllerLogger = logger.child({ module: 'ably-controller' });

if (!ablyApiKey) {
  ablyControllerLogger.warn('ABLY_API_KEY not configured - Ably token authentication will fail');
}

/**
 * GET /api/ably/token
 * Generate Ably token for authenticated user
 * 
 * Returns a token request that the client can use to authenticate with Ably
 * Token is scoped to user's own notification channel (subscribe only)
 */
export const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = requireUserId(req);

    if (!ablyApiKey) {
      throw new InternalServerError('ABLY_API_KEY not configured');
    }

    // Initialize Ably REST client
    const ably = new Ably.Rest(ablyApiKey);

    // Generate token request with user-scoped capabilities
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      capability: {
        [`notifications:${userId}`]: ['subscribe'],
      },
      ttl: 3600000, // 1 hour (in milliseconds)
    });

    return ResponseHandler.success(res, {
      data: tokenRequest,
    });
  } catch (error) {
    next(error);
  }
};
