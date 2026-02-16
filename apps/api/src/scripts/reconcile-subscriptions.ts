import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { disconnectPrisma } from "@workspace/database/prisma";

import { reconcileStaleSubscriptions } from "../services/subscription-reconciliation.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function run() {
  try {
    const staleMinutes = Number(process.env.SUBSCRIPTION_STALE_MINUTES || "30");
    const limit = Number(process.env.SUBSCRIPTION_RECONCILIATION_LIMIT || "200");

    const result = await reconcileStaleSubscriptions({ staleMinutes, limit });

    console.log("Subscription reconciliation result:", result);
  } catch (error) {
    console.error("Subscription reconciliation script failed", error);
    process.exitCode = 1;
  } finally {
    await disconnectPrisma();
  }
}

run();
