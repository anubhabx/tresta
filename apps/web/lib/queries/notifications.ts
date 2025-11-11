import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const { getToken } = useAuth();

  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      const url = new URL(`${API_URL}/api/notifications`);
      
      if (pageParam) {
        url.searchParams.set("cursor", pageParam);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return response.json() as Promise<NotificationListResponse>;
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
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      return response.json() as Promise<UnreadCountResponse>;
    },
    // Poll every 30 seconds when Ably is disconnected
    refetchInterval: isAblyConnected ? false : 30000,
  });
}

/**
 * Fetch notification preferences
 */
export function useNotificationPreferences() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/notifications/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      return response.json() as Promise<PreferencesResponse>;
    },
  });
}

/**
 * Mark a notification as read
 */
export function useMarkAsRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return response.json();
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      return response.json();
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailEnabled: boolean) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/notifications/preferences`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailEnabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
    },
  });
}
