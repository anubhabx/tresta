'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'PRO';
  projectCount: number;
  testimonialCount: number;
  joinedAt: string;
  lastLogin?: string | null;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    cursor: string | null;
    hasMore: boolean;
  };
}

export interface UseUsersParams {
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

export interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  plan: 'FREE' | 'PRO';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  stats: {
    projectCount: number;
    testimonialCount: number;
    apiKeyCount: number;
  };
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    visibility: string;
    projectType: string;
    isActive: boolean;
    createdAt: string;
    testimonialCounts: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      flagged: number;
    };
  }>;
}

export function useUser(userId: string) {
  return useQuery<UserDetail>({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}
