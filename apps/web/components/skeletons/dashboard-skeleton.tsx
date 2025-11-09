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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
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
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="h-5 w-px bg-border" />
                <div className="min-w-32 space-y-1">
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="h-5 w-px bg-border" />
                <div className="min-w-32 hidden sm:block">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for quick actions card
 */
export function QuickActionsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for getting started card
 */
export function GettingStartedCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-2">
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
    </div>
  );
}

/**
 * Complete dashboard page skeleton
 * Combines all dashboard skeleton components
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Header */}
      <DashboardHeaderSkeleton />

      {/* Stats Cards */}
      <DashboardStatsSkeleton />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentProjectsListSkeleton />
        <QuickActionsCardSkeleton />
        <GettingStartedCardSkeleton />
      </div>
    </div>
  );
}
