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
    <div className="space-y-3">
      {displayProjects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.slug}`}
          className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors group min-h-[64px]"
        >
          <div
            className={`flex items-center gap-4 flex-1 min-w-0 ${!project.isActive ? "opacity-50 grayscale" : ""}`}
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <FolderIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate text-base flex items-center gap-2">
                {project.name}
                {!project.isActive && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    Locked
                  </span>
                )}
              </h4>
              <p className="text-sm text-zinc-500 mt-0.5 font-mono">
                /{project.slug}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-4 flex-shrink-0 ${!project.isActive ? "opacity-50 grayscale" : ""}`}
          >
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-white/5">
              <span className="text-xs text-zinc-300 font-medium">
                {project._count?.testimonials || 0}{" "}
                <span className="text-zinc-500 font-normal">testimonials</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <ClockIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </Link>
      ))}

      {hasMore && (
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
          <Link
            href="/projects"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
          >
            View all projects
            <span>&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
