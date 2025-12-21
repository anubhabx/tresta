import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  updatedAt: string;
}

interface PreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

/**
 * Fetch notifications with cursor-based pagination
 */
export function useNotificationList() {
  const api = useApi();

  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      const params: any = {};
      if (pageParam) {
        params.cursor = pageParam;
      }

      const response = await api.get("/api/notifications", { params });
      return response.data as NotificationListResponse;
    },
    getNextPageParam: (lastPage) => lastPage.data.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

/**
 * Fetch unread notification count
 * Polls every 30 seconds when Ably is disconnected
 */
export function useUnreadCount(isAblyConnected: boolean) {
  const api = useApi();

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await api.get("/api/notifications/unread-count");
      return response.data as UnreadCountResponse;
    },
    // Poll every 30 seconds when Ably is disconnected
    refetchInterval: false,
  });
}

/**
 * Fetch notification preferences
 */
export function useNotificationPreferences() {
  const api = useApi();

  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: async () => {
      const response = await api.get("/api/notifications/preferences");
      return response.data as PreferencesResponse;
    },
  });
}

/**
 * Mark a notification as read
 */
export function useMarkAsRead() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch(`/api/notifications/${notificationId}`, { isRead: true });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/notifications/mark-all-read");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

/**
 * Update notification preferences
 */
export function useUpdatePreferences() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailEnabled: boolean) => {
      const response = await api.put("/api/notifications/preferences", { emailEnabled });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
    },
  });
}
