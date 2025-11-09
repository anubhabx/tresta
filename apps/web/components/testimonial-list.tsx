"use client";

import { useState, useMemo } from "react";
import { testimonials, moderation } from "@/lib/queries";
import { TestimonialCard } from "./testimonial-card";
import { ModerationTestimonialCard } from "./moderation/moderation-testimonial-card";
import { ModerationStatsDashboard } from "./moderation/moderation-stats-dashboard";
import { FilterPresets, FilterPreset } from "./moderation/filter-presets";
import { TestimonialListPageSkeleton } from "./skeletons";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { BulkActionsBar } from "./testimonials/bulk-actions-bar";
import { ActionHistoryPanel } from "./testimonials/action-history-panel";
import { SearchAndFilters } from "./testimonials/search-and-filters";
import { EmptyStates } from "./testimonials/empty-states";
import { StatusHeader } from "./testimonials/status-header";
import {
  useTestimonialKeyboardShortcuts,
  filterTestimonials,
} from "@/hooks/use-testimonial-moderation";
import {
  getStatusCounts,
  getModerationCounts,
  calculateModerationStats,
  getValidTestimonialsForAction,
  addToActionHistory,
  type BulkActionHistory,
  type FilterStatus,
  type ModerationFilter,
} from "@/lib/testimonial-list-utils";
import type { Testimonial, ModerationStatus } from "@/types/api";

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
  const [loadingState, setLoadingState] = useState<{
    id: string;
    action: string;
  } | null>(null);
  const [actionHistory, setActionHistory] = useState<BulkActionHistory[]>([]);
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

  // Create mutation hooks at component level
  const updateMutation = testimonials.mutations.useUpdate(projectSlug);
  const deleteMutation = testimonials.mutations.useDelete(projectSlug);
  const bulkModerationMutation =
    moderation.mutations.useBulkAction(projectSlug);

  const allTestimonials = (data?.data as Testimonial[]) ?? [];

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

  const handleApprove = async (id: string) => {
    setLoadingState({ id, action: "approve" });
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          isApproved: true,
          moderationStatus: "APPROVED" as ModerationStatus,
        },
      });
      toast.success(
        "Testimonial approved! View in Testimonials tab to publish it.",
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingState({ id, action: "reject" });
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          isApproved: false,
          moderationStatus: "REJECTED" as ModerationStatus,
        },
      });
      toast.success("Testimonial rejected");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  const handlePublish = async (id: string) => {
    setLoadingState({ id, action: "publish" });
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: true } });
      toast.success("Testimonial published!");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to publish testimonial";
      // Check if it's the approval workflow error
      if (errorMessage.includes("approved")) {
        toast.error(
          "Cannot publish unapproved testimonial. Approve it in the Moderation tab first.",
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingState(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setLoadingState({ id, action: "unpublish" });
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: false } });
      toast.success("Testimonial unpublished");
    } catch (error: any) {
      toast.error(error?.message || "Failed to unpublish testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingState({ id, action: "delete" });
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Testimonial deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  // Calculate valid testimonials for each action
  const validForApprove = useMemo(
    () =>
      getValidTestimonialsForAction(allTestimonials, selectedIds, "approve")
        .length,
    [selectedIds, allTestimonials],
  );
  const validForReject = useMemo(
    () =>
      getValidTestimonialsForAction(allTestimonials, selectedIds, "reject")
        .length,
    [selectedIds, allTestimonials],
  );
  const validForFlag = useMemo(
    () =>
      getValidTestimonialsForAction(allTestimonials, selectedIds, "flag")
        .length,
    [selectedIds, allTestimonials],
  );

  // Undo handler for bulk actions
  const handleUndoBulkAction = async (actionId: string) => {
    const action = actionHistory.find((a) => a.id === actionId);
    if (!action) return;

    const { testimonialIds, previousStatuses } = action;

    try {
      // Restore each testimonial to its previous status
      for (const id of testimonialIds) {
        const previousStatus = previousStatuses.get(id);
        if (previousStatus) {
          await bulkModerationMutation.mutateAsync({
            testimonialIds: [id],
            action:
              previousStatus === "APPROVED"
                ? "approve"
                : previousStatus === "REJECTED"
                  ? "reject"
                  : "flag",
          });
        }
      }

      toast.success(`Undid action on ${testimonialIds.length} testimonial(s)`);

      // Remove this action from history
      setActionHistory((prev) => prev.filter((a) => a.id !== actionId));
    } catch (error: any) {
      toast.error(error?.message || "Failed to undo action");
    }
  };

  // Bulk moderation handlers
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }

    const validTestimonials = getValidTestimonialsForAction(
      allTestimonials,
      selectedIds,
      "approve",
    );
    const validIds = validTestimonials.map((t) => t.id);

    if (validIds.length === 0) {
      toast.info("All selected testimonials are already approved");
      return;
    }

    // Store previous statuses for undo
    const previousStatuses = new Map<string, ModerationStatus>();
    validTestimonials.forEach((t) => {
      previousStatuses.set(t.id, t.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action: "approve",
      });

      // Add to history
      const { history: newHistory, actionId } = addToActionHistory(
        actionHistory,
        {
          testimonialIds: validIds,
          action: "approve",
          previousStatuses,
          count: validIds.length,
        },
      );
      setActionHistory(newHistory);

      if (skipped > 0) {
        toast.success(
          `${validIds.length} testimonial(s) approved (${skipped} already approved, skipped)`,
          {
            action: {
              label: "Undo",
              onClick: () => handleUndoBulkAction(actionId),
            },
            duration: 10000,
          },
        );
      } else {
        toast.success(`${validIds.length} testimonial(s) approved`, {
          action: {
            label: "Undo",
            onClick: () => handleUndoBulkAction(actionId),
          },
          duration: 10000,
        });
      }

      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve testimonials");
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }

    const validTestimonials = getValidTestimonialsForAction(
      allTestimonials,
      selectedIds,
      "reject",
    );
    const validIds = validTestimonials.map((t) => t.id);

    if (validIds.length === 0) {
      toast.info("All selected testimonials are already rejected");
      return;
    }

    // Store previous statuses for undo
    const previousStatuses = new Map<string, ModerationStatus>();
    validTestimonials.forEach((t) => {
      previousStatuses.set(t.id, t.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action: "reject",
      });

      // Add to history
      const { history: newHistory, actionId } = addToActionHistory(
        actionHistory,
        {
          testimonialIds: validIds,
          action: "reject",
          previousStatuses,
          count: validIds.length,
        },
      );
      setActionHistory(newHistory);

      if (skipped > 0) {
        toast.success(
          `${validIds.length} testimonial(s) rejected (${skipped} already rejected, skipped)`,
          {
            action: {
              label: "Undo",
              onClick: () => handleUndoBulkAction(actionId),
            },
            duration: 10000,
          },
        );
      } else {
        toast.success(`${validIds.length} testimonial(s) rejected`, {
          action: {
            label: "Undo",
            onClick: () => handleUndoBulkAction(actionId),
          },
          duration: 10000,
        });
      }

      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject testimonials");
    }
  };

  const handleBulkFlag = async () => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }

    const validTestimonials = getValidTestimonialsForAction(
      allTestimonials,
      selectedIds,
      "flag",
    );
    const validIds = validTestimonials.map((t) => t.id);

    if (validIds.length === 0) {
      toast.info("All selected testimonials are already flagged");
      return;
    }

    // Store previous statuses for undo
    const previousStatuses = new Map<string, ModerationStatus>();
    validTestimonials.forEach((t) => {
      previousStatuses.set(t.id, t.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action: "flag",
      });

      // Add to history
      const { history: newHistory, actionId } = addToActionHistory(
        actionHistory,
        {
          testimonialIds: validIds,
          action: "flag",
          previousStatuses,
          count: validIds.length,
        },
      );
      setActionHistory(newHistory);

      if (skipped > 0) {
        toast.success(
          `${validIds.length} testimonial(s) flagged for review (${skipped} already flagged, skipped)`,
          {
            action: {
              label: "Undo",
              onClick: () => handleUndoBulkAction(actionId),
            },
            duration: 10000,
          },
        );
      } else {
        toast.success(`${validIds.length} testimonial(s) flagged for review`, {
          action: {
            label: "Undo",
            onClick: () => handleUndoBulkAction(actionId),
          },
          duration: 10000,
        });
      }

      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to flag testimonials");
    }
  };

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
    bulkMutationPending: bulkModerationMutation.isPending,
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
          isPending={bulkModerationMutation.isPending}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onUndo={handleUndoBulkAction}
        />
      )}

      {/* Filter Presets - Only in moderation mode */}
      {moderationMode && (
        <div className="flex items-center justify-between gap-4">
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
              isPending={bulkModerationMutation.isPending}
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
