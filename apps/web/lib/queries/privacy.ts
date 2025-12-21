import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

interface AccessRequestPayload {
    email: string;
}

interface PrivacyDataResponse {
    message: string;
    data: {
        email: string;
        count: number;
        testimonials: any[];
    };
}

/**
 * Request data access link (Public)
 */
export function useRequestPrivacyAccess() {
    const api = useApi();

    return useMutation({
        mutationFn: async (data: AccessRequestPayload) => {
            const response = await api.post("/api/privacy/access", data);
            return response.data;
        },
    });
}

/**
 * Fetch user privacy data (Protected by Magic Link Token)
 */
export function usePrivacyData(token: string | null) {
    const api = useApi();

    return useQuery({
        queryKey: ["privacy", "data", token],
        queryFn: async () => {
            if (!token) throw new Error("No token provided");

            const response = await api.get("/api/privacy/data", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data as PrivacyDataResponse;
        },
        enabled: !!token,
        retry: false,
    });
}

/**
 * Anonymize user data (Protected by Magic Link Token)
 */
export function useAnonymizeData() {
    const queryClient = useQueryClient();
    const api = useApi();

    return useMutation({
        mutationFn: async (token: string) => {
            const response = await api.delete("/api/privacy/data", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["privacy", "data"] });
        },
    });
}
