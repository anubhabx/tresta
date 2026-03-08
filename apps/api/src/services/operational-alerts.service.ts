import {
  AlertSeverity,
  Prisma,
  prisma,
} from '@workspace/database/prisma';

import { getRedisClient } from '../lib/redis.js';
import { getQueue } from '../lib/queues.js';
import { REDIS_KEYS, getCurrentDateUTC } from '../lib/redis-keys.js';
import { logger } from '../lib/logger.js';

const operationalAlertsLogger = logger.child({ module: 'operational-alerts' });

const ALERT_SLACK_WEBHOOK_KEY = 'alerts:slack_webhook_url';
const EMAIL_DAILY_LIMIT = 200;
const OPERATIONAL_ALERT_TYPES = {
  EMAIL_QUOTA_THRESHOLD: 'EMAIL_QUOTA_THRESHOLD_EXCEEDED',
  QUEUE_BACKLOG: 'QUEUE_BACKLOG_HIGH',
  FAILED_JOB_RATE: 'FAILED_JOB_RATE_HIGH',
  WEBHOOK_FAILURES: 'WEBHOOK_FAILURES_DETECTED',
  PAYMENT_FAILURES: 'PAYMENT_FAILURES_DETECTED',
  DEPENDENCY_DEGRADED: 'DEPENDENCY_DEGRADED',
} as const;

type AlertConfigSnapshot = {
  id: string;
  emailQuotaThreshold: number;
  dlqCountThreshold: number;
  failedJobRateThreshold: number;
  slackWebhookUrl: string;
};

type QueueTelemetry = {
  notifications: Record<string, number>;
  email: Record<string, number>;
  outbox: Record<string, number>;
};

interface AlertRecordInput {
  alertType: string;
  severity: AlertSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}

interface AlertConditionInput extends AlertRecordInput {
  active: boolean;
}

function sanitizeJson(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (depth >= 4) {
    return '[Truncated]';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((entry) => sanitizeJson(entry, depth + 1));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .slice(0, 50)
        .map(([key, entry]) => [key, sanitizeJson(entry, depth + 1)]),
    );
  }

  return String(value);
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return sanitizeJson(value) as Prisma.InputJsonValue;
}

async function getOrCreateAlertConfigRecord() {
  const existing = await prisma.alertConfig.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (existing) {
    return existing;
  }

  return prisma.alertConfig.create({ data: {} });
}

async function setSlackWebhookSetting(value: string, updatedBy?: string): Promise<void> {
  await prisma.systemSettings.upsert({
    where: { key: ALERT_SLACK_WEBHOOK_KEY },
    create: {
      key: ALERT_SLACK_WEBHOOK_KEY,
      value,
      updatedBy,
    },
    update: {
      value,
      updatedBy,
      version: { increment: 1 },
    },
  });
}

export async function getConfiguredSlackWebhookUrl(): Promise<string> {
  const configuredSetting = await prisma.systemSettings.findUnique({
    where: { key: ALERT_SLACK_WEBHOOK_KEY },
    select: { value: true },
  });

  return configuredSetting?.value || process.env.SLACK_WEBHOOK_URL || '';
}

export async function getOperationalAlertConfig(): Promise<AlertConfigSnapshot> {
  const [config, slackWebhookUrl] = await Promise.all([
    getOrCreateAlertConfigRecord(),
    getConfiguredSlackWebhookUrl(),
  ]);

  return {
    id: config.id,
    emailQuotaThreshold: config.emailQuotaThreshold,
    dlqCountThreshold: config.dlqCountThreshold,
    failedJobRateThreshold: config.failedJobRateThreshold,
    slackWebhookUrl,
  };
}

export async function updateOperationalAlertConfig(input: {
  emailQuotaThreshold?: number;
  dlqCountThreshold?: number;
  failedJobRateThreshold?: number;
  slackWebhookUrl?: string;
  updatedBy?: string;
}): Promise<AlertConfigSnapshot> {
  const config = await getOrCreateAlertConfigRecord();

  await prisma.alertConfig.update({
    where: { id: config.id },
    data: {
      emailQuotaThreshold: input.emailQuotaThreshold,
      dlqCountThreshold: input.dlqCountThreshold,
      failedJobRateThreshold: input.failedJobRateThreshold,
      updatedBy: input.updatedBy,
    },
  });

  if (input.slackWebhookUrl !== undefined) {
    await setSlackWebhookSetting(input.slackWebhookUrl, input.updatedBy);
  }

  return getOperationalAlertConfig();
}

