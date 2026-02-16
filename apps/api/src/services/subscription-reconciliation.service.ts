import { prisma } from "@workspace/database/prisma";

import { getSubscription } from "./razorpay.service.js";
import { mapProviderStatusToInternal } from "./subscription-status.service.js";

type ReconcileOptions = {
  staleMinutes?: number;
  limit?: number;
};

type ReconcileResult = {
  scanned: number;
  updated: number;
  canceledLocally: number;
  failed: number;
  skipped: number;
};

const DEFAULT_STALE_MINUTES = 30;
const DEFAULT_LIMIT = 100;

const getCutoffDate = (staleMinutes: number): Date => {
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - staleMinutes);
  return cutoff;
};

export const reconcileStaleSubscriptions = async (
  options: ReconcileOptions = {},
): Promise<ReconcileResult> => {
  const staleMinutes = options.staleMinutes ?? DEFAULT_STALE_MINUTES;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const cutoff = getCutoffDate(staleMinutes);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      OR: [
        { status: "INCOMPLETE" },
        { providerStatus: { in: ["created", "authenticated", "pending", "halted"] } },
      ],
      updatedAt: { lt: cutoff },
    },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });

  const result: ReconcileResult = {
    scanned: subscriptions.length,
    updated: 0,
    canceledLocally: 0,
    failed: 0,
    skipped: 0,
  };

  for (const subscription of subscriptions) {
    try {
      if (!subscription.externalSubscriptionId) {
        await prisma.$transaction(async (tx) => {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "CANCELED",
              providerStatus: subscription.providerStatus || "expired",
              lastWebhookEventType: "local.reconciliation.missing_external_subscription_id",
              lastWebhookAt: new Date(),
            },
          });

          await tx.user.update({
            where: { id: subscription.userId },
            data: { plan: "FREE" },
          });
        });

        result.canceledLocally += 1;
        continue;
      }

      const providerSubscription = await getSubscription(subscription.externalSubscriptionId);
      const providerStatus = providerSubscription.status;
      const mappedStatus = mapProviderStatusToInternal(providerStatus);

      const currentPeriodStart = providerSubscription.current_start
        ? new Date(providerSubscription.current_start * 1000)
        : subscription.currentPeriodStart;
      const currentPeriodEnd = providerSubscription.current_end
        ? new Date(providerSubscription.current_end * 1000)
        : subscription.currentPeriodEnd;
      const cancelAtCycleEnd =
        (providerSubscription as unknown as { cancel_at_cycle_end?: boolean | number })
          .cancel_at_cycle_end;

      await prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            status: mappedStatus,
            providerStatus,
            currentPeriodStart,
            currentPeriodEnd,
            externalCustomerId:
              providerSubscription.customer_id || subscription.externalCustomerId,
            cancelAtPeriodEnd:
              Boolean(cancelAtCycleEnd) ||
              subscription.cancelAtPeriodEnd,
            lastWebhookEventType: "local.reconciliation.provider_fetch",
            lastWebhookAt: new Date(),
          },
        });

        if (mappedStatus === "ACTIVE") {
          await tx.user.update({
            where: { id: subscription.userId },
            data: { plan: subscription.userPlan },
          });
        }

        if (mappedStatus === "CANCELED") {
          await tx.user.update({
            where: { id: subscription.userId },
            data: { plan: "FREE" },
          });
        }
      });

      result.updated += 1;
    } catch (error) {
      console.error(
        `Subscription reconciliation failed for ${subscription.id}`,
        error,
      );
      result.failed += 1;
    }
  }

  return result;
};
