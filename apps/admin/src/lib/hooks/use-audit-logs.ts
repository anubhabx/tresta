'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface AuditLog {
  id: string;
  requestId: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  actionType: string;
  targetType: string;
  targetId: string;
  beforeSnapshot: any;
  afterSnapshot: any;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    cursor: string | null;
    hasMore: boolean;
  };
}

interface UseAuditLogsParams {
  adminId?: string;
  actionType?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export function useAuditLogs(params?: UseAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const response = await apiClient.get<AuditLogsResponse>('/admin/audit-logs', {
        params,
      });
      return response.data.data;
    },
  });
}
