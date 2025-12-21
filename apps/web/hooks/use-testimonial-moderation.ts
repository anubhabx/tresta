import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { toast } from "sonner";
import type { Testimonial } from "@/types/api";
import type { FilterPreset } from "@/components/moderation/filter-presets";

interface UseTestimonialKeyboardShortcutsOptions {
  moderationMode: boolean;
  selectedIds: string[];
  filteredTestimonials: Testimonial[];
  validForApprove: number;
  validForReject: number;
  validForFlag: number;
  loadingState: { id: string; action: string } | null;
  bulkMutationPending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkFlag: () => void;
  onClearSelection: () => void;
  onToggleSelectAll: () => void;
  onSelectByStatus: (
    status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED",
  ) => void;
}

/**
 * Custom hook to handle all keyboard shortcuts for testimonial moderation
 */
export function useTestimonialKeyboardShortcuts({
  moderationMode,
  selectedIds,
  filteredTestimonials,
  validForApprove,
  validForReject,
  validForFlag,
  loadingState,
  bulkMutationPending,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkReject,
  onBulkFlag,
  onClearSelection,
  onToggleSelectAll,
  onSelectByStatus,
}: UseTestimonialKeyboardShortcutsOptions) {
  // Main action shortcuts (A, R, F, D, X)
  useKeyboardShortcuts({
    enabled: moderationMode && selectedIds.length > 0,
    shortcuts: [
      {
        key: "a",
        action: () => {
          if (selectedIds.length === 1 && selectedIds[0]) {
            onApprove(selectedIds[0]);
          } else {
            onBulkApprove();
          }
        },
        disabled:
          loadingState !== null || bulkMutationPending || validForApprove === 0,
      },
      {
        key: "r",
        action: () => {
          if (selectedIds.length === 1 && selectedIds[0]) {
            onReject(selectedIds[0]);
          } else {
            onBulkReject();
          }
        },
        disabled:
          loadingState !== null || bulkMutationPending || validForReject === 0,
      },
      {
        key: "f",
        action: () => {
          onBulkFlag();
        },
        disabled:
          loadingState !== null || bulkMutationPending || validForFlag === 0,
      },
      {
        key: "d",
        action: () => {
          if (selectedIds.length === 1 && selectedIds[0]) {
            onDelete(selectedIds[0]);
          } else {
            toast.error(
              "Can only delete one testimonial at a time. Please select only one.",
            );
          }
        },
        disabled: loadingState !== null,
      },
      {
        key: "x",
        action: () => {
          onClearSelection();
        },
      },
    ],
  });

  // Select All shortcut (Shift+A)
  useKeyboardShortcuts({
    enabled: moderationMode,
    shortcuts: [
      {
        key: "a",
        shift: true,
        action: () => {
          onToggleSelectAll();
          toast.success(
            selectedIds.length === filteredTestimonials?.length
              ? "All selections cleared"
              : `${filteredTestimonials?.length || 0} testimonials selected`,
          );
        },
      },
    ],
  });

  // Smart selection by state (Shift+P, Shift+V, Shift+R, Shift+F)
  useKeyboardShortcuts({
    enabled: moderationMode,
    shortcuts: [
      {
        key: "p",
        shift: true,
        action: () => {
          onSelectByStatus("PENDING");
          const count =
            filteredTestimonials?.filter(
              (t) => t.moderationStatus === "PENDING",
            ).length || 0;
          toast.success(
            count > 0
              ? `${count} pending testimonial(s) selected`
              : "No pending testimonials to select",
          );
        },
      },
      {
        key: "v",
        shift: true,
        action: () => {
          onSelectByStatus("APPROVED");
          const count =
            filteredTestimonials?.filter(
              (t) => t.moderationStatus === "APPROVED",
            ).length || 0;
          toast.success(
            count > 0
              ? `${count} approved testimonial(s) selected`
              : "No approved testimonials to select",
          );
        },
      },
      {
        key: "r",
        shift: true,
        action: () => {
          onSelectByStatus("REJECTED");
          const count =
            filteredTestimonials?.filter(
              (t) => t.moderationStatus === "REJECTED",
            ).length || 0;
          toast.success(
            count > 0
              ? `${count} rejected testimonial(s) selected`
              : "No rejected testimonials to select",
          );
        },
      },
      {
        key: "f",
        shift: true,
        action: () => {
          onSelectByStatus("FLAGGED");
          const count =
            filteredTestimonials?.filter(
              (t) => t.moderationStatus === "FLAGGED",
            ).length || 0;
          toast.success(
            count > 0
              ? `${count} flagged testimonial(s) selected`
              : "No flagged testimonials to select",
          );
        },
      },
    ],
  });
}

/**
 * Helper to filter testimonials
 */
export function filterTestimonials(
  testimonials: Testimonial[],
  searchQuery: string,
  filterStatus: string,
  filterVerified: string,
  filterModeration: string,
  moderationMode: boolean,
  activePreset: FilterPreset,
) {
  let filtered = testimonials;

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.authorName.toLowerCase().includes(query) ||
        t.authorEmail?.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query),
    );
  }

  // Status filter
  if (filterStatus !== "all") {
    filtered = filtered.filter((t) => {
      if (filterStatus === "pending") return !t.isApproved;
      if (filterStatus === "approved") return t.isApproved && !t.isPublished;
      if (filterStatus === "published") return t.isPublished;
      return true;
    });
  }

  // Verification filter
  if (filterVerified === "verified") {
    filtered = filtered.filter((t) => t.isOAuthVerified);
  } else if (filterVerified === "unverified") {
    filtered = filtered.filter((t) => !t.isOAuthVerified);
  }

  // Moderation filter
  if (moderationMode && filterModeration !== "all") {
    filtered = filtered.filter((t) => t.moderationStatus === filterModeration);
  }

  // Preset filter (moderation mode only)
  if (moderationMode) {
    if (activePreset === "needs-review") {
      filtered = filtered.filter(
        (t) =>
          t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED",
      );
    } else if (activePreset === "high-risk") {
      filtered = filtered.filter((t) => (t.moderationScore ?? 0) >= 0.7);
    } else if (activePreset === "pending") {
      filtered = filtered.filter((t) => t.moderationStatus === "PENDING");
    } else if (activePreset === "flagged") {
      filtered = filtered.filter((t) => t.moderationStatus === "FLAGGED");
    } else if (activePreset === "approved") {
      filtered = filtered.filter((t) => t.moderationStatus === "APPROVED");
    } else if (activePreset === "rejected") {
      filtered = filtered.filter((t) => t.moderationStatus === "REJECTED");
    } else if (activePreset === "verified") {
      filtered = filtered.filter((t) => t.isOAuthVerified);
    }
  } else {
    // Regular mode: Show only APPROVED testimonials, unless user specifically asks for pending or all
    if (filterStatus !== "pending" && filterStatus !== "all") {
      filtered = filtered.filter((t) => t.isApproved === true);
    }
  }

  return filtered;
}
