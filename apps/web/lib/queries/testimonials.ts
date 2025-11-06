import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type {
  ApiResponse,
  PaginatedResponse,
  Testimonial,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "@/types/api";

// Query Keys
export const testimonialKeys = {
  all: ["testimonials"] as const,
  lists: () => [...testimonialKeys.all, "list"] as const,
  list: (slug: string, page: number, limit: number) =>
    [...testimonialKeys.lists(), slug, page, limit] as const,
  details: () => [...testimonialKeys.all, "detail"] as const,
  detail: (id: string) => [...testimonialKeys.details(), id] as const,
};

// Queries
export const useTestimonialList = (
  slug: string,
  page: number = 1,
  limit: number = 10,
) => {
  const api = useApi();

  return useQuery({
    queryKey: testimonialKeys.list(slug, page, limit),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Testimonial>>(
        `/projects/${slug}/testimonials?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useTestimonialDetail = (slug: string, id: string) => {
  const api = useApi();

  return useQuery({
    queryKey: testimonialKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Testimonial>>(
        `/projects/${slug}/testimonials/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateTestimonial = (slug: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTestimonialPayload) => {
      const response = await api.post<ApiResponse<Testimonial>>(
        `/projects/${slug}/testimonials`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate testimonial lists for this project
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.lists(),
      });
    },
  });
};

export const useUpdateTestimonial = (slug: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTestimonialPayload;
    }) => {
      const response = await api.put<ApiResponse<Testimonial>>(
        `/projects/${slug}/testimonials/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.lists(),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.detail(variables.id),
        refetchType: 'active',
      });
    },
  });
};

export const useDeleteTestimonial = (slug: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<void>>(
        `/projects/${slug}/testimonials/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate testimonial lists
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.lists(),
      });
    },
  });
};

// Export as namespaced object for consistency with projects pattern
export const testimonials = {
  queries: {
    useList: useTestimonialList,
    useDetail: useTestimonialDetail,
  },
  mutations: {
    useCreate: useCreateTestimonial,
    useUpdate: useUpdateTestimonial,
    useDelete: useDeleteTestimonial,
  },
};
