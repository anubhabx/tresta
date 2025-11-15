"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  FolderIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ClockIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardStatsProps {
  totalProjects: number;
  activeProjects: number;
  totalTestimonials: number;
  recentProjectsCount?: number;
  mostRecentUpdate?: Date | null;
}

export function DashboardStats({
  totalProjects,
  activeProjects,
  totalTestimonials,
  recentProjectsCount = 0,
  mostRecentUpdate,
}: DashboardStatsProps) {
  const avgPerProject =
    totalProjects > 0 ? Math.round(totalTestimonials / totalProjects) : 0;

  const hasRecentActivity = recentProjectsCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Projects
          </CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <FolderIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {totalProjects}
            </div>
            {hasRecentActivity && (
              <div className="flex items-center gap-1 text-xs font-medium text-success">
                <ArrowUpIcon className="h-3 w-3" />
                <span className="hidden xs:inline">+{recentProjectsCount} this week</span>
                <span className="xs:hidden">+{recentProjectsCount}</span>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {activeProjects} active
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Testimonials
          </CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <MessageSquareIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            {totalTestimonials}
          </div>
          {mostRecentUpdate ? (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <span className="truncate">
                Last updated{" "}
                {formatDistanceToNow(mostRecentUpdate, { addSuffix: true })}
              </span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">
              No testimonials yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Average per Project
          </CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <TrendingUpIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            {avgPerProject}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {totalProjects > 0
              ? "Testimonials per project"
              : "Create a project to start"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
