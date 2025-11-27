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

export type SessionRow = Session & { id: string };
export type RecentSignInRow = RecentSignIn & { id: string };

interface SessionsResponse {
  success: boolean;
  data: {
    activeSessions: Session[];
    recentSignIns: RecentSignIn[];
  };
}

interface SessionsData {
  activeSessions: SessionRow[];
  recentSignIns: RecentSignInRow[];
}

export function useSessions() {
  return useQuery<SessionsData>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.get<SessionsResponse>('/admin/sessions');
      const payload = response.data.data;

      return {
        activeSessions: payload.activeSessions.map((session) => ({
          ...session,
          id: session.sessionId,
        })),
        recentSignIns: payload.recentSignIns.map((signIn) => ({
          ...signIn,
          id: `${signIn.userId}-${signIn.timestamp}`,
        })),
      };
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
