"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { FolderIcon, MessageSquareIcon, ClockIcon } from "lucide-react";
import type { Project } from "@/types/api";
import { Separator } from "@workspace/ui/components/separator";

interface RecentProjectsListProps {
  projects: Project[];
}

export function RecentProjectsList({ projects }: RecentProjectsListProps) {
  const displayProjects = projects.slice(0, 5);
  const hasMore = projects.length > 3;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-3">
          {displayProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FolderIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate text-base">
                    {project.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project._count?.testimonials || 0} testimonial
                    {(project._count?.testimonials ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-sm text-muted-foreground">
                <ClockIcon className="h-4 w-4" />
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
          <div className="mt-4 pt-4 border-t">
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
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
