"use client";

import { use, Suspense } from "react";
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
import { TestimonialList } from "@/components/testimonials/testimonial-list";
import {
  ProjectHeader,
  ProjectStatsCards,
  ProjectOverviewTab,
  ProjectSettingsTab,
  ProjectWidgetsTab,
} from "@/components/project-detail";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ProjectPageContent = ({ params }: ProjectPageProps) => {
  const { slug } = use(params);

  const tab = useSearchParams().get("tab") as string | undefined;
  const initialTab =
    tab === "overview" ||
    tab === "testimonials" ||
    tab === "moderation" ||
    tab === "widgets" ||
    tab === "settings"
      ? tab
      : tab === "api-keys"
        ? "settings"
        : "overview";

  const { data: project, isLoading: isLoadingProject } =
    projects.queries.useDetail(slug as string);
  const deleteProject = projects.mutations.useDelete(slug as string);

  const collectionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/testimonials/${slug}`
      : "";

  const handleDelete = async () => {
    await deleteProject.mutateAsync();
    toast.success("Project deleted successfully!");
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
    <div className="flex flex-col gap-6 w-full min-w-0 h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden relative">
      {/* Background Effect matching landing page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

      {/* Header and Integrated Stats */}
      <div className="relative z-10">
        <ProjectHeader project={project} slug={slug} onDelete={handleDelete} />
      </div>

      <div className="relative z-10 mt-4">
        <Tabs defaultValue={initialTab} className="w-full">
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth no-scrollbar tabs-scroll-fade">
            <TabsList className="w-max sm:w-auto inline-flex  backdrop-blur-xl border border-white/10 rounded-lg p-1 shadow-2xl">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm whitespace-nowrap min-w-0 flex-none rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all px-4 py-2"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="testimonials"
                className="text-xs sm:text-sm whitespace-nowrap min-w-0 flex-none rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all px-4 py-2"
              >
                Testimonials
              </TabsTrigger>
              <TabsTrigger
                value="moderation"
                className="text-xs sm:text-sm whitespace-nowrap min-w-0 flex-none rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all px-4 py-2"
              >
                Moderation
              </TabsTrigger>
              <TabsTrigger
                value="widgets"
                className="text-xs sm:text-sm whitespace-nowrap min-w-0 flex-none rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all px-4 py-2"
              >
                Widgets
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-xs sm:text-sm whitespace-nowrap min-w-0 flex-none rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all px-4 py-2"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-6 mt-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <ProjectOverviewTab
              project={project}
              collectionUrl={collectionUrl}
            />
          </TabsContent>

          <TabsContent
            value="testimonials"
            className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
          >
            <Card className=" backdrop-blur-xl border border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white">
                  Testimonials
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-zinc-400">
                  View and manage approved testimonials for this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestimonialList projectSlug={slug} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="moderation"
            className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
          >
            <Card className=" backdrop-blur-xl border border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white">
                  Moderation Queue
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-zinc-400">
                  Review pending testimonials with advanced moderation tools,
                  bulk actions, and auto-moderation insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestimonialList projectSlug={slug} moderationMode={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="widgets"
            className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
          >
            <Card className="backdrop-blur-xl border border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white">
                  Display Widgets
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-zinc-400">
                  Create widgets to display testimonials on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectWidgetsTab projectSlug={slug} projectId={project.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="settings"
            className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
          >
            <ProjectSettingsTab project={project} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ProjectPage = (props: ProjectPageProps) => {
  return (
    <Suspense fallback={<ProjectDetailPageSkeleton />}>
      <ProjectPageContent {...props} />
    </Suspense>
  );
};

export default ProjectPage;
