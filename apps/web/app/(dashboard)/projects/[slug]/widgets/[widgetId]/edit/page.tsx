"use client";

import { WidgetBuilder } from "@/components/widgets/widget-builder";
import { projects } from "@/lib/queries";
import { WidgetPageSkeleton } from "@/components/skeletons/widget-skeleton";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditWidgetPage() {
  const params = useParams();
  const slug = params.slug as string;
  const widgetId = params.widgetId as string;

  // Fetch project to get projectId
  const { data: project, isLoading } = projects.queries.useDetail(slug);

  if (isLoading) {
    return <WidgetPageSkeleton />;
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="container w-full py-8">
      <WidgetBuilder
        projectSlug={slug}
        projectId={project.id}
        widgetId={widgetId}
        mode="edit"
      />
    </div>
  );
}
