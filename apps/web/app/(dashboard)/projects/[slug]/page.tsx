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
import { LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { TestimonialList } from "@/components/testimonial-list";
import {
  ProjectHeader,
  ProjectStatsCards,
  ProjectOverviewTab,
  ProjectSettingsTab,
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
                Manage and moderate testimonials for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList projectSlug={slug} />
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
              <div className="text-center py-12">
                <LayoutGridIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No widgets created
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first widget to display testimonials on your site
                </p>
                <Button disabled>
                  <LayoutGridIcon className="h-4 w-4 mr-2" />
                  Create Widget (Coming Soon)
                </Button>
              </div>
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
