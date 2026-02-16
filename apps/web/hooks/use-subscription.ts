import { useQuery } from "@tanstack/react-query";
import { useApi } from "./use-api";
import type {
    ApiSuccessResponse,
    SubscriptionDetailsData,
} from "@workspace/types";

export type SubscriptionDetails = SubscriptionDetailsData;

export function useSubscription() {
        const api = useApi();

        const fetchSubscription = async (): Promise<SubscriptionDetails | null> => {
            try {
                const res = await api.get<ApiSuccessResponse<SubscriptionDetails>>(
                    "/api/payments/subscription",
                );
                return res.data?.data ?? null;
            } catch {
                return null;
            }
        };

        const { data, isLoading } = useQuery({
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
