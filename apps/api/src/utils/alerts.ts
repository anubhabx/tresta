import { getRedisClient } from '../lib/redis.ts';
import { REDIS_KEYS } from '../lib/redis-keys.ts';

/**
 * Check email quota and send alerts at key thresholds
 * 
 * Alerts are sent at:
 * - 80% (160 emails) - Warning
 * - 90% (180 emails) - Critical warning
 * - 100% (200 emails) - Quota exhausted
 * 
 * Uses Redis to track if alert was already sent today
 * to avoid duplicate alerts
 * 
 * @param currentCount - Current email count for the day
 */
export async function checkAndAlertQuota(currentCount: number): Promise<void> {
  const redis = getRedisClient();

  // Define thresholds
  const thresholds = [
    { count: 160, percentage: 80, level: 'warning', emoji: '⚠️' },
    { count: 180, percentage: 90, level: 'critical', emoji: '🚨' },
    { count: 200, percentage: 100, level: 'exhausted', emoji: '🔴' },
  ];

  for (const threshold of thresholds) {
    if (currentCount === threshold.count) {
      // Check if we already sent this alert today
      const alertKey = `${REDIS_KEYS.EMAIL_QUOTA_LOCKED}:alert:${threshold.count}`;
      const alreadySent = await redis.get(alertKey);

      if (alreadySent) {
        continue; // Already sent this alert today
      }

      // Send alert
      const message = threshold.count === 200
        ? `${threshold.emoji} Email quota exhausted (200/200) - non-critical emails deferred to tomorrow's digest`
        : `${threshold.emoji} Email quota at ${threshold.percentage}% (${currentCount}/200)${threshold.count === 180 ? ' - approaching limit' : ''}`;

      await sendSlackAlert(message, threshold.level);

      // Mark alert as sent (expires at midnight UTC)
      const now = new Date();
      const tomorrow = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      );
      const ttl = Math.floor((tomorrow - Date.now()) / 1000);
      await redis.setex(alertKey, ttl, '1');

      console.log(`📢 Alert sent: ${message}`);
    }
  }
}

/**
 * Send alert to Slack webhook
 * 
 * @param message - Alert message
 * @param level - Alert level (warning, critical, exhausted)
 */
async function sendSlackAlert(message: string, level: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('⚠️ SLACK_WEBHOOK_URL not configured, skipping alert:', message);
    return;
  }

  try {
    // Determine color based on level
    const colors: Record<string, string> = {
      warning: '#FFA500', // Orange
      critical: '#FF4500', // Red-Orange
      exhausted: '#DC143C', // Crimson
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'Tresta Notifications',
        icon_emoji: ':bell:',
        attachments: [
          {
            color: colors[level] || '#808080',
            fields: [
              {
                title: 'Service',
                value: 'Email Notifications',
                short: true,
              },
              {
                title: 'Environment',
                value: process.env.NODE_ENV || 'development',
                short: true,
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: false,
              },
            ],
            footer: 'Tresta Monitoring',
            footer_icon: `${process.env.APP_URL || 'https://tresta.app'}/favicon.ico`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('✅ Slack alert sent successfully');
  } catch (error) {
    console.error('❌ Failed to send Slack alert:', error);
    // Don't throw - alerting failure shouldn't break the main flow
  }
}

/**
 * Send custom alert to Slack
 * 
 * @param message - Alert message
 * @param options - Optional configuration
 */
export async function sendAlert(
  message: string,
  options?: {
    level?: 'info' | 'warning' | 'error';
    fields?: Array<{ title: string; value: string; short?: boolean }>;
  }
): Promise<void> {
  const level = options?.level || 'info';
  const levelMap = {
    info: 'warning',
    warning: 'warning',
    error: 'exhausted',
  };

  await sendSlackAlert(message, levelMap[level]);
}

/**
 * Send daily summary to Slack
 * 
 * @param stats - Daily statistics
 */
export async function sendDailySummary(stats: {
  emailsSent: number;
  notificationsSent: number;
  digestsSent: number;
  failedJobs: number;
}): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const message = `📊 Daily Summary - ${new Date().toISOString().split('T')[0]}`;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'Tresta Notifications',
        icon_emoji: ':bar_chart:',
        attachments: [
          {
            color: '#36a64f',
            fields: [
              {
                title: 'Emails Sent',
                value: stats.emailsSent.toString(),
                short: true,
              },
              {
                title: 'Notifications Sent',
                value: stats.notificationsSent.toString(),
                short: true,
              },
              {
                title: 'Digests Sent',
                value: stats.digestsSent.toString(),
                short: true,
              },
              {
                title: 'Failed Jobs',
                value: stats.failedJobs.toString(),
                short: true,
              },
            ],
            footer: 'Tresta Daily Report',
            timestamp: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Failed to send daily summary:', error);
  }
}
