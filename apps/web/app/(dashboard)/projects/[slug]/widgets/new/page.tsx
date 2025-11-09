"use client";

import { WidgetBuilder } from "@/components/widgets/widget-builder";
import { projects } from "@/lib/queries";
import { WidgetPageSkeleton } from "@/components/skeletons/widget-skeleton";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function NewWidgetPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch project to get projectId
  const { data: project, isLoading } = projects.queries.useDetail(slug);

  if (isLoading) {
    return <WidgetPageSkeleton />;
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="container max-w-7xl py-8">
      <WidgetBuilder projectSlug={slug} projectId={project.id} mode="create" />
    </div>
  );
}
