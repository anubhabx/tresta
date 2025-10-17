"use client";

import { EmptyProjects } from "@/components/empty-projects";
import { LoadingStars } from "@/components/loader";
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
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
        <LoadingStars />
      </div>
    );
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
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your testimonial collection projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {projectsList.length}{" "}
            {projectsList.length === 1 ? "Project" : "Projects"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectsList.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="transition-transform hover:scale-[1.02]"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FolderIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        /{project.slug}
                      </CardDescription>
                    </div>
                  </div>
                  {!project.isActive && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {project.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MessageSquareIcon className="h-3.5 w-3.5" />
                    <span>
                      {project._count?.testimonials || 0} testimonial
                      {project._count?.testimonials !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
