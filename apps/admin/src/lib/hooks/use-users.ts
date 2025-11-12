'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'PRO';
  createdAt: string;
  lastLogin: string | null;
  projectsCount: number;
  testimonialsCount: number;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    cursor: string | null;
    hasMore: boolean;
  };
}

interface UseUsersParams {
  search?: string;
  plan?: string;
  cursor?: string;
  limit?: number;
}

export function useUsers(params?: UseUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await apiClient.get<UsersResponse>('/admin/users', { params });
      return response.data.data;
    },
  });
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'PRO';
  createdAt: string;
  lastLogin: string | null;
  projectsCount: number;
  testimonialsCount: number;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    testimonialsCount: number;
    pendingCount: number;
    approvedCount: number;
  }>;
}

export function useUser(userId: string) {
  return useQuery<UserDetail>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data.data.user;
    },
    enabled: !!userId,
  });
}
