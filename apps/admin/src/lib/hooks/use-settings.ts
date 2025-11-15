'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface SystemSettings {
  emailQuotaLimit: number;
  ablyConnectionLimit: number;
  autoModerationEnabled: boolean;
  version: number;
}

interface SettingsResponse {
  success: boolean;
  data: SystemSettings;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiClient.get<SettingsResponse>('/admin/settings');
      return response.data.data;
    },
  });
}

interface UpdateSettingsParams {
  emailQuotaLimit?: number;
  ablyConnectionLimit?: number;
  autoModerationEnabled?: boolean;
  autoModerationThreshold?: number;
  maintenanceMode?: boolean;
  version: number;
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateSettingsParams) => {
      const response = await apiClient.put('/admin/settings', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
