"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";

/**
 * Skeleton for a single project card
 */
export function ProjectCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </CardFooter>
    </Card>
  );
}

/**
 * Skeleton for project grid (6-9 cards)
 */
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for projects page header
 */
export function ProjectsPageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Complete projects list page skeleton
 */
export function ProjectsListPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <ProjectsPageHeaderSkeleton />
      <ProjectGridSkeleton count={6} />
    </div>
  );
}

/**
 * Skeleton for project detail page header
 */
export function ProjectHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

/**
 * Skeleton for project stats cards (4 cards)
 */
export function ProjectStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton for tab navigation
 */
export function TabNavigationSkeleton() {
  return (
    <div className="flex items-center gap-2 border-b">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-b-none" />
      ))}
    </div>
  );
}

/**
 * Skeleton for project detail page content area
 */
export function ProjectDetailContentSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Complete project detail page skeleton
 */
export function ProjectDetailPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6 mx-auto">
      <ProjectHeaderSkeleton />
      <ProjectStatsSkeleton />
      <TabNavigationSkeleton />
      <ProjectDetailContentSkeleton />
    </div>
  );
}
