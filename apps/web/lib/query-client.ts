import { useApi } from "@/hooks/use-api";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { Project, PaginatedResponse, ApiResponse } from "@/types/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export function useProjects(page = 1, limit = 10) {
  const api = useApi();

  return useQuery({
    queryKey: ["projects", page, limit],

    queryFn: async () => {
      const response = await api.get("/projects", {
        params: { page, limit }
      });
      return response.data;
    }
  });
}
