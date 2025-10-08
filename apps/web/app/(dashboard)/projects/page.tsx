"use client";

import { EmptyProjects } from "@/components/empty-projects";
import { LoadingStars } from "@/components/loader";
import { projects } from "@/lib/queries";
import React from "react";

type Props = {};

const ProjectsPage = (props: Props) => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 10);

  if (isLoadingProjects) {
    <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
      <LoadingStars />
    </div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
      <EmptyProjects />
    </div>
  );
};

export default ProjectsPage;