export async function listRecentOperationalAlerts(days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return prisma.alertHistory.findMany({
    where: { createdAt: { gte: startDate } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getOperationalAlertSummary() {
  const [activeCount, criticalCount, warningCount] = await Promise.all([
    prisma.alertHistory.count({ where: { resolved: false } }),
    prisma.alertHistory.count({
      where: { resolved: false, severity: AlertSeverity.CRITICAL },
    }),
    prisma.alertHistory.count({
      where: { resolved: false, severity: AlertSeverity.WARNING },
    }),
  ]);

  return {
    activeCount,
    criticalCount,
    warningCount,
  };
}

async function sendSlackNotification(alert: {
  alertType: string;
  severity: AlertSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const webhookUrl = await getConfiguredSlackWebhookUrl();

  if (!webhookUrl) {
    operationalAlertsLogger.warn(
      { alertType: alert.alertType },
      'Slack webhook URL is not configured; skipping alert notification',
    );
    return;
  }

  const colors: Record<AlertSeverity, string> = {
    INFO: '#2563eb',
    WARNING: '#d97706',
    CRITICAL: '#dc2626',
  };

  const fields = Object.entries(alert.metadata || {})
    .slice(0, 8)
    .map(([title, value]) => ({
      title,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      short: true,
    }));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${alert.severity}] ${alert.alertType}`,
        username: 'Tresta Monitoring',
        icon_emoji: ':rotating_light:',
        attachments: [
          {
            color: colors[alert.severity],
            title: alert.alertType,
            text: alert.message,
            fields: [
              {
                title: 'Environment',
                value: process.env.NODE_ENV || 'development',
                short: true,
              },
              {
                title: 'Severity',
                value: alert.severity,
                short: true,
              },
              ...fields,
            ],
            footer: 'Tresta Monitoring',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
  } catch (error) {
    operationalAlertsLogger.error(
      { error, alertType: alert.alertType },
      'Failed to send Slack operational alert',
    );
  }
}

export async function recordOperationalAlert(input: AlertRecordInput) {
  const existing = await prisma.alertHistory.findFirst({
    where: {
      alertType: input.alertType,
      resolved: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    return existing;
  }

  const createdAlert = await prisma.alertHistory.create({
    data: {
      alertType: input.alertType,
      severity: input.severity,
      message: input.message,
      metadata: input.metadata ? toInputJsonValue(input.metadata) : undefined,
    },
  });

  await sendSlackNotification(input);
  return createdAlert;
}

export async function resolveOperationalAlert(
  alertType: string,
  resolvedBy = 'system',
): Promise<void> {
  await prisma.alertHistory.updateMany({
    where: {
      alertType,
      resolved: false,
    },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy,
    },
  });
}

async function applyAlertCondition(input: AlertConditionInput): Promise<void> {
  if (input.active) {
    await recordOperationalAlert(input);
    return;
  }

  await resolveOperationalAlert(input.alertType);
}

async function getQueueTelemetry(): Promise<QueueTelemetry> {
  const [notifications, email, outbox] = await Promise.all([
    getQueue('notifications').getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed'),
    getQueue('send-email').getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed'),
    getQueue('outbox-processor').getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed'),
  ]);

  return { notifications, email, outbox };
}

function sumCounts(counts: Record<string, number>, keys: string[]): number {
  return keys.reduce((total, key) => total + (counts[key] || 0), 0);
}

export async function evaluateOperationalAlerts(): Promise<void> {
  const config = await getOperationalAlertConfig();
  const redis = getRedisClient();
  const today = getCurrentDateUTC();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const queueTelemetryPromise = getQueueTelemetry();
  const databaseHealthPromise = prisma.$queryRaw`SELECT 1`;
  const redisHealthPromise = redis.ping();

  const [
    emailQuotaCount,
    dlqCount,
    outboxPending,
    recentWebhookFailures,
    recentPaymentFailures,
    queueTelemetryResult,
    databaseHealth,
    redisHealth,
  ] = await Promise.all([
    redis.get(REDIS_KEYS.EMAIL_QUOTA(today)),
    prisma.deadLetterJob.count({ where: { retried: false } }),
    prisma.notificationOutbox.count({ where: { status: 'pending' } }),
    prisma.paymentWebhookEvent.count({
      where: {
        status: 'failed',
        receivedAt: { gte: oneHourAgo },
      },
    }),
    prisma.subscriptionPayment.count({
      where: {
        OR: [
          {
            paymentStatus: { equals: 'failed', mode: 'insensitive' },
            OR: [
              { failedAt: { gte: oneDayAgo } },
              { eventCreatedAt: { gte: oneDayAgo } },
            ],
          },
          {
            invoiceStatus: { equals: 'expired', mode: 'insensitive' },
            OR: [
              { failedAt: { gte: oneDayAgo } },
              { eventCreatedAt: { gte: oneDayAgo } },
            ],
          },
        ],
      },
    }),
    queueTelemetryPromise.then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error }),
    ),
    databaseHealthPromise.then(
      () => ({ ok: true as const }),
      (error) => ({ ok: false as const, error }),
    ),
    redisHealthPromise.then(
      () => ({ ok: true as const }),
      (error) => ({ ok: false as const, error }),
    ),
  ]);

  const emailUsed = Number.parseInt(emailQuotaCount || '0', 10);
  const emailPercentage = EMAIL_DAILY_LIMIT > 0
    ? Math.round((emailUsed / EMAIL_DAILY_LIMIT) * 100)
    : 0;

  await applyAlertCondition({
    active: emailPercentage >= config.emailQuotaThreshold,
    alertType: OPERATIONAL_ALERT_TYPES.EMAIL_QUOTA_THRESHOLD,
    severity: emailPercentage >= 90 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
    message: `Email quota usage is ${emailPercentage}% (${emailUsed}/${EMAIL_DAILY_LIMIT}), exceeding the ${config.emailQuotaThreshold}% threshold.`,
    metadata: {
      emailUsed,
      emailLimit: EMAIL_DAILY_LIMIT,
      emailPercentage,
      threshold: config.emailQuotaThreshold,
    },
  });

  const queueTelemetry = queueTelemetryResult.ok
    ? queueTelemetryResult.value
    : {
        notifications: {},
        email: {},
        outbox: {},
      };
  const waitingBacklog =
    sumCounts(queueTelemetry.notifications, ['waiting', 'active', 'delayed']) +
    sumCounts(queueTelemetry.email, ['waiting', 'active', 'delayed']) +
    sumCounts(queueTelemetry.outbox, ['waiting', 'active', 'delayed']) +
    outboxPending +
    dlqCount;

  await applyAlertCondition({
    active: waitingBacklog >= config.dlqCountThreshold,
    alertType: OPERATIONAL_ALERT_TYPES.QUEUE_BACKLOG,
    severity: waitingBacklog >= config.dlqCountThreshold * 2
      ? AlertSeverity.CRITICAL
      : AlertSeverity.WARNING,
    message: `Queue backlog is ${waitingBacklog}, exceeding the configured threshold of ${config.dlqCountThreshold}.`,
    metadata: {
      backlog: waitingBacklog,
      threshold: config.dlqCountThreshold,
      dlqCount,
      outboxPending,
      notificationQueue: queueTelemetry.notifications,
      emailQueue: queueTelemetry.email,
      outboxQueue: queueTelemetry.outbox,
    },
  });

  const totalObservedJobs =
    sumCounts(queueTelemetry.notifications, ['completed', 'failed']) +
    sumCounts(queueTelemetry.email, ['completed', 'failed']) +
    sumCounts(queueTelemetry.outbox, ['completed', 'failed']);
  const failedObservedJobs =
    sumCounts(queueTelemetry.notifications, ['failed']) +
    sumCounts(queueTelemetry.email, ['failed']) +
    sumCounts(queueTelemetry.outbox, ['failed']);
  const failedJobRate = totalObservedJobs > 0 ? failedObservedJobs / totalObservedJobs : 0;

  await applyAlertCondition({
    active: totalObservedJobs >= 10 && failedJobRate >= config.failedJobRateThreshold,
    alertType: OPERATIONAL_ALERT_TYPES.FAILED_JOB_RATE,
    severity: failedJobRate >= Math.max(config.failedJobRateThreshold * 2, 0.25)
      ? AlertSeverity.CRITICAL
      : AlertSeverity.WARNING,
    message: `Failed job rate is ${(failedJobRate * 100).toFixed(1)}%, exceeding the configured threshold of ${(config.failedJobRateThreshold * 100).toFixed(1)}%.`,
    metadata: {
      failedObservedJobs,
      totalObservedJobs,
      failedJobRate,
      threshold: config.failedJobRateThreshold,
    },
  });

  await applyAlertCondition({
    active: recentWebhookFailures > 0,
    alertType: OPERATIONAL_ALERT_TYPES.WEBHOOK_FAILURES,
    severity: recentWebhookFailures >= 3 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
    message: `${recentWebhookFailures} failed payment webhook event(s) were detected in the last hour.`,
    metadata: {
      recentWebhookFailures,
      window: '1h',
    },
  });

  await applyAlertCondition({
    active: recentPaymentFailures > 0,
    alertType: OPERATIONAL_ALERT_TYPES.PAYMENT_FAILURES,
    severity: recentPaymentFailures >= 3 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
    message: `${recentPaymentFailures} payment failure or invoice expiry event(s) were detected in the last 24 hours.`,
    metadata: {
      recentPaymentFailures,
      window: '24h',
    },
  });

  const degradedDependencies: string[] = [];
  if (!databaseHealth.ok) {
    degradedDependencies.push('database');
  }
  if (!redisHealth.ok) {
    degradedDependencies.push('redis');
  }
  if (!queueTelemetryResult.ok) {
    degradedDependencies.push('bullmq');
  }

  await applyAlertCondition({
    active: degradedDependencies.length > 0,
    alertType: OPERATIONAL_ALERT_TYPES.DEPENDENCY_DEGRADED,
    severity: AlertSeverity.CRITICAL,
    message: degradedDependencies.length > 0
      ? `Degraded dependencies detected: ${degradedDependencies.join(', ')}.`
      : 'All critical dependencies are healthy.',
    metadata: {
      degradedDependencies,
      databaseHealthy: databaseHealth.ok,
      redisHealthy: redisHealth.ok,
      bullmqHealthy: queueTelemetryResult.ok,
    },
  });

  operationalAlertsLogger.info(
    {
      emailPercentage,
      waitingBacklog,
      failedJobRate,
      recentWebhookFailures,
      recentPaymentFailures,
      degradedDependencies,
    },
    'Operational alert evaluation completed',
  );
}
