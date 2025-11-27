'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface Session {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: string;
  createdAt: string;
}

export interface RecentSignIn {
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  timestamp: string;
}

interface SessionsResponse {
  success: boolean;
  data: {
    activeSessions: Session[];
    recentSignIns: RecentSignIn[];
  };
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.get<SessionsResponse>('/admin/sessions');
      return response.data.data;
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.post(`/admin/sessions/${sessionId}/revoke`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
