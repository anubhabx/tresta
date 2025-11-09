"use client";

import { use } from "react";
import { projects } from "@/lib/queries";
import { ProjectDetailPageSkeleton } from "@/components/skeletons";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import Link from "next/link";
import { TestimonialList } from "@/components/testimonial-list";
import {
  ProjectHeader,
  ProjectStatsCards,
  ProjectOverviewTab,
  ProjectSettingsTab,
  ProjectWidgetsTab,
  ProjectApiKeysTab,
} from "@/components/project-detail";
import { useSearchParams } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;

}

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { slug } = use(params);

  const tab = useSearchParams().get("tab") as string | undefined;

  const { data: project, isLoading: isLoadingProject } =
    projects.queries.useDetail(slug as string);
  const deleteProject = projects.mutations.useDelete(slug as string);

  const collectionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/testimonials/${slug}`
      : "";

  const handleDelete = async () => {
    await deleteProject.mutateAsync();
  };

  if (isLoadingProject) {
    return <ProjectDetailPageSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link href="/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full h-full p-4 sm:p-6 max-w-7xl mx-auto">
      <ProjectHeader project={project} slug={slug} onDelete={handleDelete} />

      <section>
        <div className="mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Project Statistics
          </h2>
        </div>
        <ProjectStatsCards project={project} />
      </section>

      <Tabs defaultValue={tab || "overview"} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="testimonials" className="text-xs sm:text-sm">Testimonials</TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs sm:text-sm">Moderation</TabsTrigger>
          <TabsTrigger value="widgets" className="text-xs sm:text-sm">Widgets</TabsTrigger>
          <TabsTrigger value="api-keys" className="text-xs sm:text-sm">API Keys</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <ProjectOverviewTab project={project} collectionUrl={collectionUrl} />
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Testimonials</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage approved testimonials for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList projectSlug={slug} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Moderation Queue</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Review pending testimonials with advanced moderation tools, bulk
                actions, and auto-moderation insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList projectSlug={slug} moderationMode={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Display Widgets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Create widgets to display testimonials on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectWidgetsTab projectSlug={slug} projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <ProjectApiKeysTab project={project} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <ProjectSettingsTab project={project} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;
