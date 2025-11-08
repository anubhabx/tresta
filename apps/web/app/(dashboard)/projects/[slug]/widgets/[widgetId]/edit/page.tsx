"use client";

import { WidgetBuilder } from "@/components/widgets/widget-builder";
import { projects } from "@/lib/queries";
import { LoadingStars } from "@/components/loader";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

export default function EditWidgetPage() {
  const params = useParams();
  const slug = params.slug as string;
  const widgetId = params.widgetId as string;

  // Fetch project to get projectId
  const { data: project, isLoading } = projects.queries.useDetail(slug);

  if (isLoading) {
    return (
      <div className="container flex h-[400px] items-center justify-center">
        <LoadingStars />
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="container max-w-7xl py-8">
      <WidgetBuilder
        projectSlug={slug}
        projectId={project.id}
        widgetId={widgetId}
        mode="edit"
      />
    </div>
  );
}
