import { CronJob } from "cron";

import { reconcileStaleSubscriptions } from "../services/subscription-reconciliation.service.js";

const DEFAULT_CRON = "*/30 * * * *"; // every 30 minutes (UTC)

export const subscriptionReconciliationJob = new CronJob(
  process.env.SUBSCRIPTION_RECONCILIATION_CRON || DEFAULT_CRON,
  async () => {
    console.log("🔄 Starting subscription reconciliation job...");

    try {
      const staleMinutes = Number(process.env.SUBSCRIPTION_STALE_MINUTES || "30");
      const limit = Number(process.env.SUBSCRIPTION_RECONCILIATION_LIMIT || "100");

      const result = await reconcileStaleSubscriptions({ staleMinutes, limit });

      console.log(
        `✅ Subscription reconciliation complete: scanned=${result.scanned}, updated=${result.updated}, canceledLocally=${result.canceledLocally}, failed=${result.failed}, skipped=${result.skipped}`,
      );
    } catch (error) {
      console.error("❌ Subscription reconciliation job error:", error);
    }
  },
  null,
  false,
  "UTC",
);

export function startSubscriptionReconciliationJob() {
  subscriptionReconciliationJob.start();
  console.log("✅ Subscription reconciliation job scheduled");
}
