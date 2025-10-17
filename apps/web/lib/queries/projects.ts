import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import type {
  Project,
  PaginatedResponse,
  ApiResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/types/api";

export const projects = {
  queries: {
    useList: (page: number = 1, limit: number = 10) => {
      const api = useApi();

      return useQuery<PaginatedResponse<Project>, Error>({
        queryKey: ["projects", "list", page, limit],
        queryFn: async () => {
          const response = await api.get<PaginatedResponse<Project>>(
            `/projects`,
            {
              params: { page, limit },
            },
          );
          return response.data;
        },
      });
    },

    useDetail: (slug: string) => {
      const api = useApi();

      return useQuery<Project, Error>({
        queryKey: ["projects", "detail", slug],
        queryFn: async () => {
          const response = await api.get<ApiResponse<Project>>(
            `/projects/${slug}`,
          );
          return response.data.data;
        },
        enabled: !!slug,
      });
    },
  },

  mutations: {
    useCreate: () => {
      const api = useApi();
      const queryClient = useQueryClient();

      return useMutation<Project, Error, CreateProjectPayload>({
        mutationFn: async (data: CreateProjectPayload) => {
          const response = await api.post<ApiResponse<Project>>(
            "/projects",
            data,
          );
          return response.data.data;
        },
        onSuccess: (newProject: Project) => {
          queryClient.setQueryData(
            ["projects", "detail", newProject.slug],
            newProject,
          );

          queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
        },
      });
    },

    useUpdate: (slug: string) => {
      const api = useApi();
      const queryClient = useQueryClient();

      return useMutation<Project, Error, UpdateProjectPayload>({
        mutationFn: async (data: UpdateProjectPayload) => {
          const response = await api.put<ApiResponse<Project>>(
            `/projects/${slug}`,
            data,
          );
          return response.data.data;
        },
        onSuccess: (updatedProject: Project) => {
          // Update detail cache
          queryClient.setQueryData(
            ["projects", "detail", slug],
            updatedProject,
          );

          // Update detail cache with new slug if slug changed
          if (updatedProject.slug !== slug) {
            queryClient.setQueryData(
              ["projects", "detail", updatedProject.slug],
              updatedProject,
            );
            queryClient.removeQueries({
              queryKey: ["projects", "detail", slug],
            });
          }

          // Invalidate list cache
          queryClient.invalidateQueries({ queryKey: ["projects", "list"] });

          toast.success("Project updated successfully!");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to update project");
        },
      });
    },

    useDelete: (slug: string) => {
      const api = useApi();
      const queryClient = useQueryClient();

      return useMutation<void, Error, void>({
        mutationFn: async () => {
          await api.delete(`/projects/${slug}`);
        },
        onSuccess: () => {
          // Remove from detail cache
          queryClient.removeQueries({ queryKey: ["projects", "detail", slug] });

          // Invalidate list cache
          queryClient.invalidateQueries({ queryKey: ["projects", "list"] });

          toast.success("Project deleted successfully!");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to delete project");
        },
      });
    },
  },
};
