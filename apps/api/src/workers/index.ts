import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { disconnectPrisma } from "@workspace/database/prisma";
import { disconnectRedis } from "../lib/redis.js";
import { closeAllQueues } from "../lib/queues.js";
import {
  startDailyDigestJob,
  dailyDigestJob,
} from "../jobs/daily-digest.job.js";
import {
  startReconciliationJob,
  reconciliationJob,
} from "../jobs/reconciliation.job.js";
import {
  startSubscriptionReconciliationJob,
  subscriptionReconciliationJob,
} from "../jobs/subscription-reconciliation.job.js";
import {
  scheduleWidgetAnalyticsJobs,
  performanceCheckJob,
  analyticsCleanupJob,
} from "../jobs/widget-analytics.job.js";
import {
  startDowngradeEnforcementJob,
  downgradeEnforcementJob,
} from "../jobs/downgrade-enforcement.job.js";
import { validateEnv } from "../config/env.js";
import { logger } from "../lib/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
validateEnv("worker");

type OutboxRuntime = {
  cleanup: () => Promise<unknown>;
};

type WorkerRuntime = {
  close: () => Promise<unknown>;
};

const workers: {
  outbox?: OutboxRuntime;
  notification?: WorkerRuntime;
  email?: WorkerRuntime;
} = {};

let auditRetryInterval: NodeJS.Timeout | undefined;

async function startWorkersAndJobs(): Promise<void> {
  if (process.env.DISABLE_WORKERS === "true") {
    logger.warn(
      "Workers and Cron Jobs are disabled via DISABLE_WORKERS env var",
    );
    return;
  }

  startDailyDigestJob();
  startReconciliationJob();
  startSubscriptionReconciliationJob();
  startDowngradeEnforcementJob();
  scheduleWidgetAnalyticsJobs();

  const { retryFailedAuditLogs } = await import(
    "../middleware/audit-log.middleware.js"
  );
  auditRetryInterval = setInterval(() => {
    retryFailedAuditLogs().catch((error: unknown) => {
      logger.error({ error }, "Audit log retry cycle failed");
    });
  }, 60_000);

  const { createOutboxWorker } = await import("./outbox.worker.js");
  const { createNotificationWorker } = await import("./notification.worker.js");
  const { createEmailWorker } = await import("./email.worker.js");

  workers.outbox = createOutboxWorker();
  workers.notification = createNotificationWorker();
  workers.email = createEmailWorker();
}

async function stopWorkersAndJobs(): Promise<void> {
  try {
    dailyDigestJob.stop();
    reconciliationJob.stop();
    subscriptionReconciliationJob.stop();
    performanceCheckJob.stop();
    analyticsCleanupJob.stop();
    downgradeEnforcementJob.stop();
  } catch (error) {
    logger.error({ error }, "Failed to stop one or more cron jobs");
  }

  if (auditRetryInterval) {
    clearInterval(auditRetryInterval);
    auditRetryInterval = undefined;
  }

  if (process.env.DISABLE_WORKERS !== "true") {
    if (workers.outbox) {
      await workers.outbox.cleanup();
    }
    if (workers.notification) {
      await workers.notification.close();
    }
    if (workers.email) {
      await workers.email.close();
    }
  }

  await closeAllQueues();
  await disconnectPrisma();
  await disconnectRedis();
}

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutting down workers");

  try {
    await stopWorkersAndJobs();
    logger.info("Worker graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Error during worker graceful shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Worker uncaught exception");
  void gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ promise, reason }, "Worker unhandled rejection");
  void gracefulShutdown("unhandledRejection");
});

logger.info("Starting workers and cron jobs");
await startWorkersAndJobs();
logger.info("Workers started successfully");
logger.info("Press Ctrl+C to stop");
