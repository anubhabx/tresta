"use client";

import { use } from "react";
import { ProjectWizard } from "@/components/project-wizard";

interface ProjectEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { slug } = use(params);
  return <ProjectWizard mode="edit" slug={slug} />;
}
