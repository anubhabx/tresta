"use client";

import { use } from "react";
import { projects } from "@/lib/queries";
import { LoadingStars } from "@/components/loader";
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
} from "@/components/project-detail";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { slug } = use(params);

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
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
        <LoadingStars />
      </div>
    );
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
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <ProjectHeader project={project} slug={slug} onDelete={handleDelete} />

      <ProjectStatsCards project={project} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverviewTab project={project} collectionUrl={collectionUrl} />
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>
                View and manage approved testimonials for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList projectSlug={slug} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>
                Review pending testimonials with advanced moderation tools, bulk
                actions, and auto-moderation insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList projectSlug={slug} moderationMode={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Widgets</CardTitle>
              <CardDescription>
                Create widgets to display testimonials on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectWidgetsTab projectSlug={slug} projectId={project.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProjectSettingsTab project={project} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;
