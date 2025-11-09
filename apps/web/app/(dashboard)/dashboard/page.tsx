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

  const recentProjects = projectsList.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 w-full h-full p-6 max-w-7xl mx-auto">
      {/* Header with Primary CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your testimonials
          </p>
        </div>
        {projectsList.length > 0 && (
          <Link href="/projects/new">
            <Button size="lg" className="shadow-sm">
              <span className="mr-2">+</span>
              Create New Project
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content */}
      {projectsList.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="space-y-8">
          {/* Stats Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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

          {/* Recent Projects Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent Projects
              </h2>
            </div>
            <RecentProjectsList projects={recentProjects} />
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
