import type { Request, Response, NextFunction } from 'express';
import Ably from 'ably';
import { BadRequestError, InternalServerError } from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';

const ablyApiKey = process.env.ABLY_API_KEY;

if (!ablyApiKey) {
  console.warn('ABLY_API_KEY not configured - Ably token authentication will fail');
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
    const userId = (req as any).auth?.userId;
    
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

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
