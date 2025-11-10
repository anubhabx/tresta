import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import Ably from 'ably';
import { BadRequestError } from '../../lib/errors.ts';
import { ResponseHandler } from '../../lib/response.ts';

const router: Router = Router();

// CRITICAL: Use REST API key on server only
// Never expose this key to the client
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
 * 
 * Security notes:
 * 1. ABLY_API_KEY stays server-side only (never in NEXT_PUBLIC_*)
 * 2. Clients receive short-lived tokens via this endpoint
 * 3. Tokens are scoped to user's own channel only
 * 4. Tokens expire after 1 hour and auto-refresh
 */
router.get(
  '/token',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId;
      
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      if (!ablyApiKey) {
        throw new Error('ABLY_API_KEY not configured');
      }

      // Initialize Ably REST client
      const ably = new Ably.Rest(ablyApiKey);

      // Generate token request with user-scoped capabilities
      const tokenRequest = await ably.auth.createTokenRequest({
        clientId: userId,
        capability: {
          [`notifications:${userId}`]: ['subscribe'], // Read-only, user-specific channel
        },
        ttl: 3600000, // 1 hour (in milliseconds)
      });

      return ResponseHandler.success(res, {
        data: tokenRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
