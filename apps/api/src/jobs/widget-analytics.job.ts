import { CronJob } from 'cron';
import { checkWidgetPerformance, cleanupOldAnalytics } from '../services/widget-analytics.service.js';
import { logger } from '../lib/logger.js';

const widgetAnalyticsJobLogger = logger.child({ module: 'widget-analytics-job' });

// Performance check job (every 15 minutes)
export const performanceCheckJob = new CronJob(
  '*/15 * * * *',
  async () => {
    widgetAnalyticsJobLogger.info('Running widget performance check');
    try {
      await checkWidgetPerformance();
    } catch (error) {
      widgetAnalyticsJobLogger.error({ error }, 'Widget performance check failed');
    }
  },
  null,
  false,
  'UTC'
);

// Cleanup job (daily at 2 AM UTC)
export const analyticsCleanupJob = new CronJob(
  '0 2 * * *',
  async () => {
    widgetAnalyticsJobLogger.info('Running analytics cleanup');
    try {
      await cleanupOldAnalytics();
    } catch (error) {
      widgetAnalyticsJobLogger.error({ error }, 'Widget analytics cleanup failed');
    }
  },
  null,
  false,
  'UTC'
);

/**
 * Schedule widget analytics jobs
 */
export function scheduleWidgetAnalyticsJobs() {
  performanceCheckJob.start();
  analyticsCleanupJob.start();
  widgetAnalyticsJobLogger.info('Widget analytics jobs scheduled');
}
