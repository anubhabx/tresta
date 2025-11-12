'use client';

import { useQuery } from '@tanstack/react-query';
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
