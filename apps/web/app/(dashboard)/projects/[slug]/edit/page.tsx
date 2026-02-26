"use client";

import { use } from "react";
import { ProjectConfigEditor } from "@/components/project-config-editor";

interface ProjectEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { slug } = use(params);
  return <ProjectConfigEditor mode="edit" slug={slug} />;
}
