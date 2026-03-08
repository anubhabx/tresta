import { CronJob } from 'cron';

import { logger } from '../lib/logger.js';
import { evaluateOperationalAlerts } from '../services/operational-alerts.service.js';

const operationalAlertsJobLogger = logger.child({ module: 'operational-alerts-job' });

const DEFAULT_CRON = '*/5 * * * *';

export const operationalAlertsJob = new CronJob(
  process.env.OPERATIONAL_ALERTS_CRON || DEFAULT_CRON,
  async () => {
    operationalAlertsJobLogger.info('Starting operational alert evaluation');

    try {
      await evaluateOperationalAlerts();
    } catch (error) {
      operationalAlertsJobLogger.error({ error }, 'Operational alert evaluation failed');
    }
  },
  null,
  false,
  'UTC',
);

export function startOperationalAlertsJob() {
  operationalAlertsJob.start();
  operationalAlertsJobLogger.info('Operational alerts job scheduled');
}
