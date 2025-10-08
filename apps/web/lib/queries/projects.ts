import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";
import type {
  Project,
  PaginatedResponse,
  ApiResponse,
  CreateProjectPayload,
  UpdateProjectPayload
} from "@/types/api";

export const projects = {
  queries: {
    useList: (page: number = 1, limit: number = 10) => {
      const api = useApi();

      return useQuery<PaginatedResponse<Project>, Error>({
        queryKey: ["projects", "list", page, limit],
        queryFn: async () => {
          const response = await api.get<PaginatedResponse<Project>>(
            `/projects?page=${page}&limit=${limit}`,
            {
              params: { page, limit }
            }
          );
          return response.data;
        }
      });
    }
  },

  mutations: {
    useCreate: () => {
      const api = useApi();
      const queryClient = useQueryClient();

      return useMutation<Project, Error, CreateProjectPayload>({
        mutationFn: async (data: CreateProjectPayload) => {
          const response = await api.post<ApiResponse<Project>>(
            "/projects",
            data
          );
          return response.data.data;
        },
        onSuccess: (newProject: Project) => {
          queryClient.setQueryData(
            ["projects", "detail", newProject.slug],
            newProject
          );

          queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
        }
      });
    }
  }
};
