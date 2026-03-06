"use client";

import { EmptyProjects } from "@/components/dashboard/empty-projects";
import { ProjectsListPageSkeleton } from "@/components/skeletons";
import { projects } from "@/lib/queries";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  FolderIcon,
  MessageSquareIcon,
  CalendarIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useSubscription } from "@/hooks/use-subscription";

const ProjectsPage = () => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 100);
  const {
    usage,
    plan,
    isPro,
    isLoading: isLoadingSubscription,
  } = useSubscription();

  if (isLoadingProjects) {
    return <ProjectsListPageSkeleton />;
  }

  const projectsList = projectsData?.data || [];

  if (projectsList.length === 0) {
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
        <EmptyProjects />
      </div>
    );
  }

  const isLimitReached =
    !isPro &&
    usage?.projects !== undefined &&
    plan?.limits?.projects !== undefined &&
    usage.projects >= plan.limits.projects;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full min-w-0 h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden relative">
      {/* Background Effect matching landing page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0 relative z-10 mb-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Projects
          </h1>
          <p className="text-sm text-zinc-400 font-sans mt-2">
            Manage your testimonial collection projects
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 border-white/10 text-zinc-300"
          >
            {projectsList.length}{" "}
            {projectsList.length === 1 ? "Project" : "Projects"}
          </Badge>
          {isLimitReached ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
            >
              <Link href="/dashboard/settings">Upgrade</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              disabled={isLoadingSubscription}
              className="bg-primary hover:bg-primary/90 text-white font-medium transition-all"
            >
              <Link href="/projects/new">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <section className="relative z-10 w-full">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            All Projects
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {projectsList.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group block h-full"
            >
              <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl relative h-full flex flex-col overflow-hidden ring-1 ring-white/5 transition-all duration-300 hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                {/* Glow effect on top edge */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent group-hover:via-blue-500/40 transition-colors" />

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-colors">
                      <FolderIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-lg font-medium text-white truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        /{project.slug}
                      </p>
                    </div>
                  </div>
                  {!project.isActive && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-wider flex-shrink-0 bg-red-500/10 text-red-400 border-red-500/20"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>

                {project.description ? (
                  <p className="flex-1 text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-6">
                    {project.description}
                  </p>
                ) : (
                  <p className="flex-1 text-sm text-zinc-600 italic mb-6">
                    No description provided
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-medium text-zinc-400 mt-auto">
                  <div className="flex items-center gap-2 px-2 py-1 rounded ">
                    <MessageSquareIcon className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-zinc-300">
                      {project._count?.testimonials || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
