'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { toast } from 'sonner';

interface ExportUserDataResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresAt: string;
    exportId: string;
  };
}

export function useExportUserData() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post<ExportUserDataResponse>(
        `/admin/users/${userId}/export`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
      toast.success('User data export started. Download will begin shortly.');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to export user data'
      );
    },
  });
}
