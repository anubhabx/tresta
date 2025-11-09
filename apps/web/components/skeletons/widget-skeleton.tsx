"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";

/**
 * Skeleton for a single widget card
 */
export function WidgetCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Layout badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Settings preview */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Preview area */}
          <div className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Skeleton for widget grid (2-4 cards)
 */
export function WidgetGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <WidgetCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for widget list header
 */
export function WidgetListHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/**
 * Skeleton for widget form (left panel in builder)
 */
export function WidgetFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for widget preview (right panel in builder)
 */
export function WidgetPreviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-6 space-y-4">
          {/* Preview content */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for widget builder (split panel layout)
 */
export function WidgetBuilderSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left panel - Form */}
      <div>
        <WidgetFormSkeleton />
      </div>

      {/* Right panel - Preview */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <WidgetPreviewSkeleton />
      </div>
    </div>
  );
}

/**
 * Complete widget tab skeleton
 */
export function WidgetTabSkeleton() {
  return (
    <div className="space-y-6">
      <WidgetListHeaderSkeleton />
      <WidgetGridSkeleton count={3} />
    </div>
  );
}

/**
 * Widget page skeleton with header
 */
export function WidgetPageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Widget builder */}
      <WidgetBuilderSkeleton />
    </div>
  );
}
