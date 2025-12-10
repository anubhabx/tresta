import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";
import { toast } from "sonner";

export interface SubscriptionDetails {
    plan: {
        id: string;
        name: string;
        interval: string;
        price: number;
        limits: any;
        type: "FREE" | "PRO";
    } | null;
    subscription: {
        id: string;
        status: string;
        currentPeriodEnd: string | null;
        cancelAtPeriodEnd: boolean;
    } | null;
    usage: {
        projects: number;
        widgets: number;
        testimonials: number;
    } | null;
}

export function useSubscription() {
    const api = useApi();
    const queryClient = useQueryClient();

    const fetchSubscription = async () => {
        try {
            const res = await api.get("/api/payments/subscription");
            return res.data?.data as SubscriptionDetails;
        } catch (error) {
            return null;
        }
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["subscription-details"],
        queryFn: fetchSubscription,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        data,
        isLoading,
        isPro: data?.plan?.type === "PRO",
        isCanceled: data?.subscription?.cancelAtPeriodEnd,
        subscription: data?.subscription,
        plan: data?.plan,
        usage: data?.usage,
    };
}
