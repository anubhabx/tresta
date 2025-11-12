'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from 'sonner';

interface DLQJob {
  id: string;
  jobId: string;
  queue: string;
  data: any;
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

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiClient.post(`/admin/dlq/${jobId}/requeue`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
      toast.success('Job requeued successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to requeue job');
    },
  });
}
