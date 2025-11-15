'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface Testimonial {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string | null;
  rating: number;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  project: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface TestimonialsResponse {
  success: boolean;
  data: {
    testimonials: Testimonial[];
    cursor: string | null;
    hasMore: boolean;
  };
}

interface UseTestimonialsParams {
  search?: string;
  status?: string;
  rating?: string;
  projectId?: string;
  cursor?: string;
  limit?: number;
}

export function useTestimonials(params?: UseTestimonialsParams) {
  return useQuery({
    queryKey: ['testimonials', params],
    queryFn: async () => {
      const response = await apiClient.get<TestimonialsResponse>('/admin/testimonials', {
        params,
      });
      return response.data.data;
    },
  });
}

interface UpdateTestimonialStatusParams {
  testimonialId: string;
  status: 'APPROVED' | 'REJECTED' | 'FLAGGED';
}

export function useUpdateTestimonialStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testimonialId, status }: UpdateTestimonialStatusParams) => {
      const response = await apiClient.patch(
        `/admin/testimonials/${testimonialId}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate testimonials queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

interface BulkUpdateTestimonialsParams {
  testimonialIds: string[];
  status: 'APPROVED' | 'REJECTED' | 'FLAGGED';
  dryRun?: boolean;
}

interface BulkUpdatePreview {
  id: string;
  currentStatus: string;
  newStatus: string;
  authorName: string;
  projectName: string;
  content: string;
}

interface BulkUpdateResponse {
  success: boolean;
  data: {
    affectedCount?: number;
    preview?: BulkUpdatePreview[];
    updated?: number;
    failed?: number;
    errors?: Array<{ id: string; error: string }>;
  };
}

export function useBulkUpdateTestimonials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testimonialIds, status, dryRun = false }: BulkUpdateTestimonialsParams) => {
      const response = await apiClient.post<BulkUpdateResponse>(
        '/admin/testimonials/bulk-update',
        { testimonialIds, status, dryRun }
      );
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Only invalidate if not a dry run
      if (!variables.dryRun) {
        queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      }
    },
  });
}
