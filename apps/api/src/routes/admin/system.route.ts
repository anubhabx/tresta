import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.ts';
import { getRedisClient } from '../../lib/redis.ts';

const router: Router = Router();

/**
 * GET /admin/system
 * Get system information and status
 * 
 * Returns:
 * - environment: Environment name (development/staging/production)
 * - versions: API, database, Redis versions
 * - featureFlags: Feature flags and their states
 * - externalServices: Status of external services
 */
router.get(
  '/system',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedisClient();
      
      // Get Redis version
      const redisInfo = await redis.info('server');
      const redisVersionMatch = redisInfo.match(/redis_version:([^\r\n]+)/);
      const redisVersion = redisVersionMatch ? redisVersionMatch[1] : 'unknown';
      
      return ResponseHandler.success(res, {
        data: {
          environment: process.env.NODE_ENV || 'development',
          versions: {
            api: process.env.npm_package_version || '1.0.0',
            node: process.version,
            redis: redisVersion,
            database: 'PostgreSQL (version check not implemented)',
          },
          featureFlags: {
            autoModeration: true,
            bulkOperations: true,
            csvExport: true,
            // TODO: Fetch from database/Redis
          },
          externalServices: {
            clerk: {
              status: 'operational',
              // TODO: Check actual status
            },
            ably: {
              status: 'operational',
              // TODO: Check actual status
            },
            email: {
              provider: process.env.EMAIL_PROVIDER || 'resend',
              status: 'operational',
              // TODO: Check actual status
            },
          },
          config: {
            emailQuotaLimit: '***', // Masked
            ablyConnectionLimit: '***', // Masked
            databaseUrl: '***', // Masked
            redisUrl: '***', // Masked
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
