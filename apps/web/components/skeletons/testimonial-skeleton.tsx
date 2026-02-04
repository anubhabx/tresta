"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";

/**
 * Skeleton for a single testimonial card
 */
export function TestimonialCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with badges */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-4 rounded" />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Author info */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Footer with date and actions */}
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-3 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for filter bar
 */
export function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/**
 * Skeleton for moderation stats dashboard
 */
export function ModerationStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton for testimonial list (3-5 cards)
 */
export function TestimonialListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TestimonialCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for pagination controls
 */
export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Complete testimonial list page skeleton with filters
 */
export function TestimonialListPageSkeleton({
  moderationMode = false,
}: {
  moderationMode?: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Moderation stats (only in moderation mode) */}
      {moderationMode && <ModerationStatsSkeleton />}

      {/* Filter bar */}
      <FilterBarSkeleton />

      {/* Testimonial list */}
      <TestimonialListSkeleton count={5} />

      {/* Pagination */}
      <PaginationSkeleton />
    </div>
  );
}
