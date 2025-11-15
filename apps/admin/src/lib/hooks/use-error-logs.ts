'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface ErrorLog {
  id: string;
  requestId: string;
  message: string;
  stacktrace: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  userId: string | null;
  requestPath: string | null;
  metadata: any;
  sentryId: string | null;
  createdAt: string;
}

interface ErrorLogsResponse {
  success: boolean;
  data: {
    errors: ErrorLog[];
    cursor: string | null;
    hasMore: boolean;
  };
}

interface UseErrorLogsParams {
  severity?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export function useErrorLogs(params?: UseErrorLogsParams) {
  return useQuery({
    queryKey: ['error-logs', params],
    queryFn: async () => {
      const response = await apiClient.get<ErrorLogsResponse>('/admin/errors', {
        params,
      });
      return response.data.data;
    },
  });
}
