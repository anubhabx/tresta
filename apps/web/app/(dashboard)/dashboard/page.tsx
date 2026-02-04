"use client";

import React from "react";
import { projects } from "@/lib/queries";
import { DashboardPageSkeleton } from "@/components/skeletons";
import dynamic from "next/dynamic";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Plus } from "lucide-react";

const DashboardStats = dynamic(() =>
  import("@/components/dashboard/dashboard-stats").then(
    (mod) => mod.DashboardStats
  )
);
const RecentProjectsList = dynamic(() =>
  import("@/components/dashboard/recent-projects-list").then(
    (mod) => mod.RecentProjectsList
  )
);
const DashboardEmptyState = dynamic(() =>
  import("@/components/dashboard/dashboard-empty-state").then(
    (mod) => mod.DashboardEmptyState
  )
);
const PendingActionsCard = dynamic(() =>
  import("@/components/dashboard/pending-actions-card").then(
    (mod) => mod.PendingActionsCard
  )
);
const QuickEmbedCard = dynamic(() =>
  import("@/components/dashboard/quick-embed-card").then(
    (mod) => mod.QuickEmbedCard
  )
);
const ActivityFeed = dynamic(() =>
  import("@/components/dashboard/activity-feed").then((mod) => mod.ActivityFeed)
);
const KeyboardShortcutsCard = dynamic(() =>
  import("@/components/dashboard/keyboard-shortcuts-card").then(
    (mod) => mod.KeyboardShortcutsCard
  )
);
import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 100);

  const user = useUser();

  if (isLoadingProjects) {
    return <DashboardPageSkeleton />;
  }

  const projectsList = projectsData?.data || [];
  const totalProjects = projectsList.length;
  const totalTestimonials = projectsList.reduce(
    (acc, project) => acc + (project._count?.testimonials || 0),
    0
  );
  const activeProjects = projectsList.filter((p) => p.isActive).length;

  // Calculate most recent testimonial date across all projects
  const allProjectDates = projectsList.map((p) => new Date(p.updatedAt));
  const mostRecentUpdate =
    allProjectDates.length > 0
      ? new Date(Math.max(...allProjectDates.map((d) => d.getTime())))
      : null;

  // Calculate projects created in last 7 days for trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentProjectsCount = projectsList.filter(
    (p) => new Date(p.createdAt) > sevenDaysAgo
  ).length;

  const recentProjects = projectsList.slice(0, 5);

  return (
    <div className="mx-auto h-full w-full max-w-7xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back
            {user.user?.firstName ? `, ${user.user.firstName}` : ""}!
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      {projectsList.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column - Main Content (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            {/* Stats Bar */}
            <DashboardStats
              totalProjects={totalProjects}
              activeProjects={activeProjects}
              totalTestimonials={totalTestimonials}
              recentProjectsCount={recentProjectsCount}
              mostRecentUpdate={mostRecentUpdate}
            />

            {/* Pending Actions */}
            <PendingActionsCard projects={projectsList} />

            {/* Recent Activity Feed */}
            <ActivityFeed projects={projectsList} maxItems={5} />

            {/* Recent Projects */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Your Projects
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/projects">View all</Link>
                </Button>
              </div>
              <RecentProjectsList projects={recentProjects} />
            </section>
          </div>

          {/* Right Column - Sidebar (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Quick Embed */}
            <QuickEmbedCard projects={projectsList} />

            {/* Keyboard Shortcuts */}
            <KeyboardShortcutsCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
