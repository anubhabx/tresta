'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface SystemInfo {
  environment: string;
  versions: {
    api: string;
    node: string;
    redis: string;
    database: string;
  };
  featureFlags: Record<string, boolean>;
  externalServices: {
    clerk: {
      status: string;
    };
    ably: {
      status: string;
    };
    email: {
      provider: string;
      status: string;
    };
  };
  config: {
    emailQuotaLimit: string;
    ablyConnectionLimit: string;
    databaseUrl: string;
    redisUrl: string;
  };
}

interface SystemInfoResponse {
  success: boolean;
  data: SystemInfo;
}

export function useSystemInfo() {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      const response = await apiClient.get<SystemInfoResponse>('/admin/system');
      return response.data.data;
    },
  });
}
