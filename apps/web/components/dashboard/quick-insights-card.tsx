"use client";

import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import { TrophyIcon, ClockIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/types/api";

interface QuickInsightsCardProps {
  projects: Project[];
}

export function QuickInsightsCard({ projects }: QuickInsightsCardProps) {
  if (projects.length === 0) {
    return null;
  }

  // Find top performing project
  const topProject = projects.reduce<Project>((prev, current) => {
    const prevCount = prev._count?.testimonials || 0;
    const currentCount = current._count?.testimonials || 0;
    return currentCount > prevCount ? current : prev;
  }, projects[0]!);

  const topProjectCount = topProject._count?.testimonials || 0;

  // Find most recently updated project
  const mostRecentProject = projects.reduce<Project>((prev, current) => {
    return new Date(current.updatedAt) > new Date(prev.updatedAt)
      ? current
      : prev;
  }, projects[0]!);

  // Only show if there's meaningful data
  if (topProjectCount === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardContent>
        <div className="space-y-2 md:space-y-3">
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
                {formatDistanceToNow(new Date(mostRecentProject.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card >
  )
}