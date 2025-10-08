import { projects } from "@/lib/queries";

export const useProjects = {
  list: projects.queries.useList,
  create: projects.mutations.useCreate
};
