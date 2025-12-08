
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

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

// We can fetch the subscription details to show current plan
// For now, we rely on what we know or fetch it.
// Assuming we can get current plan from an API endpoint or user metadata.
// The `PricingTable` fetches plans. We might want a hook for `useSubscription`.

export function BillingSection() {
    const { open } = useUpgradeModal();
    const api = useApi();

    // Fetch current subscription
    const { data: subscription, isLoading } = useQuery({
        queryKey: ["subscription"],
        queryFn: async () => {
            try {
                // We don't have a direct /api/subscription endpoint yet, but maybe /api/users/me or similar?
                // Or we can just show "Free" vs "Pro" based on user metadata if synced.
                // Let's assume we want to show generic "Upgrade" for now, or fetch if possible.
                // Actually, let's just show the upgrade CTA.
                // Ideally we successfully implemented /api/payments/subscription but not a 'get current sub'
                // Let's leave it simple: "Current Plan" section.
                return null;
            } catch (e) {
                return null;
            }
        },
        enabled: false // Disable for now as we don't have the endpoint
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Plan & Billing</CardTitle>
                <CardDescription>
                    Manage your subscription and billing details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/10">
                    <div className="space-y-1">
                        <p className="font-medium">Current Plan</p>
                        <div className="flex items-center gap-2">
                            {/* 
                  Ideally this should be dynamic. 
                  Since we haven't implemented a "get my subscription" endpoint yet, 
                  we'll default to displaying it as "Free" or fetch user metadata if available.
                */}
                            <Badge variant="outline" className="text-base px-3 py-1">
                                Free
                            </Badge>
                        </div>
                    </div>
                    <Button onClick={open} variant="default">
                        Upgrade Plan
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
