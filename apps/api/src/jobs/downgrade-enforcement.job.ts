import { CronJob } from "cron";
import { enforceDowngradeLimits } from "../services/downgrade-enforcement.service.js";
import { logger } from "../lib/logger.js";

// Run once a day at midnight UTC by default
const DEFAULT_CRON = "0 0 * * *";

export const downgradeEnforcementJob = new CronJob(
  process.env.DOWNGRADE_ENFORCEMENT_CRON || DEFAULT_CRON,
  async () => {
    logger.info("🔄 Starting downgrade enforcement job...");

    try {
      const result = await enforceDowngradeLimits();

      logger.info(
        `✅ Downgrade enforcement complete: usersProcessed=${result.usersProcessed}, deactivatedProjects=${result.deactivatedProjectsCount}`,
      );
    } catch (error) {
      logger.error(
        { error },
        "❌ Downgrade enforcement job error", // Removed trailing comma here to be safe and match style
      );
    }
  },
  null,
  false,
  "UTC",
);

export function startDowngradeEnforcementJob() {
  downgradeEnforcementJob.start();
  logger.info("✅ Downgrade enforcement job scheduled");
}
