"use client";

import React from "react";
import { projects } from "@/lib/queries";
import { useNotificationList } from "@/lib/queries/notifications";
import { DashboardPageSkeleton } from "@/components/skeletons";
import dynamic from "next/dynamic";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";
import { Plus } from "lucide-react";

const DashboardStats = dynamic(() =>
  import("@/components/dashboard/dashboard-stats").then(
    (mod) => mod.DashboardStats,
  ),
);
const RecentProjectsList = dynamic(() =>
  import("@/components/dashboard/recent-projects-list").then(
    (mod) => mod.RecentProjectsList,
  ),
);
const DashboardEmptyState = dynamic(() =>
  import("@/components/dashboard/dashboard-empty-state").then(
    (mod) => mod.DashboardEmptyState,
  ),
);
const PendingActionsCard = dynamic(() =>
  import("@/components/dashboard/pending-actions-card").then(
    (mod) => mod.PendingActionsCard,
  ),
);
const QuickEmbedCard = dynamic(() =>
  import("@/components/dashboard/quick-embed-card").then(
    (mod) => mod.QuickEmbedCard,
  ),
);
const ActivityFeed = dynamic(() =>
  import("@/components/dashboard/activity-feed").then(
    (mod) => mod.ActivityFeed,
  ),
);
const KeyboardShortcutsCard = dynamic(() =>
  import("@/components/dashboard/keyboard-shortcuts-card").then(
    (mod) => mod.KeyboardShortcutsCard,
  ),
);
import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 100);
  const { data: notificationsData } = useNotificationList();

  const user = useUser();

  if (isLoadingProjects) {
    return <DashboardPageSkeleton />;
  }

  const projectsList = projectsData?.data || [];
  const totalProjects = projectsList.length;
  const totalTestimonials = projectsList.reduce(
    (acc, project) => acc + (project._count?.testimonials || 0),
    0,
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
    (p) => new Date(p.createdAt) > sevenDaysAgo,
  ).length;

  const recentProjects = projectsList.slice(0, 5);
  const recentNotifications =
    notificationsData?.pages
      .flatMap((page) => page.data.notifications)
      .slice(0, 10) ?? [];

  return (
    <div className="mx-auto h-full w-full max-w-7xl p-4 sm:p-6 relative">
      {/* Background Effect matching landing page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400 font-sans">
            Welcome back
            {user.user?.firstName ? `, ${user.user.firstName}` : ""}! Here's
            what's happening.
          </p>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] transition-all hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)]"
        >
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Top Row: Stats (Full Width) */}
          <div className="md:col-span-12">
            <DashboardStats
              totalProjects={totalProjects}
              activeProjects={activeProjects}
              totalTestimonials={totalTestimonials}
              recentProjectsCount={recentProjectsCount}
              mostRecentUpdate={mostRecentUpdate}
            />
          </div>

          {/* Middle Row Left: Activities (8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <PendingActionsCard projects={projectsList} />
            <ActivityFeed
              projects={projectsList}
              notifications={recentNotifications}
              maxItems={5}
            />
          </div>

          {/* Middle Row Right: Quick Actions & Snippets (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <QuickEmbedCard projects={projectsList} />
            <KeyboardShortcutsCard />
          </div>

          {/* Bottom Row: Recent Projects (Full Width) */}
          <div className="md:col-span-12">
            <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl overflow-hidden ring-1 ring-white/5 relative mt-2">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Your Projects
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                  asChild
                >
                  <Link href="/projects">View all projects &rarr;</Link>
                </Button>
              </div>
              <RecentProjectsList projects={recentProjects} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
