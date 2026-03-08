import { CronJob } from "cron";

import { logger } from "../lib/logger.js";
import { reconcileStaleSubscriptions } from "../services/subscription-reconciliation.service.js";

const DEFAULT_CRON = "*/30 * * * *"; // every 30 minutes (UTC)
const subscriptionReconciliationLogger = logger.child({ module: 'subscription-reconciliation-job' });

export const subscriptionReconciliationJob = new CronJob(
  process.env.SUBSCRIPTION_RECONCILIATION_CRON || DEFAULT_CRON,
  async () => {
    subscriptionReconciliationLogger.info('Starting subscription reconciliation job');

    try {
      const staleMinutes = Number(process.env.SUBSCRIPTION_STALE_MINUTES || "30");
      const limit = Number(process.env.SUBSCRIPTION_RECONCILIATION_LIMIT || "100");

      const result = await reconcileStaleSubscriptions({ staleMinutes, limit });

      subscriptionReconciliationLogger.info(
        {
          scanned: result.scanned,
          updated: result.updated,
          canceledLocally: result.canceledLocally,
          failed: result.failed,
          skipped: result.skipped,
        },
        'Subscription reconciliation complete',
      );
    } catch (error) {
      subscriptionReconciliationLogger.error({ error }, 'Subscription reconciliation job error');
    }
  },
  null,
  false,
  "UTC",
);

export function startSubscriptionReconciliationJob() {
  subscriptionReconciliationJob.start();
  subscriptionReconciliationLogger.info('Subscription reconciliation job scheduled');
}
