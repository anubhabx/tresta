"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { projects } from "@/lib/queries";
import { DashboardPageSkeleton } from "@/components/skeletons";
import {
  DashboardStats,
  RecentProjectsList,
  DashboardEmptyState,
  GettingStartedCard,
  PendingActionsCard,
  StatusOverviewCard,
} from "@/components/dashboard";
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
    0,
  );
  const activeProjects = projectsList.filter((p) => p.isActive).length;

  // Calculate most recent testimonial date across all projects
  const allProjectDates = projectsList.map((p) => new Date(p.updatedAt));
  const mostRecentUpdate =
    allProjectDates.length > 0 ? new Date(Math.max(...allProjectDates.map((d) => d.getTime()))) : null;

  // Calculate projects created in last 7 days for trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentProjectsCount = projectsList.filter(
    (p) => new Date(p.createdAt) > sevenDaysAgo,
  ).length;

  const recentProjects = projectsList.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full h-full p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header with Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
            Welcome back{user.user?.firstName ? `, ${user.user.firstName}` : ""}!
          </p>
        </div>
      </div>

      {/* Main Content */}
      {projectsList.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Stats Section */}
          <section>
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Overview
              </h2>
            </div>
            <DashboardStats
              totalProjects={totalProjects}
              activeProjects={activeProjects}
              totalTestimonials={totalTestimonials}
              recentProjectsCount={recentProjectsCount}
              mostRecentUpdate={mostRecentUpdate}
            />
          </section>

          {/* Pending Actions - Only shows when there are actionable items */}
          <PendingActionsCard projects={projectsList} />

          {/* Recent Projects - Takes 2 columns */}
          <section className="lg:col-span-2">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent Projects
              </h2>
            </div>
            <RecentProjectsList projects={recentProjects} />
          </section>

          <section className="lg:col-span-2">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Status Overview
              </h2>
            </div>
            <StatusOverviewCard projects={projectsList} />
          </section>

          {/* Getting Started Section */}
          <section>
            <GettingStartedCard />
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
