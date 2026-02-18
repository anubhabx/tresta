import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.js';
import { getRedisClient } from '../../lib/redis.js';
import { getAllFeatureFlags } from '../../services/feature-flags.service.js';
import { prisma } from '@workspace/database/prisma';

/**
 * GET /admin/system
 * Get system information and status
 */
export const getSystemInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const redis = getRedisClient();
    
    // Get Redis version
    const redisInfo = await redis.info('server');
    const redisVersionMatch = redisInfo.match(/redis_version:([^\r\n]+)/);
    const redisVersion = redisVersionMatch ? redisVersionMatch[1] : 'unknown';
    
    // Get feature flags
    const featureFlags = await getAllFeatureFlags();
    const featureFlagsMap = featureFlags.reduce((acc, flag) => {
      acc[flag.key] = flag.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    return ResponseHandler.success(res, {
      data: {
        environment: process.env.NODE_ENV || 'development',
        versions: {
          api: process.env.npm_package_version || '1.0.0',
          node: process.version,
          redis: redisVersion,
          database: await prisma.$queryRaw<[{version: string}]>`SELECT version()`.then(
            (rows) => rows[0]?.version ?? 'unknown',
          ).catch(() => 'PostgreSQL (version check failed)'),
        },
        featureFlags: featureFlagsMap,
        externalServices: {
          clerk: {
            status: 'operational',
          },
          ably: {
            status: 'operational',
          },
          email: {
            provider: process.env.EMAIL_PROVIDER || 'resend',
            status: 'operational',
          },
        },
        config: {
          emailQuotaLimit: '***',
          ablyConnectionLimit: '***',
          databaseUrl: '***',
          redisUrl: '***',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
