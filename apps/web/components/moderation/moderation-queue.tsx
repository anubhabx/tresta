/**
 * Moderation Queue Component
 * Main component that orchestrates the moderation queue page
 */

"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { moderation } from "@/lib/queries";
import { ModerationStatsWidget } from "./moderation-stats-widget";
import { ModerationFilters } from "./moderation-filters";
import { ModerationBulkActions } from "./moderation-bulk-actions";
import { ModerationTestimonialCard } from "./moderation-testimonial-card";

interface ModerationQueueProps {
  slug: string;
}

export function ModerationQueue({ slug }: ModerationQueueProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Build filters
  const filters = {
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    verified: verifiedFilter !== "all" ? (verifiedFilter as any) : undefined,
    page,
    limit: 10,
  };

  // Queries
  const { data, isLoading, error } = moderation.queries.useGetQueue(slug, filters);

  // Mutations
  const bulkActionMutation = moderation.mutations.useBulkAction(slug);

  // Handlers
  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: "approve" | "reject" | "flag") => {
    if (selectedIds.size === 0) return;

    try {
      await bulkActionMutation.mutateAsync({
        testimonialIds: Array.from(selectedIds),
        action,
      });

      toast.success(`${selectedIds.size} testimonial(s) ${action}d successfully`);

      setSelectedIds(new Set());
    } catch (error) {
      toast.error(`Failed to ${action} testimonials`);
    }
  };

  const handleSingleAction = async (
    id: string,
    action: "approve" | "reject" | "flag"
  ) => {
    try {
      // Use bulk action mutation for single items too
      await bulkActionMutation.mutateAsync({
        testimonialIds: [id],
        action,
      });

      toast.success(`Testimonial ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} testimonial`);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setVerifiedFilter("all");
    setPage(1);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load moderation queue</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const testimonials = data?.data || [];
  const stats = data?.meta?.stats;
  const pagination = data?.meta?.pagination;

  return (
    <div>
      {/* Statistics Widget */}
      {stats && <ModerationStatsWidget stats={stats} />}

      {/* Filters */}
      <ModerationFilters
        statusFilter={statusFilter}
        verifiedFilter={verifiedFilter}
        onStatusChange={setStatusFilter}
        onVerifiedChange={setVerifiedFilter}
        onReset={handleResetFilters}
      />

      {/* Bulk Actions */}
      <ModerationBulkActions
        selectedCount={selectedIds.size}
        onApproveAll={() => handleBulkAction("approve")}
        onRejectAll={() => handleBulkAction("reject")}
        onFlagAll={() => handleBulkAction("flag")}
        onClearSelection={handleClearSelection}
        isLoading={bulkActionMutation.isPending}
      />

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No testimonials found</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {testimonials.map((testimonial) => (
            <ModerationTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              isSelected={selectedIds.has(testimonial.id)}
              onSelect={handleSelect}
              onApprove={() => handleSingleAction(testimonial.id, "approve")}
              onReject={() => handleSingleAction(testimonial.id, "reject")}
              onFlag={() => handleSingleAction(testimonial.id, "flag")}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} testimonials
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPreviousPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
