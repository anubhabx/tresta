'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import { exportToCSV, type CsvRow } from '../utils/csv-export';
import { toast } from 'sonner';

interface ExportParams {
  entityType: string;
  data: CsvRow[];
  columns: string[];
  filenamePrefix: string;
}

export function useExport() {
  return useMutation({
    mutationFn: async ({ entityType, data, columns, filenamePrefix }: ExportParams) => {
      // Log export action
      await apiClient.post('/admin/exports/log', {
        entityType,
        recordCount: data.length,
      });

      // Perform export
      exportToCSV(data, columns, filenamePrefix);

      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast.success(`Exported ${variables.data.length} records to CSV`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    },
  });
}
