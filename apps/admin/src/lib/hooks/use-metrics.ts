'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface MetricsData {
  emailQuota: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
    locked: boolean;
    nextRetry: string | null;
  };
  ablyConnections: {
    current: number;
    limit: number;
    percentage: number;
  };
  metrics: {
    notificationsSent: number;
    emailsSent: number;
    emailsDeferred: number;
    emailsFailed: number;
  };
  queues: {
    dlqCount: number;
    outboxPending: number;
  };
  history: Array<{
    date: string;
    sent: number;
    deferred: number;
    failed: number;
  }>;
  timestamp: string;
}

export function useMetrics(refetchInterval?: number) {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: MetricsData }>(
        '/admin/metrics'
      );
      return response.data.data;
    },
    refetchInterval: refetchInterval || 60000, // Default: 60 seconds
  });
}
