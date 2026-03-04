import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiSuccessResponse } from "@workspace/types";
import { useApi } from "./use-api";

export interface ProjectOption {
  id: string;
  name: string;
  slug: string;
}

export interface AccountApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  usageCount: number;
  usageLimit: number | null;
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProjectLike {
  id: string;
  slug: string;
  name: string;
}

interface AccountApiKeysPayload {
  keys?: AccountApiKey[];
}

interface CreateApiKeyPayload {
  name: string;
  projectSlug: string;
  environment: "live";
  permissions: {
    widgets: boolean;
    testimonials: boolean;
  };
}

interface CreateApiKeyResponse {
  key?: string;
}

const isProjectLike = (value: unknown): value is ProjectLike => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string"
  );
};

export const ACCOUNT_API_KEYS_QUERY_KEY = ["account", "api-keys"] as const;
export const ACCOUNT_PROJECT_OPTIONS_QUERY_KEY = ["account", "project-options"] as const;

export function useAccountApiKeys() {
  const api = useApi();
  const queryClient = useQueryClient();

  const keysQuery = useQuery({
    queryKey: ACCOUNT_API_KEYS_QUERY_KEY,
    queryFn: async (): Promise<AccountApiKey[]> => {
      const response = await api.get<ApiSuccessResponse<AccountApiKeysPayload>>(
        "/api/account/api-keys",
      );
      return response.data?.data?.keys ?? [];
    },
  });

  const projectsQuery = useQuery({
    queryKey: ACCOUNT_PROJECT_OPTIONS_QUERY_KEY,
    queryFn: async (): Promise<ProjectOption[]> => {
      const response = await api.get<ApiSuccessResponse<unknown[]>>(
        "/api/projects?page=1&limit=100",
      );

      const rawProjects = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      return rawProjects.filter(isProjectLike).map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
      }));
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (payload: CreateApiKeyPayload): Promise<string | null> => {
      const response = await api.post<ApiSuccessResponse<CreateApiKeyResponse>>(
        "/api/account/api-keys",
        payload,
      );
      return response.data?.data?.key ?? null;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_API_KEYS_QUERY_KEY });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string): Promise<void> => {
      await api.delete(`/api/account/api-keys/${keyId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_API_KEYS_QUERY_KEY });
    },
  });

  return {
    keys: keysQuery.data ?? [],
    projects: projectsQuery.data ?? [],
    isLoadingKeys: keysQuery.isLoading,
    isLoadingProjects: projectsQuery.isLoading,
    isCreating: createKeyMutation.isPending,
    isRevoking: revokeKeyMutation.isPending,
    createKey: createKeyMutation.mutateAsync,
    revokeKey: revokeKeyMutation.mutateAsync,
  };
}
