import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.js';
import { getRedisClient } from '../../lib/redis.js';
import { BadRequestError, ConflictError } from '../../lib/errors.js';
import crypto from 'crypto';

const SETTINGS_CHANGE_CHANNEL = 'settings:changes';
const SETTINGS_HMAC_SECRET = process.env.SETTINGS_HMAC_SECRET || 'default-secret-change-in-production';

const SETTINGS_KEYS = {
  EMAIL_QUOTA_LIMIT: 'settings:email_quota_limit',
  ABLY_CONNECTION_LIMIT: 'settings:ably_connection_limit',
  AUTO_MODERATION_ENABLED: 'settings:auto_moderation_enabled',
  SETTINGS_VERSION: 'settings:version',
};

/**
 * GET /admin/settings
 * Get current system settings
 */
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
};

/**
 * PUT /admin/settings
 * Update system settings with optimistic locking
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        throw new BadRequestError('emailQuotaLimit must be between 0 and 1000000');
      }
    }
    
    if (ablyConnectionLimit !== undefined) {
      const limit = parseInt(ablyConnectionLimit);
      if (isNaN(limit) || limit < 0 || limit > 10000) {
        throw new BadRequestError('ablyConnectionLimit must be between 0 and 10000');
      }
    }
    
    if (autoModerationEnabled !== undefined && typeof autoModerationEnabled !== 'boolean') {
      throw new BadRequestError('autoModerationEnabled must be a boolean');
    }
    
    const redis = getRedisClient();
    
    // Check version for optimistic locking
    const currentVersion = await redis.get(SETTINGS_KEYS.SETTINGS_VERSION);
    const currentVersionNum = parseInt(currentVersion || '1');
    
    if (version !== undefined && version !== currentVersionNum) {
      throw new ConflictError(
        'Settings have been modified by another admin. Please refresh and try again.'
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
    
    // Publish signed change event to Redis pub/sub
    const changeEvent = {
      version: newVersion,
      changes: {
        ...(emailQuotaLimit !== undefined && { emailQuotaLimit }),
        ...(ablyConnectionLimit !== undefined && { ablyConnectionLimit }),
        ...(autoModerationEnabled !== undefined && { autoModerationEnabled }),
      },
      timestamp: new Date().toISOString(),
      updatedBy: (req as any).auth?.userId || 'unknown',
    };
    
    // Generate HMAC signature
    const signature = crypto
      .createHmac('sha256', SETTINGS_HMAC_SECRET)
      .update(JSON.stringify(changeEvent))
      .digest('hex');
    
    const signedEvent = {
      ...changeEvent,
      signature,
    };
    
    // Publish to Redis pub/sub
    await redis.publish(SETTINGS_CHANGE_CHANNEL, JSON.stringify(signedEvent));
    
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
};
