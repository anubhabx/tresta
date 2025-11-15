'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface HealthData {
  status: 'ready' | 'not ready';
  checks: {
    database: boolean;
    redis: boolean;
    bullmq: boolean;
  };
  timestamp: string;
}

export function useHealth(refetchInterval?: number) {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get<HealthData>('/readyz');
      return response.data;
    },
    refetchInterval: refetchInterval || 30000, // Default: 30 seconds
  });
}
