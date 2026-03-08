import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

import { ResponseHandler } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';
import {
  getOperationalAlertConfig,
  getOperationalAlertSummary,
  listRecentOperationalAlerts,
  updateOperationalAlertConfig,
} from '../../services/operational-alerts.service.js';

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
    const [config, history, summary] = await Promise.all([
      getOperationalAlertConfig(),
      listRecentOperationalAlerts(),
      getOperationalAlertSummary(),
    ]);

    return ResponseHandler.success(res, {
      data: {
        config: {
          emailQuotaThreshold: config.emailQuotaThreshold,
          dlqCountThreshold: config.dlqCountThreshold,
          failedJobRateThreshold: config.failedJobRateThreshold,
          slackWebhookUrl: config.slackWebhookUrl,
        },
        history: history.map((alert) => ({
          id: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          message: alert.message,
          metadata: alert.metadata,
          triggeredAt: alert.createdAt.toISOString(),
          resolved: alert.resolved,
          resolvedAt: alert.resolvedAt?.toISOString() || null,
        })),
        summary,
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
      slackWebhookUrl,
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

    if (slackWebhookUrl !== undefined) {
      if (typeof slackWebhookUrl !== 'string') {
        throw new BadRequestError('slackWebhookUrl must be a string');
      }

      const trimmedWebhookUrl = slackWebhookUrl.trim();
      if (
        trimmedWebhookUrl.length > 0 &&
        !trimmedWebhookUrl.startsWith('https://hooks.slack.com/')
      ) {
        throw new BadRequestError('slackWebhookUrl must be a valid Slack incoming webhook URL');
      }
    }

    const { userId } = getAuth(req);
    const updatedConfig = await updateOperationalAlertConfig({
      emailQuotaThreshold,
      dlqCountThreshold,
      failedJobRateThreshold,
      slackWebhookUrl,
      updatedBy: userId || undefined,
    });

    return ResponseHandler.success(res, {
      data: {
        emailQuotaThreshold: updatedConfig.emailQuotaThreshold,
        dlqCountThreshold: updatedConfig.dlqCountThreshold,
        failedJobRateThreshold: updatedConfig.failedJobRateThreshold,
        slackWebhookUrl: updatedConfig.slackWebhookUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
