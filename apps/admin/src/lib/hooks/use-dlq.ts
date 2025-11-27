'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from 'sonner';

export interface DLQJob {
  id: string;
  jobId: string;
  queue: string;
  data: Record<string, unknown>;
  error: string;
  errorType: 'transient' | 'permanent';
  statusCode: number | null;
  retried: boolean;
  retriedAt: string | null;
  failedAt: string;
}

interface DLQResponse {
  success: boolean;
  data: {
    jobs: DLQJob[];
    total: number;
    limit: number;
  };
}

interface RequeueJobResponse {
  success: boolean;
  message?: string;
}

export function useDLQ(params?: { queue?: string; errorType?: string; limit?: number }) {
  return useQuery({
    queryKey: ['dlq', params],
    queryFn: async () => {
      const response = await apiClient.get<DLQResponse>('/admin/dlq', { params });
      return response.data.data;
    },
  });
}

export function useRequeueJob() {
  const queryClient = useQueryClient();

  return useMutation<RequeueJobResponse, unknown, string>({
    mutationFn: async (jobId: string) => {
      const response = await apiClient.post<RequeueJobResponse>(`/admin/dlq/${jobId}/requeue`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
      toast.success('Job requeued successfully');
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { error?: { message?: string } } } };
        toast.error(err.response?.data?.error?.message || 'Failed to requeue job');
        return;
      }
      toast.error('Failed to requeue job');
    },
  });
}
