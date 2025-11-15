'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface AlertConfig {
  emailQuotaThreshold: number;
  dlqCountThreshold: number;
  failedJobRateThreshold: number;
  slackWebhookUrl: string;
}

interface AlertHistory {
  id: string;
  alertType: string;
  message: string;
  triggeredAt: string;
  resolved: boolean;
}

interface AlertsResponse {
  success: boolean;
  data: {
    config: AlertConfig;
    history: AlertHistory[];
  };
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await apiClient.get<AlertsResponse>('/admin/alerts');
      return response.data.data;
    },
  });
}

interface UpdateAlertConfigParams {
  emailQuotaThreshold?: number;
  dlqCountThreshold?: number;
  failedJobRateThreshold?: number;
  slackWebhookUrl?: string;
}

export function useUpdateAlertConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateAlertConfigParams) => {
      const response = await apiClient.put('/admin/alerts/config', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
