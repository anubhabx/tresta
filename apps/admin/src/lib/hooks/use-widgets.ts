'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from 'sonner';
import type { WidgetConfig } from '@workspace/types';

interface Widget {
  id: string;
  projectId: string;
  name: string;
  type: string;
  config: WidgetConfig;
  createdAt: string;
  updatedAt: string;
  stats?: {
    impressions: number;
    clicks: number;
  };
}

interface WidgetsResponse {
  success: boolean;
  data: {
    widgets: Widget[];
  };
}

interface CreateWidgetPayload {
  projectId: string;
  name: string;
  type: string;
  config: WidgetConfig;
}

interface UpdateWidgetPayload {
  name?: string;
  config?: Partial<WidgetConfig>;
}

export function useWidgets(projectId?: string) {
  return useQuery({
    queryKey: ['widgets', projectId],
    queryFn: async () => {
      const url = projectId ? `/admin/widgets?projectId=${projectId}` : '/admin/widgets';
      const response = await apiClient.get<WidgetsResponse>(url);
      return response.data.data.widgets;
    },
    enabled: !!projectId,
  });
}

export function useWidget(widgetId: string) {
  return useQuery<Widget>({
    queryKey: ['widgets', widgetId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/widgets/${widgetId}`);
      return response.data.data;
    },
    enabled: !!widgetId,
  });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWidgetPayload) => {
      const response = await apiClient.post('/admin/widgets', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
      toast.success('Widget created successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || 'Failed to create widget');
    },
  });
}

export function useUpdateWidget(widgetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateWidgetPayload) => {
      const response = await apiClient.patch(`/admin/widgets/${widgetId}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', widgetId] });
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
      toast.success('Widget updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || 'Failed to update widget');
    },
  });
}

export function useDeleteWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgetId: string) => {
      await apiClient.delete(`/admin/widgets/${widgetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
      toast.success('Widget deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || 'Failed to delete widget');
    },
  });
}
