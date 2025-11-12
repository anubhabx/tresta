import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.ts';
import { getRedisClient } from '../../lib/redis.ts';
import { AppError } from '../../lib/errors.ts';
import { auditLog } from '../../middleware/audit-log.middleware.ts';

const router: Router = Router();

// Settings keys in Redis
const SETTINGS_KEYS = {
  EMAIL_QUOTA_LIMIT: 'settings:email_quota_limit',
  ABLY_CONNECTION_LIMIT: 'settings:ably_connection_limit',
  AUTO_MODERATION_ENABLED: 'settings:auto_moderation_enabled',
  SETTINGS_VERSION: 'settings:version',
};

/**
 * GET /admin/settings
 * Get current system settings
 * 
 * Returns:
 * - emailQuotaLimit: Daily email quota limit
 * - ablyConnectionLimit: Maximum Ably connections
 * - autoModerationEnabled: Auto-moderation toggle
 * - version: Settings version for optimistic locking
 */
router.get(
  '/settings',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedisClient();
      
      const [
        emailQuotaLimit,
        ablyConnectionLimit,
        autoModerationEnabled,
        version,
      ] = await Promise.all([
        redis.get(SETTINGS_KEYS.EMAIL_QUOTA_LIMIT),
        redis.get(SETTINGS_KEYS.ABLY_CONNECTION_LIMIT),
        redis.get(SETTINGS_KEYS.AUTO_MODERATION_ENABLED),
        redis.get(SETTINGS_KEYS.SETTINGS_VERSION),
      ]);
      
      return ResponseHandler.success(res, {
        data: {
          emailQuotaLimit: parseInt(emailQuotaLimit || '200'),
          ablyConnectionLimit: parseInt(ablyConnectionLimit || '200'),
          autoModerationEnabled: autoModerationEnabled === '1',
          version: parseInt(version || '1'),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /admin/settings
 * Update system settings with optimistic locking
 * 
 * Body:
 * - emailQuotaLimit: Daily email quota limit (0-1000000)
 * - ablyConnectionLimit: Maximum Ably connections (0-10000)
 * - autoModerationEnabled: Auto-moderation toggle
 * - version: Current version for optimistic locking
 * 
 * Returns:
 * - Updated settings with new version
 */
router.put(
  '/settings',
  auditLog,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        emailQuotaLimit,
        ablyConnectionLimit,
        autoModerationEnabled,
        version,
      } = req.body;
      
      // Validate inputs
      if (emailQuotaLimit !== undefined) {
        const limit = parseInt(emailQuotaLimit);
        if (isNaN(limit) || limit < 0 || limit > 1000000) {
          throw new AppError('emailQuotaLimit must be between 0 and 1000000', 400);
        }
      }
      
      if (ablyConnectionLimit !== undefined) {
        const limit = parseInt(ablyConnectionLimit);
        if (isNaN(limit) || limit < 0 || limit > 10000) {
          throw new AppError('ablyConnectionLimit must be between 0 and 10000', 400);
        }
      }
      
      if (autoModerationEnabled !== undefined && typeof autoModerationEnabled !== 'boolean') {
        throw new AppError('autoModerationEnabled must be a boolean', 400);
      }
      
      const redis = getRedisClient();
      
      // Check version for optimistic locking
      const currentVersion = await redis.get(SETTINGS_KEYS.SETTINGS_VERSION);
      const currentVersionNum = parseInt(currentVersion || '1');
      
      if (version !== undefined && version !== currentVersionNum) {
        throw new AppError(
          'Settings have been modified by another admin. Please refresh and try again.',
          409
        );
      }
      
      // Update settings atomically using Redis transaction
      const multi = redis.multi();
      
      if (emailQuotaLimit !== undefined) {
        multi.set(SETTINGS_KEYS.EMAIL_QUOTA_LIMIT, emailQuotaLimit.toString());
      }
      
      if (ablyConnectionLimit !== undefined) {
        multi.set(SETTINGS_KEYS.ABLY_CONNECTION_LIMIT, ablyConnectionLimit.toString());
      }
      
      if (autoModerationEnabled !== undefined) {
        multi.set(SETTINGS_KEYS.AUTO_MODERATION_ENABLED, autoModerationEnabled ? '1' : '0');
      }
      
      // Increment version
      const newVersion = currentVersionNum + 1;
      multi.set(SETTINGS_KEYS.SETTINGS_VERSION, newVersion.toString());
      
      await multi.exec();
      
      // TODO: Publish signed change event to Redis pub/sub
      // TODO: Log settings change in audit log
      
      // Fetch updated settings
      const [
        updatedEmailQuotaLimit,
        updatedAblyConnectionLimit,
        updatedAutoModerationEnabled,
      ] = await Promise.all([
        redis.get(SETTINGS_KEYS.EMAIL_QUOTA_LIMIT),
        redis.get(SETTINGS_KEYS.ABLY_CONNECTION_LIMIT),
        redis.get(SETTINGS_KEYS.AUTO_MODERATION_ENABLED),
      ]);
      
      return ResponseHandler.success(res, {
        data: {
          emailQuotaLimit: parseInt(updatedEmailQuotaLimit || '200'),
          ablyConnectionLimit: parseInt(updatedAblyConnectionLimit || '200'),
          autoModerationEnabled: updatedAutoModerationEnabled === '1',
          version: newVersion,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
