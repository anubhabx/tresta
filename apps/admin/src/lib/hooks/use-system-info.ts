'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
}

interface ExternalService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  lastChecked: string;
}

interface SystemInfo {
  environment: 'development' | 'staging' | 'production';
  apiVersion: string;
  databaseVersion: string;
  redisVersion: string;
  nodeVersion: string;
  featureFlags: FeatureFlag[];
  externalServices: ExternalService[];
}

interface SystemInfoResponse {
  success: boolean;
  data: {
    systemInfo: SystemInfo;
  };
}

export function useSystemInfo() {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: async () => {
      const response = await apiClient.get<SystemInfoResponse>('/admin/system');
      return response.data.data.systemInfo;
    },
  });
}
