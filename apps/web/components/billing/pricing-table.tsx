
"use client";
import { formatPlanLabel } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Check } from "lucide-react";
import { CheckoutButton } from "./checkout-button";
import { useUser } from "@clerk/nextjs";

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    limits: any;
    type: string;
}

export function PricingTable() {
    const api = useApi();
    const { user } = useUser();
    // Assuming user plan is stored in publicMetadata or we fetch it from subscription API
    // For now, let's assume we fetch current subscription status separately or user object has it if synced.
    // But schema says User has 'plan' enum.
    // We can check user.publicMetadata.plan or similar if we sync it.
    // Or just rely on the button to handle "Current Plan" logic if we pass current plan as prop.

    const { data: plans, isLoading } = useQuery<Plan[]>({
        queryKey: ["plans"],
        queryFn: async () => {
            const res = await api.get("/api/plans");
            return res.data.data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading plans...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-3xl font-bold mb-4">
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: plan.currency,
                                minimumFractionDigits: 0,
                            }).format(plan.price / 100)}
                            <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                        </div>
                        <div className="space-y-2">
                            {/* Render limits/features if available in description or limits object */}
                            <ul className="space-y-2 text-sm">
                                {plan.limits && Object.entries(plan.limits).map(([key, value]) => (
                                    <li key={key} className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        <span>{formatPlanLabel(key)}: {value === -1 ? 'Unlimited' : value as string}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <CheckoutButton planId={plan.id} planName={plan.name} price={plan.price} />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
