"use client";

import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import { AlertCircleIcon, InboxIcon, TrendingUpIcon } from "lucide-react";
import type { Project } from "@/types/api";

interface PendingActionsCardProps {
  projects: Project[];
}

export function PendingActionsCard({ projects }: PendingActionsCardProps) {
  // Calculate pending testimonials (assuming pending = not approved)
  const totalPending = projects.reduce((acc, project) => {
    // This would need actual pending count from API
    // For now, we'll show projects with zero testimonials as needing attention
    return acc;
  }, 0);

  // Find projects with zero testimonials
  const projectsNeedingTestimonials = projects.filter(
    (p) => (p._count?.testimonials || 0) === 0,
  );

  // Calculate new testimonials in last 7 days (based on project updates)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyUpdatedProjects = projects.filter(
    (p) => new Date(p.updatedAt) > sevenDaysAgo,
  );

  // Don't show if there are no pending actions
  const hasPendingActions =
    projectsNeedingTestimonials.length > 0 ||
    recentlyUpdatedProjects.length > 0;

  if (!hasPendingActions) {
    return null;
  }

  return (
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardContent>
        <div className="space-y-3">
          {/* Projects needing testimonials */}
          {projectsNeedingTestimonials.length > 0 && (
            <Link
              href="/projects"
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-info-highlight-bg/50 transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-warning-muted flex-shrink-0 mt-0.5">
                <AlertCircleIcon className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {projectsNeedingTestimonials.length} project
                  {projectsNeedingTestimonials.length !== 1 ? "s" : ""} without
                  testimonials
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share collection links to start gathering feedback
                </p>
              </div>
            </Link>
          )}

          {/* Recent activity */}
          {recentlyUpdatedProjects.length > 0 && (
            <Link
              href="/projects"
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-success-muted flex-shrink-0 mt-0.5">
                <TrendingUpIcon className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {recentlyUpdatedProjects.length} project
                  {recentlyUpdatedProjects.length !== 1 ? "s" : ""} updated this
                  week
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recent activity detected
                </p>
              </div>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
