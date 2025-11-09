"use client";

import React from "react";
import Link from "next/link";
import { projects } from "@/lib/queries";
import { DashboardPageSkeleton } from "@/components/skeletons";
import {
  DashboardStats,
  RecentProjectsList,
  DashboardEmptyState,
  QuickActionsCard,
  GettingStartedCard,
} from "@/components/dashboard";

const DashboardPage = () => {
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 100);

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

  const recentProjects = projectsList.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your testimonials
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        totalTestimonials={totalTestimonials}
      />

      {/* Main Content */}
      {projectsList.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentProjectsList projects={recentProjects} />

          <QuickActionsCard />

          <GettingStartedCard />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
