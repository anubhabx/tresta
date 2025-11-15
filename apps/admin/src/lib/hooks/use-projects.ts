'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface Project {
  id: string;
  name: string;
  slug: string;
  type: string;
  visibility: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  testimonialsCount: number;
  pendingCount: number;
  approvedCount: number;
}

interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    cursor: string | null;
    hasMore: boolean;
  };
}

interface UseProjectsParams {
  search?: string;
  type?: string;
  visibility?: string;
  cursor?: string;
  limit?: number;
}

export function useProjects(params?: UseProjectsParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await apiClient.get<ProjectsResponse>('/admin/projects', {
        params,
      });
      return response.data.data;
    },
  });
}

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  logoUrl: string | null;
  projectType: string;
  websiteUrl: string | null;
  visibility: string;
  isActive: boolean;
  autoModeration: boolean;
  autoApproveVerified: boolean;
  profanityFilterLevel: string;
  brandColorPrimary: string | null;
  brandColorSecondary: string | null;
  socialLinks: any;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    plan: string;
  };
  stats: {
    testimonialCounts: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      flagged: number;
    };
    widgetCount: number;
    apiKeyCount: number;
  };
  recentTestimonials: Array<{
    id: string;
    content: string;
    authorName: string;
    rating: number;
    moderationStatus: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      name: string;
    } | null;
  }>;
}

export function useProject(projectId: string) {
  return useQuery<ProjectDetail>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/projects/${projectId}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
}
