/**
 * TanStack Query hooks for moderation functionality
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { ModerationQueueResponse } from "@/types/api";

interface ModerationQueueFilters {
  status?: "pending" | "flagged" | "approved" | "rejected";
  verified?: "true" | "false";
  page?: number;
  limit?: number;
}

interface BulkModerationPayload {
  testimonialIds: string[];
  action: "approve" | "reject" | "flag";
}

/**
 * Query: Get moderation queue
 */
function useGetModerationQueue(slug: string, filters?: ModerationQueueFilters) {
  const api = useApi();

  return useQuery({
    queryKey: ["moderation", "queue", slug, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.verified) params.append("verified", filters.verified);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await api.get<ModerationQueueResponse>(
        `/api/projects/${slug}/testimonials/moderation/queue?${params.toString()}`,
      );
      return response.data;
    },
    enabled: !!slug,
  });
}

/**
 * Mutation: Bulk moderation action
 */
function useBulkModerationAction(slug: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkModerationPayload) => {
      const response = await api.post(
        `/api/projects/${slug}/testimonials/moderation/bulk`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate moderation queue
      queryClient.invalidateQueries({
        queryKey: ["moderation", "queue", slug],
      });
      // Invalidate testimonials list
      queryClient.invalidateQueries({
        queryKey: ["testimonials", "list", slug],
      });
    },
  });
}

export const moderation = {
  queries: {
    useGetQueue: useGetModerationQueue,
  },
  mutations: {
    useBulkAction: useBulkModerationAction,
  },
};
