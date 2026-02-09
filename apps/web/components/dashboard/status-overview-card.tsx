"use client";

import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  TrophyIcon,
  ClockIcon,
  FolderIcon,
  MessageSquareIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/types/api";

interface StatusOverviewCardProps {
  projects: Project[];
}

export function StatusOverviewCard({ projects }: StatusOverviewCardProps) {
  if (projects.length === 0) {
    return null;
  }

  // Calculate active/inactive breakdown
  const activeProjects = projects.filter((p) => p.isActive).length;
  const inactiveProjects = projects.length - activeProjects;

  // Calculate total testimonials and published count
  const totalTestimonials = projects.reduce(
    (acc, project) => acc + (project._count?.testimonials || 0),
    0,
  );
  // Note: We'd need isPublished data from API to calculate this accurately
  // For now, we'll assume all approved testimonials are published
  const publishedTestimonials = totalTestimonials; // Placeholder

  // Find top performing project
  const topProject =
    projects.length > 0
      ? projects.reduce<Project>((prev, current) => {
          const prevCount = prev._count?.testimonials || 0;
          const currentCount = current._count?.testimonials || 0;
          return currentCount > prevCount ? current : prev;
        }, projects[0]!)
      : null;

  const topProjectCount = topProject?._count?.testimonials || 0;

  // Find most recently updated project
  const mostRecentProject =
    projects.length > 0
      ? projects.reduce<Project>((prev, current) => {
          return new Date(current.updatedAt) > new Date(prev.updatedAt)
            ? current
            : prev;
        }, projects[0]!)
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 space-4 md:space-6 gap-4 md:gap-6">
      {/* Quick Insights */}
      {topProjectCount > 0 && topProject && mostRecentProject && (
        <Card className="flex flex-cols h-full border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardContent>
            <div className="space-y-4">
              {/* Top performing project */}
              <Link
                href={`/projects/${topProject.slug}`}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-warning-muted flex-shrink-0 mt-0.5">
                  <TrophyIcon className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Top Performer
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {topProject.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topProjectCount} testimonial
                    {topProjectCount !== 1 ? "s" : ""} collected
                  </p>
                </div>
              </Link>

              {/* Most recent activity */}
              <Link
                href={`/projects/${mostRecentProject.slug}`}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-info-highlight-bg flex-shrink-0 mt-0.5">
                  <ClockIcon className="h-4 w-4 text-info-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Latest Activity
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {mostRecentProject.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated{" "}
                    {formatDistanceToNow(
                      new Date(mostRecentProject.updatedAt),
                      {
                        addSuffix: true,
                      },
                    )}
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardContent>
          <div className="space-y-4">
            {/* Active/Inactive Projects */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Project Status
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60"
                        style={{
                          width: `${projects.length > 0 ? (activeProjects / projects.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {activeProjects}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Inactive
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground/40"
                        style={{
                          width: `${projects.length > 0 ? (inactiveProjects / projects.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {inactiveProjects}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Published/Unpublished Testimonials */}
            {totalTestimonials > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Testimonial Status
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Published
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60"
                          style={{
                            width: `${totalTestimonials > 0 ? (publishedTestimonials / totalTestimonials) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {publishedTestimonials}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Unpublished
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-muted-foreground/40"
                          style={{
                            width: `${totalTestimonials > 0 ? ((totalTestimonials - publishedTestimonials) / totalTestimonials) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {totalTestimonials - publishedTestimonials}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
