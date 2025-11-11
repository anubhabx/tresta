import { CronJob } from 'cron';
import { getRedisClient } from '../lib/redis.ts';
import { REDIS_KEYS, getCurrentDateUTC } from '../lib/redis-keys.ts';
import { NotificationService } from '../services/notification.service.ts';

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
    console.log('🔄 Starting reconciliation job...');
    
    try {
      const redis = getRedisClient();
      const today = getCurrentDateUTC();
      const key = REDIS_KEYS.EMAIL_QUOTA(today);
      
      const count = parseInt(await redis.get(key) || '0');
      
      if (count > 0) {
        await NotificationService.snapshotEmailUsage(today, count);
        console.log(`✅ Reconciliation complete: ${count} emails on ${today}`);
      } else {
        console.log(`ℹ️ No emails sent today (${today})`);
      }
    } catch (error) {
      console.error('❌ Reconciliation job error:', error);
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
  console.log('✅ Reconciliation job scheduled (11:59 PM UTC)');
}
