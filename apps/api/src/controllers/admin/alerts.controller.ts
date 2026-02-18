import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.js';
import { getRedisClient } from '../../lib/redis.js';
import { BadRequestError } from '../../lib/errors.js';

const ALERT_KEYS = {
  EMAIL_QUOTA_THRESHOLD: 'alerts:email_quota_threshold',
  DLQ_COUNT_THRESHOLD: 'alerts:dlq_count_threshold',
  FAILED_JOB_RATE_THRESHOLD: 'alerts:failed_job_rate_threshold',
};

/**
 * GET /admin/alerts
 * Get alert configuration and recent alert history
 */
export const getAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const redis = getRedisClient();
    
    const [
      emailQuotaThreshold,
      dlqCountThreshold,
      failedJobRateThreshold,
    ] = await Promise.all([
      redis.get(ALERT_KEYS.EMAIL_QUOTA_THRESHOLD),
      redis.get(ALERT_KEYS.DLQ_COUNT_THRESHOLD),
      redis.get(ALERT_KEYS.FAILED_JOB_RATE_THRESHOLD),
    ]);
    
    return ResponseHandler.success(res, {
      data: {
        config: {
          emailQuotaThreshold: parseInt(emailQuotaThreshold || '80'),
          dlqCountThreshold: parseInt(dlqCountThreshold || '100'),
          failedJobRateThreshold: parseFloat(failedJobRateThreshold || '0.1'),
        },
        history: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/alerts/config
 * Update alert threshold configuration
 */
export const updateAlertConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      emailQuotaThreshold,
      dlqCountThreshold,
      failedJobRateThreshold,
    } = req.body;
    
    // Validate inputs
    if (emailQuotaThreshold !== undefined) {
      const threshold = parseInt(emailQuotaThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        throw new BadRequestError('emailQuotaThreshold must be between 0 and 100');
      }
    }
    
    if (dlqCountThreshold !== undefined) {
      const threshold = parseInt(dlqCountThreshold);
      if (isNaN(threshold) || threshold < 0) {
        throw new BadRequestError('dlqCountThreshold must be a positive integer');
      }
    }
    
    if (failedJobRateThreshold !== undefined) {
      const threshold = parseFloat(failedJobRateThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold > 1) {
        throw new BadRequestError('failedJobRateThreshold must be between 0 and 1');
      }
    }
    
    const redis = getRedisClient();
    
    // Update thresholds
    if (emailQuotaThreshold !== undefined) {
      await redis.set(ALERT_KEYS.EMAIL_QUOTA_THRESHOLD, emailQuotaThreshold.toString());
    }
    
    if (dlqCountThreshold !== undefined) {
      await redis.set(ALERT_KEYS.DLQ_COUNT_THRESHOLD, dlqCountThreshold.toString());
    }
    
    if (failedJobRateThreshold !== undefined) {
      await redis.set(ALERT_KEYS.FAILED_JOB_RATE_THRESHOLD, failedJobRateThreshold.toString());
    }
    
    // Fetch updated configuration
    const [
      updatedEmailQuotaThreshold,
      updatedDlqCountThreshold,
      updatedFailedJobRateThreshold,
    ] = await Promise.all([
      redis.get(ALERT_KEYS.EMAIL_QUOTA_THRESHOLD),
      redis.get(ALERT_KEYS.DLQ_COUNT_THRESHOLD),
      redis.get(ALERT_KEYS.FAILED_JOB_RATE_THRESHOLD),
    ]);
    
    return ResponseHandler.success(res, {
      data: {
        emailQuotaThreshold: parseInt(updatedEmailQuotaThreshold || '80'),
        dlqCountThreshold: parseInt(updatedDlqCountThreshold || '100'),
        failedJobRateThreshold: parseFloat(updatedFailedJobRateThreshold || '0.1'),
      },
    });
  } catch (error) {
    next(error);
  }
};
