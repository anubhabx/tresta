"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@workspace/ui/components/card";
import { FolderIcon, ClockIcon } from "lucide-react";
import type { Project } from "@/types/api";

interface RecentProjectsListProps {
  projects: Project[];
}

export function RecentProjectsList({ projects }: RecentProjectsListProps) {
  const displayProjects = projects.slice(0, 3);
  const hasMore = projects.length > 3;

  return (
    <Card className="border border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {displayProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="flex items-center border border-border/50 shadow-md justify-between p-3 sm:p-4 rounded-lg hover:border-border hover:shadow-lg active:bg-accent transition-colors group min-h-[60px] touch-manipulation"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FolderIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate text-sm sm:text-base">
                    {project.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {project._count?.testimonials || 0} testimonial
                    {(project._count?.testimonials ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm text-muted-foreground">
                <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <Link
              href="/projects"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 touch-manipulation min-h-[44px] items-center"
            >
              View all projects
              <span className="text-xs">→</span>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
