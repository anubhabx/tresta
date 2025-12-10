
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
                description: "Your subscription will remain active until the end of the billing period.",
            });
            queryClient.invalidateQueries({ queryKey: ["subscription-details"] });
        },
        onError: (error: any) => {
            toast.error("Cancellation Failed", {
                description: error.response?.data?.message || "Something went wrong.",
            });
        }
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
                <CardTitle>Plan & Billing</CardTitle>
                <CardDescription>
                    Manage your subscription and billing details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Plan Block */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant={isPro ? "default" : "outline"} className="text-base px-3 py-1">
                                {plan?.name || "Free"}
                            </Badge>
                            {isCanceled && subscription.currentPeriodEnd && (
                                <Badge variant="destructive" className="text-xs">
                                    Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </Badge>
                            )}
                            {isCanceled && !subscription.currentPeriodEnd && (
                                <Badge variant="destructive" className="text-xs">
                                    Cancels at period end
                                </Badge>
                            )}
                        </div>
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
                                className="text-destructive hover:text-destructive"
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
                            <Button onClick={open}>
                                <RefreshCcw />
                                Renew Plan
                            </Button>
                        )}
                    </div>
                </div>

                {/* Usage Limits Block */}
                {usage && plan?.limits && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Usage Limits</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Projects */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Projects</span>
                                    <span className="text-muted-foreground">
                                        {getLimitText(plan.limits.projects, usage.projects)}
                                    </span>
                                </div>
                                {plan.limits.projects !== -1 && (
                                    <Progress value={getProgress(plan.limits.projects, usage.projects)} className="h-2" />
                                )}
                            </div>

                            {/* Widgets */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Widgets</span>
                                    <span className="text-muted-foreground">
                                        {getLimitText(plan.limits.widgets, usage.widgets)}
                                    </span>
                                </div>
                                {plan.limits.widgets !== -1 && (
                                    <Progress value={getProgress(plan.limits.widgets, usage.widgets)} className="h-2" />
                                )}
                            </div>

                            {/* Testimonials */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Testimonials</span>
                                    <span className="text-muted-foreground">
                                        {getLimitText(plan.limits.testimonials, usage.testimonials)}
                                    </span>
                                </div>
                                {plan.limits.testimonials !== -1 && (
                                    <Progress value={getProgress(plan.limits.testimonials, usage.testimonials)} className="h-2" />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
