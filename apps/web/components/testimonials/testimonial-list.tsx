"use client";

import { useState, useMemo } from "react";
import { testimonials } from "@/lib/queries";
import { TestimonialCard } from "./testimonial-card";
import { ModerationTestimonialCard } from "../moderation/moderation-testimonial-card";
import { ModerationStatsDashboard } from "../moderation/moderation-stats-dashboard";
import { FilterPresets, FilterPreset } from "../moderation/filter-presets";
import { TestimonialListPageSkeleton } from "../skeletons";
import { KeyboardShortcutsHelp } from "../keyboard-shortcuts-help";
import { BulkActionsBar } from "./bulk-actions-bar";
import { ActionHistoryPanel } from "./action-history-panel";
import { SearchAndFilters } from "./search-and-filters";
import { EmptyStates } from "./empty-states";
import { StatusHeader } from "./status-header";
import {
  useTestimonialKeyboardShortcuts,
  filterTestimonials,
} from "@/hooks/use-testimonial-moderation";
import {
  getStatusCounts,
  getModerationCounts,
  calculateModerationStats,
  type FilterStatus,
  type ModerationFilter,
} from "@/lib/testimonial-list-utils";
import type { Testimonial } from "@/types/api";
import { useTestimonialListActions } from "./use-testimonial-list-actions";

import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialListProps {
  projectSlug: string;
  moderationMode?: boolean;
}

