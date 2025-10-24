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
import {
  FolderIcon,
  MessageSquareIcon,
  ClockIcon,
} from "lucide-react";
import type { Project } from "@/types/api";

interface RecentProjectsListProps {
  projects: Project[];
}

export function RecentProjectsList({ projects }: RecentProjectsListProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recently created projects
            </CardDescription>
          </div>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <FolderIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">
                      {project.name}
                    </h4>
                    {!project.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    /{project.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{project._count?.testimonials || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    testimonials
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
