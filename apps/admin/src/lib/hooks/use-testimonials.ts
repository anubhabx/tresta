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