export function TestimonialList({
  projectSlug,
  moderationMode = false,
}: TestimonialListProps) {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterVerified, setFilterVerified] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [filterModeration, setFilterModeration] =
    useState<ModerationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<FilterPreset>("all");
  const [showHistory, setShowHistory] = useState(false);
  const limit = 10;

  const collectionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/testimonials/${projectSlug}`
      : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(collectionUrl);
    toast.success("Collection URL copied to clipboard!");
  };

  const { data, isLoading } = testimonials.queries.useList(
    projectSlug,
    page,
    limit,
  );

  const allTestimonials = useMemo<Testimonial[]>(() => {
    return Array.isArray(data?.data) ? (data.data as Testimonial[]) : [];
  }, [data?.data]);

  const {
    loadingState,
    actionHistory,
    bulkMutationPending,
    validForApprove,
    validForReject,
    validForFlag,
    handleApprove,
    handleReject,
    handlePublish,
    handleUnpublish,
    handleDelete,
    handleUndoBulkAction,
    handleBulkApprove,
    handleBulkReject,
    handleBulkFlag,
  } = useTestimonialListActions({
    projectSlug,
    allTestimonials,
    selectedIds,
    setSelectedIds,
  });

  // Calculate stats for moderation mode
  const stats = useMemo(
    () => calculateModerationStats(allTestimonials),
    [allTestimonials],
  );

  // Filter testimonials based on all criteria
  const filteredTestimonials = useMemo(
    () =>
      filterTestimonials(
        allTestimonials,
        searchQuery,
        filterStatus,
        filterVerified,
        filterModeration,
        moderationMode,
        activePreset,
      ),
    [
      allTestimonials,
      searchQuery,
      filterStatus,
      filterVerified,
      filterModeration,
      moderationMode,
      activePreset,
    ],
  );


  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTestimonials?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTestimonials?.map((t: Testimonial) => t.id) || []);
    }
  };

  const handleSelectByStatus = (
    status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED",
  ) => {
    const ids =
      filteredTestimonials
        ?.filter((t: Testimonial) => t.moderationStatus === status)
        .map((t: Testimonial) => t.id) || [];
    setSelectedIds(ids);
  };

  // Keyboard shortcuts using custom hook
  useTestimonialKeyboardShortcuts({
    moderationMode,
    selectedIds,
    filteredTestimonials,
    validForApprove,
    validForReject,
    validForFlag,
    loadingState,
    bulkMutationPending,
    onApprove: handleApprove,
    onReject: handleReject,
    onDelete: handleDelete,
    onBulkApprove: handleBulkApprove,
    onBulkReject: handleBulkReject,
    onBulkFlag: handleBulkFlag,
    onClearSelection: () => setSelectedIds([]),
    onToggleSelectAll: toggleSelectAll,
    onSelectByStatus: handleSelectByStatus,
  });

  const handlePresetChange = (preset: FilterPreset) => {
    setActivePreset(preset);
    setPage(1);

    // Reset other filters when using presets
    if (preset !== "all") {
      setFilterStatus("all");
      setFilterModeration("all");
      setFilterVerified("all");
    }
  };

  if (isLoading) {
    return <TestimonialListPageSkeleton moderationMode={moderationMode} />;
  }

  const counts = getStatusCounts(allTestimonials);
  const moderationCounts = getModerationCounts(allTestimonials);
  const hasTestimonials = data?.data && data.data.length > 0;

  return (
    <div className="space-y-6">
      {/* Moderation Stats Dashboard - Only in moderation mode */}
      {moderationMode && <ModerationStatsDashboard stats={stats} />}

      {/* Action History Panel - Only in moderation mode when there's history */}
      {moderationMode && (
        <ActionHistoryPanel
          history={actionHistory}
          showHistory={showHistory}
          isPending={bulkMutationPending}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onUndo={handleUndoBulkAction}
        />
      )}

      {/* Filter Presets - Only in moderation mode */}
      {moderationMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <FilterPresets
            activePreset={activePreset}
            onPresetChange={handlePresetChange}
            counts={stats}
          />
          <KeyboardShortcutsHelp />
        </div>
      )}

      {/* Header with Stats - Only in normal mode */}
      {!moderationMode && (
        <StatusHeader
          total={data?.meta?.pagination?.total || 0}
          statusCounts={counts}
          moderationCounts={moderationCounts}
        />
      )}

      {/* Filters */}
      {hasTestimonials && (
        <SearchAndFilters
          moderationMode={moderationMode}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          filterModeration={filterModeration}
          filterVerified={filterVerified}
          selectedCount={selectedIds.length}
          totalCount={filteredTestimonials?.length || 0}
          selectAllChecked={
            selectedIds.length === filteredTestimonials?.length &&
            filteredTestimonials?.length > 0
          }
          onSearchChange={setSearchQuery}
          onFilterStatusChange={(value) => setFilterStatus(value)}
          onFilterModerationChange={(value) => setFilterModeration(value)}
          onFilterVerifiedChange={(value) => setFilterVerified(value)}
          onToggleSelectAll={toggleSelectAll}
        />
      )}

      {/* Testimonials Grid - Empty States */}
      <EmptyStates
        moderationMode={moderationMode}
        hasTestimonials={hasTestimonials || false}
        hasFilteredResults={
          filteredTestimonials && filteredTestimonials.length > 0
        }
        onCopyUrl={handleCopyUrl}
      />

      {/* Testimonials Grid - Actual List */}
      {hasTestimonials &&
        filteredTestimonials &&
        filteredTestimonials.length > 0 && (
          <>
            <div className="grid gap-4 grid-cols-1">
              {filteredTestimonials?.map((testimonial: Testimonial) =>
                moderationMode ? (
                  <ModerationTestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    isSelected={selectedIds.includes(testimonial.id)}
                    onToggleSelect={toggleSelection}
                    loadingAction={
                      loadingState?.id === testimonial.id
                        ? loadingState.action
                        : null
                    }
                  />
                ) : (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onPublish={handlePublish}
                    onUnpublish={handleUnpublish}
                    onDelete={handleDelete}
                  />
                ),
              )}
            </div>

            {/* Fixed Bottom Bulk Actions Bar */}
            <BulkActionsBar
              selectedCount={selectedIds.length}
              validForApprove={validForApprove}
              validForReject={validForReject}
              validForFlag={validForFlag}
              isPending={bulkMutationPending}
              onApprove={handleBulkApprove}
              onReject={handleBulkReject}
              onFlag={handleBulkFlag}
              onClear={() => setSelectedIds([])}
            />

            {/* Pagination */}
            {data?.meta?.pagination && data.meta.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {data.meta.pagination.page} of{" "}
                  {data.meta.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.meta.pagination.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.meta.pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
}
