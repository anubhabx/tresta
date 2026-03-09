"use client";

import Link from "next/link";
import { Card } from "@workspace/ui/components/card";
import { AlertCircleIcon, InboxIcon, TrendingUpIcon } from "lucide-react";
import type { Project } from "@/types/api";

interface PendingActionsCardProps {
  projects: Project[];
}

export function PendingActionsCard({ projects }: PendingActionsCardProps) {
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
    <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warning/30 to-transparent" />
      <div className="flex items-center gap-2 mb-4">
        <InboxIcon className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Pending Actions
        </h3>
      </div>
      <div className="space-y-3">
        {/* Projects needing testimonials */}
        {projectsNeedingTestimonials.length > 0 && (
          <Link
            href="/projects"
            className="flex items-start gap-3 p-4 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0 mt-0.5">
              <AlertCircleIcon className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {projectsNeedingTestimonials.length} project
                {projectsNeedingTestimonials.length !== 1 ? "s" : ""} without
                testimonials
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Share collection links to start gathering feedback
              </p>
            </div>
          </Link>
        )}

        {/* Recent activity */}
        {recentlyUpdatedProjects.length > 0 && (
          <Link
            href="/projects"
            className="flex items-start gap-3 p-4 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 mt-0.5">
              <TrendingUpIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {recentlyUpdatedProjects.length} project
                {recentlyUpdatedProjects.length !== 1 ? "s" : ""} updated this
                week
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Recent activity detected
              </p>
            </div>
          </Link>
        )}
      </div>
    </Card>
  );
}
