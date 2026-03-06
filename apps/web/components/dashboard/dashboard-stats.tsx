"use client";

import {
  FolderIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ClockIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@workspace/ui/components/card";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className=" backdrop-blur-xl border border-white/5 shadow-2xl min-h-[160px] h-full flex flex-col justify-between">
        <div className="p-6 h-full flex flex-col z-10 relative">
          <div className="flex flex-row items-center justify-between space-y-0 mb-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-zinc-400">
              Total Projects
            </h3>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <FolderIcon className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="text-4xl font-semibold text-white tracking-tight">
                {totalProjects}
              </div>
              {hasRecentActivity && (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                  <ArrowUpIcon className="h-3 w-3" />
                  <span>+{recentProjectsCount} this week</span>
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-500">
              {activeProjects} active projects
            </p>
          </div>
        </div>
      </Card>

      <Card className=" backdrop-blur-xl border border-white/5 shadow-2xl min-h-[160px] h-full flex flex-col justify-between">
        <div className="p-6 h-full flex flex-col z-10 relative">
          <div className="flex flex-row items-center justify-between space-y-0 mb-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-zinc-400">
              Total Testimonials
            </h3>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <MessageSquareIcon className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="text-4xl font-semibold text-white tracking-tight">
              {totalTestimonials}
            </div>
            {mostRecentUpdate ? (
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <ClockIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  Last updated{" "}
                  {formatDistanceToNow(mostRecentUpdate, { addSuffix: true })}
                </span>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No testimonials yet</p>
            )}
          </div>
        </div>
      </Card>

      <Card className=" backdrop-blur-xl border border-white/5 shadow-2xl min-h-[160px] h-full flex flex-col justify-between">
        <div className="p-6 h-full flex flex-col z-10 relative">
          <div className="flex flex-row items-center justify-between space-y-0 mb-4">
            <h3 className="text-sm font-medium tracking-wide uppercase text-zinc-400">
              Average per Project
            </h3>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-2 mt-auto">
            <div className="text-4xl font-semibold text-white tracking-tight">
              {avgPerProject}
            </div>
            <p className="text-sm text-zinc-500">
              {totalProjects > 0
                ? "Testimonials per project"
                : "Create a project to start"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
