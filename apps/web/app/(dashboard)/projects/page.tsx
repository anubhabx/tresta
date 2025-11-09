"use client";

import { EmptyProjects } from "@/components/empty-projects";
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
import { FolderIcon, MessageSquareIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const ProjectsPage = () => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 100);

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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full h-full p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Projects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your testimonial collection projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {projectsList.length}{" "}
            {projectsList.length === 1 ? "Project" : "Projects"}
          </Badge>
        </div>
      </div>

      {/* Projects Grid */}
      <section>
        <div className="mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            All Projects
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projectsList.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group"
            >
              <Card className="h-full border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-border/50 hover:border-border transition-all duration-200">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FolderIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          /{project.slug}
                        </CardDescription>
                      </div>
                    </div>
                    {!project.isActive && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col h-full">
                  {project.description ? (
                    <p className="flex-1 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <p className="flex-1 text-sm text-muted-foreground italic">
                      No description
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MessageSquareIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {project._count?.testimonials || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {formatDistanceToNow(new Date(project.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
