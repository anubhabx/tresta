"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useUpgradeModal } from "@/components/billing/upgrade-modal";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import { Loader2, RefreshCcw } from "lucide-react";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import { useSubscription } from "@/hooks/use-subscription";

// We can fetch the subscription details to show current plan
// For now, we rely on what we know or fetch it.
// Assuming we can get current plan from an API endpoint or user metadata.
// The `PricingTable` fetches plans. We might want a hook for `useSubscription`.

export function BillingSection() {
  const { open } = useUpgradeModal();
  const api = useApi();
  const queryClient = useQueryClient();

  // Use shared hook for data
  const { data, isLoading } = useSubscription();

  // Cancel Mutation (could be moved to hook too, but fine here for now)
  const { mutate: cancelSubscription, isPending: isCanceling } = useMutation({
    mutationFn: async () => {
      await api.post("/api/payments/cancel");
    },
    onSuccess: () => {
      toast.success("Subscription Canceled", {
        description:
          "Your subscription will remain active until the end of the billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["subscription-details"] });
    },
    onError: (error: any) => {
      toast.error("Cancellation Failed", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan & Billing</CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const plan = data?.plan;
  const subscription = data?.subscription;
  const usage = data?.usage;

  const isPro = plan?.type === "PRO";
  const isActive = subscription?.status === "ACTIVE";
  const isCanceled = subscription?.cancelAtPeriodEnd;

  // Usage Helpers
  const getLimitText = (limit: number, current: number) => {
    if (limit === -1) return `${current} / Unlimited`;
    return `${current} / ${limit}`;
  };

  const getProgress = (limit: number, current: number) => {
    if (limit <= 0) return 0;
    if (limit === -1) return 100; // Always full bar for unlimited or just hidden?
    const percent = (current / limit) * 100;
    return Math.min(percent, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Plan & Billing</CardTitle>
            <CardDescription>
              Manage your subscription, view usage, and download invoices.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Current Plan Block */}
        <div className="flex items-center justify-between p-6 border rounded-lg bg-secondary/5">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {plan?.name || "Free Plan"}
              <Badge
                variant={isPro ? "default" : "secondary"}
                className="text-xs uppercase"
              >
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              {isPro
                ? "You are on the Pro plan."
                : "Upgrade to unlock more features."}
              {isCanceled && subscription.currentPeriodEnd && (
                <span className="text-destructive block mt-1">
                  Cancels on{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            {!isPro && (
              <Button onClick={open} variant="default">
                Upgrade Plan
              </Button>
            )}
            {isPro && !isCanceled && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => cancelSubscription()}
                disabled={isCanceling}
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            )}
            {isPro && isCanceled && (
              <Button onClick={open} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Renew Plan
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Usage Limits Block (New Design) */}
        {usage && plan?.limits && (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Usage & Quotas
            </h4>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Projects */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Projects</span>
                  <span className="text-muted-foreground">
                    {getLimitText(plan.limits.projects, usage.projects)}
                  </span>
                </div>
                {/* Custom High-Contrast Bar */}
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 dark:bg-white transition-all duration-500 ease-out"
                    style={{
                      width: `${getProgress(plan.limits.projects, usage.projects)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Widgets */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Widgets</span>
                  <span className="text-muted-foreground">
                    {getLimitText(plan.limits.widgets, usage.widgets)}
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 dark:bg-white transition-all duration-500 ease-out"
                    style={{
                      width: `${getProgress(plan.limits.widgets, usage.widgets)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Testimonials</span>
                  <span className="text-muted-foreground">
                    {getLimitText(plan.limits.testimonials, usage.testimonials)}
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 dark:bg-white transition-all duration-500 ease-out"
                    style={{
                      width: `${getProgress(plan.limits.testimonials, usage.testimonials)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Invoice History (Mock for now) */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Invoice History
          </h4>
          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Mock Rows */}
                <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">Oct 01, 2023</td>
                  <td className="p-4">$19.00</td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      Paid
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8">
                      Download
                    </Button>
                  </td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">Sep 01, 2023</td>
                  <td className="p-4">$19.00</td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50"
                    >
                      Paid
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8">
                      Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
