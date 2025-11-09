"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card";

/**
 * Skeleton for dashboard stats cards (3 cards)
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-9 w-16" />
              {i === 1 && <Skeleton className="h-4 w-24" />}
            </div>
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton for recent projects list
 */
export function RecentProjectsListSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for section header
 */
export function SectionHeaderSkeleton() {
  return <Skeleton className="h-4 w-32 mb-4" />;
}

/**
 * Skeleton for getting started card
 */
export function GettingStartedCardSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-muted/30">
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-start gap-3">
              <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for dashboard header
 */
export function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>
      <Skeleton className="h-11 w-48" />
    </div>
  );
}

/**
 * Complete dashboard page skeleton
 * Combines all dashboard skeleton components
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full h-full p-6 max-w-7xl mx-auto">
      {/* Header */}
      <DashboardHeaderSkeleton />

      {/* Main Content */}
      <div className="space-y-8">
        {/* Stats Section */}
        <section>
          <SectionHeaderSkeleton />
          <DashboardStatsSkeleton />
        </section>

        {/* Recent Projects Section */}
        <section>
          <SectionHeaderSkeleton />
          <RecentProjectsListSkeleton />
        </section>

        {/* Getting Started Section */}
        <section>
          <GettingStartedCardSkeleton />
        </section>
      </div>
    </div>
  );
}
