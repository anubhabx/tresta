import { CronJob } from 'cron';
import { getRedisClient } from '../lib/redis.js';
import { REDIS_KEYS, getCurrentDateUTC } from '../lib/redis-keys.js';
import { NotificationService } from '../services/notification.service.js';
import { logger } from '../lib/logger.js';

const reconciliationLogger = logger.child({ module: 'reconciliation-job' });

/**
 * Nightly reconciliation job - snapshots Redis quota to Postgres
 * 
 * Runs at 11:59 PM UTC to capture final daily count
 * Ensures email usage history is preserved even if Redis is cleared
 * 
 * This provides:
 * - Historical tracking of email usage
 * - Audit trail for quota management
 * - Recovery data if Redis fails
 */
export const reconciliationJob = new CronJob(
  '59 23 * * *', // Every day at 11:59 PM UTC
  async () => {
    reconciliationLogger.info('Starting reconciliation job');
    
    try {
      const redis = getRedisClient();
      const today = getCurrentDateUTC();
      const key = REDIS_KEYS.EMAIL_QUOTA(today);
      
      const count = parseInt(await redis.get(key) || '0');
      
      if (count > 0) {
        await NotificationService.snapshotEmailUsage(today, count);
        reconciliationLogger.info({ count, day: today }, 'Reconciliation complete');
      } else {
        reconciliationLogger.info({ day: today }, 'No emails sent today');
      }
    } catch (error) {
      reconciliationLogger.error({ error }, 'Reconciliation job error');
    }
  },
  null,
  false, // Don't start automatically
  'UTC'
);

/**
 * Start the reconciliation job
 * Call this from your worker process
 */
export function startReconciliationJob() {
  reconciliationJob.start();
  reconciliationLogger.info('Reconciliation job scheduled (11:59 PM UTC)');
}
