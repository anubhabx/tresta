import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.ts';
import { getRedisClient } from '../../lib/redis.ts';
import { AppError } from '../../lib/errors.ts';
import { auditLog } from '../../middleware/audit-log.middleware.ts';

const router: Router = Router();

// Alert configuration keys in Redis
const ALERT_KEYS = {
  EMAIL_QUOTA_THRESHOLD: 'alerts:email_quota_threshold',
  DLQ_COUNT_THRESHOLD: 'alerts:dlq_count_threshold',
  FAILED_JOB_RATE_THRESHOLD: 'alerts:failed_job_rate_threshold',
};

/**
 * GET /admin/alerts
 * Get alert configuration and recent alert history
 * 
 * Returns:
 * - config: Alert threshold configuration
 * - history: Recent alerts from last 7 days
 * 
 * Note: Alert history requires database table
 */
router.get(
  '/alerts',
  async (req: Request, res: Response, next: NextFunction) => {
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
            emailQuotaThreshold: parseInt(emailQuotaThreshold || '80'), // Percentage
            dlqCountThreshold: parseInt(dlqCountThreshold || '100'),
            failedJobRateThreshold: parseFloat(failedJobRateThreshold || '0.1'), // 10%
          },
          history: [],
          message: 'Alert history not yet implemented - requires database migration',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /admin/alerts/config
 * Update alert threshold configuration
 * 
 * Body:
 * - emailQuotaThreshold: Email quota percentage threshold (0-100)
 * - dlqCountThreshold: DLQ count threshold (positive integer)
 * - failedJobRateThreshold: Failed job rate threshold (0-1)
 * 
 * Returns:
 * - Updated alert configuration
 */
router.put(
  '/alerts/config',
  auditLog,
  async (req: Request, res: Response, next: NextFunction) => {
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
          throw new AppError('emailQuotaThreshold must be between 0 and 100', 400);
        }
      }
      
      if (dlqCountThreshold !== undefined) {
        const threshold = parseInt(dlqCountThreshold);
        if (isNaN(threshold) || threshold < 0) {
          throw new AppError('dlqCountThreshold must be a positive integer', 400);
        }
      }
      
      if (failedJobRateThreshold !== undefined) {
        const threshold = parseFloat(failedJobRateThreshold);
        if (isNaN(threshold) || threshold < 0 || threshold > 1) {
          throw new AppError('failedJobRateThreshold must be between 0 and 1', 400);
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
      
      // TODO: Log configuration change in audit log
      
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
  }
);

export default router;
