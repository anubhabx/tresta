import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type { ApiResponse } from "@/types/api";

// Re-export shared types
export type {
  Widget,
  WidgetConfig,
  WidgetLayout,
  WidgetTheme,
  CardStyle,
  AnimationType,
  CreateWidgetPayload,
  UpdateWidgetPayload,
} from "@workspace/types";

export { DEFAULT_WIDGET_CONFIG } from "@workspace/types";

export interface PublicWidgetData {
  widget: {
    id: string;
    embedType: string;
    config: WidgetConfig;
  };
  project: {
    name: string;
    slug: string;
    logoUrl: string | null;
    brandColorPrimary: string | null;
    brandColorSecondary: string | null;
  };
  testimonials: Array<{
    id: string;
    authorName: string;
    content: string;
    rating: number | null;
    videoUrl: string | null;
    type: string;
    createdAt: string;
  }>;
  meta: {
    total: number;
    fetchedAt: string;
  };
}

export interface CreateWidgetPayload {
  projectId: string;
  embedType: string;
  config: WidgetConfig;
}

export interface UpdateWidgetPayload {
  embedType?: string;
  config?: WidgetConfig;
}

// Query Keys Factory
export const widgetKeys = {
  all: ["widgets"] as const,
  lists: () => [...widgetKeys.all, "list"] as const,
  list: (projectSlug: string) => [...widgetKeys.lists(), projectSlug] as const,
  details: () => [...widgetKeys.all, "detail"] as const,
  detail: (widgetId: string) => [...widgetKeys.details(), widgetId] as const,
  public: (widgetId: string) =>
    [...widgetKeys.all, "public", widgetId] as const,
};

// Queries

/**
 * Fetch widgets for a specific project
 * Protected route - requires authentication
 */
export const useWidgetList = (projectSlug: string) => {
  const api = useApi();

  return useQuery({
    queryKey: widgetKeys.list(projectSlug),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Widget[]>>(
        `/widgets/project/${projectSlug}`,
      );
      return response.data.data;
    },
    enabled: !!projectSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes - widgets don't change often
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Fetch public widget data for embedding
 * Public route - no authentication required
 * AGGRESSIVE CACHING: Data is cached for 5 minutes on client
 * Matches server-side cache headers
 */
export const usePublicWidgetData = (widgetId: string) => {
  const api = useApi();

  return useQuery({
    queryKey: widgetKeys.public(widgetId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PublicWidgetData>>(
        `/widgets/${widgetId}/public`,
      );
      return response.data.data;
    },
    enabled: !!widgetId,
    // Aggressive caching for public widget data
    staleTime: 1000 * 60 * 5, // 5 minutes - matches server cache
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    // Retry on failure (network issues)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Mutations

/**
 * Create a new widget
 */
export const useCreateWidget = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWidgetPayload) => {
      const response = await api.post<ApiResponse<Widget>>("/widgets", data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate widget lists for this project
      queryClient.invalidateQueries({
        queryKey: widgetKeys.lists(),
      });
    },
  });
};

/**
 * Update widget configuration
 */
export const useUpdateWidget = (widgetId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWidgetPayload) => {
      const response = await api.put<ApiResponse<Widget>>(
        `/widgets/${widgetId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate widget lists and detail
      queryClient.invalidateQueries({
        queryKey: widgetKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: widgetKeys.detail(widgetId),
      });
      // Also invalidate public widget data since config changed
      queryClient.invalidateQueries({
        queryKey: widgetKeys.public(widgetId),
      });
    },
  });
};

/**
 * Delete a widget
 */
export const useDeleteWidget = (widgetId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete<ApiResponse<void>>(
        `/widgets/${widgetId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate widget lists
      queryClient.invalidateQueries({
        queryKey: widgetKeys.lists(),
      });
      // Remove widget detail from cache
      queryClient.removeQueries({
        queryKey: widgetKeys.detail(widgetId),
      });
      // Remove public widget data from cache
      queryClient.removeQueries({
        queryKey: widgetKeys.public(widgetId),
      });
    },
  });
};

// Export as namespaced object for consistency
export const widgets = {
  queries: {
    useList: useWidgetList,
    usePublicData: usePublicWidgetData,
  },
  mutations: {
    useCreate: useCreateWidget,
    useUpdate: useUpdateWidget,
    useDelete: useDeleteWidget,
  },
};
