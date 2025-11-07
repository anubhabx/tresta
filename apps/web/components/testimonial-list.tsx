"use client";

import { useState, useMemo } from "react";
import { testimonials, moderation } from "@/lib/queries";
import { TestimonialCard } from "./testimonial-card";
import { ModerationTestimonialCard } from "./moderation/moderation-testimonial-card";
import { ModerationStatsDashboard } from "./moderation/moderation-stats-dashboard";
import { FilterPresets, FilterPreset } from "./moderation/filter-presets";
import { LoadingStars } from "./loader";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { Testimonial, ModerationStatus } from "@/types/api";

import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Eye
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent } from "@workspace/ui/components/card";
import { KeyboardShortcutBadge } from "./keyboard-shortcut-badge";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@workspace/ui/components/tooltip";

interface TestimonialListProps {
  projectSlug: string;
  moderationMode?: boolean; // New prop to enable moderation features
}

type FilterStatus = "all" | "pending" | "approved" | "published";
type ModerationFilter = "all" | "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";

interface BulkActionHistory {
  testimonialIds: string[];
  action: "approve" | "reject" | "flag";
  previousStatuses: Map<string, ModerationStatus>;
}

export function TestimonialList({ projectSlug, moderationMode = false }: TestimonialListProps) {
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
  const [loadingState, setLoadingState] = useState<{ id: string; action: string } | null>(null);
  const [lastBulkAction, setLastBulkAction] = useState<BulkActionHistory | null>(null);
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
    limit
  );

  // Create mutation hooks at component level
  const updateMutation = testimonials.mutations.useUpdate(projectSlug);
  const deleteMutation = testimonials.mutations.useDelete(projectSlug);
  const bulkModerationMutation =
    moderation.mutations.useBulkAction(projectSlug);

  const allTestimonials = (data?.data as Testimonial[]) ?? [];

  // Calculate stats for moderation mode
  const stats = useMemo(() => {
    const pending = allTestimonials.filter((t) => t.moderationStatus === "PENDING").length;
    const flagged = allTestimonials.filter((t) => t.moderationStatus === "FLAGGED").length;
    const approved = allTestimonials.filter((t) => t.moderationStatus === "APPROVED").length;
    const rejected = allTestimonials.filter((t) => t.moderationStatus === "REJECTED").length;
    const oauthVerified = allTestimonials.filter((t) => t.isOAuthVerified).length;
    const autoModerated = allTestimonials.filter((t) => t.autoPublished).length;
    const needsReview = pending + flagged;
    const highRisk = allTestimonials.filter((t) => (t.moderationScore ?? 0) >= 0.7).length;

    return {
      pending,
      flagged,
      approved,
      rejected,
      oauthVerified,
      autoModerated,
      all: allTestimonials.length,
      needsReview,
      highRisk,
      verified: oauthVerified,
    };
  }, [allTestimonials]);

  // Filter testimonials based on all criteria
  const filteredTestimonials = useMemo(() => {
    let filtered = allTestimonials;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.authorName.toLowerCase().includes(query) ||
          t.authorEmail?.toLowerCase().includes(query) ||
          t.content.toLowerCase().includes(query)
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
            t.moderationStatus === "PENDING" || t.moderationStatus === "FLAGGED"
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
      // When activePreset is "all", show all testimonials in moderation mode
    } else {
      // Regular mode: Show only APPROVED testimonials
      filtered = filtered.filter((t) => t.isApproved === true);
    }

    return filtered;
  }, [allTestimonials, searchQuery, filterStatus, filterVerified, filterModeration, moderationMode, activePreset]);

  const handleApprove = async (id: string) => {
    setLoadingState({ id, action: 'approve' });
    try {
      await updateMutation.mutateAsync({ 
        id, 
        data: { 
          isApproved: true,
          moderationStatus: "APPROVED" as ModerationStatus
        } 
      });
      toast.success("Testimonial approved! View in Testimonials tab to publish it.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingState({ id, action: 'reject' });
    try {
      await updateMutation.mutateAsync({ 
        id, 
        data: { 
          isApproved: false,
          moderationStatus: "REJECTED" as ModerationStatus
        } 
      });
      toast.success("Testimonial rejected");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  const handlePublish = async (id: string) => {
    setLoadingState({ id, action: 'publish' });
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: true } });
      toast.success("Testimonial published!");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to publish testimonial";
      // Check if it's the approval workflow error
      if (errorMessage.includes("approved")) {
        toast.error("Cannot publish unapproved testimonial. Approve it in the Moderation tab first.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingState(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setLoadingState({ id, action: 'unpublish' });
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
    setLoadingState({ id, action: 'delete' });
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Testimonial deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete testimonial");
    } finally {
      setLoadingState(null);
    }
  };

  // Helper to get selected testimonials and filter by action validity
  const getValidTestimonialsForAction = (action: "approve" | "reject" | "flag") => {
    const selected = allTestimonials.filter((t) => selectedIds.includes(t.id));
    
    switch (action) {
      case "approve":
        // Only testimonials that are not already approved
        return selected.filter((t) => t.moderationStatus !== "APPROVED");
      case "reject":
        // Only testimonials that are not already rejected
        return selected.filter((t) => t.moderationStatus !== "REJECTED");
      case "flag":
        // Only testimonials that are not already flagged
        return selected.filter((t) => t.moderationStatus !== "FLAGGED");
      default:
        return selected;
    }
  };

  // Calculate valid testimonials for each action
  const validForApprove = useMemo(
    () => getValidTestimonialsForAction("approve"),
    [selectedIds, allTestimonials]
  );
  const validForReject = useMemo(
    () => getValidTestimonialsForAction("reject"),
    [selectedIds, allTestimonials]
  );
  const validForFlag = useMemo(
    () => getValidTestimonialsForAction("flag"),
    [selectedIds, allTestimonials]
  );

  // Undo handler for bulk actions
  const handleUndoBulkAction = async () => {
    if (!lastBulkAction) return;

    const { testimonialIds, previousStatuses } = lastBulkAction;

    try {
      // Restore each testimonial to its previous status
      for (const id of testimonialIds) {
        const previousStatus = previousStatuses.get(id);
        if (previousStatus) {
          await bulkModerationMutation.mutateAsync({
            testimonialIds: [id],
            action: previousStatus === "APPROVED" ? "approve" : 
                    previousStatus === "REJECTED" ? "reject" : 
                    "flag"
          });
        }
      }

      toast.success(`Undid action on ${testimonialIds.length} testimonial(s)`);
      setLastBulkAction(null);
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

    const validIds = validForApprove.map((t) => t.id);
    
    if (validIds.length === 0) {
      toast.info("All selected testimonials are already approved");
      return;
    }

    // Store previous statuses for undo
    const previousStatuses = new Map<string, ModerationStatus>();
    validForApprove.forEach((t) => {
      previousStatuses.set(t.id, t.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action: "approve"
      });

      // Store action history for undo
      setLastBulkAction({
        testimonialIds: validIds,
        action: "approve",
        previousStatuses
      });
      
      if (skipped > 0) {
        toast.success(
          `${validIds.length} testimonial(s) approved (${skipped} already approved, skipped)`,
          {
            action: {
              label: "Undo",
              onClick: handleUndoBulkAction
            },
            duration: 10000
          }
        );
      } else {
        toast.success(`${validIds.length} testimonial(s) approved`, {
          action: {
            label: "Undo",
            onClick: handleUndoBulkAction
          },
          duration: 10000
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

    const validIds = validForReject.map((t) => t.id);
    
    if (validIds.length === 0) {
      toast.info("All selected testimonials are already rejected");
      return;
    }

    // Store previous statuses for undo
    const previousStatuses = new Map<string, ModerationStatus>();
    validForReject.forEach((t) => {
      previousStatuses.set(t.id, t.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action: "reject"
      });

      // Store action history for undo
      setLastBulkAction({
        testimonialIds: validIds,
        action: "reject",
        previousStatuses
      });
      
      if (skipped > 0) {
        toast.success(
          `${validIds.length} testimonial(s) rejected (${skipped} already rejected, skipped)`,
          {
            action: {
              label: "Undo",
              onClick: handleUndoBulkAction
            },
            duration: 10000
          }
        );
      } else {
        toast.success(`${validIds.length} testimonial(s) rejected`, {
          action: {
            label: "Undo",
            onClick: handleUndoBulkAction
          },
          duration: 10000
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

    const validIds = validForFlag.map((t) => t.id);
    
    if (validIds.length === 0) {
      toast.info("All selected testimonials are already flagged");
      return;
    }

    // Store previous statuses for undo
    const previousStatuses = new Map<string, ModerationStatus>();
    validForFlag.forEach((t) => {
      previousStatuses.set(t.id, t.moderationStatus);
    });

    const skipped = selectedIds.length - validIds.length;

    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: validIds,
        action: "flag"
      });

      // Store action history for undo
      setLastBulkAction({
        testimonialIds: validIds,
        action: "flag",
        previousStatuses
      });
      
      if (skipped > 0) {
        toast.success(
          `${validIds.length} testimonial(s) flagged for review (${skipped} already flagged, skipped)`,
          {
            action: {
              label: "Undo",
              onClick: handleUndoBulkAction
            },
            duration: 10000
          }
        );
      } else {
        toast.success(`${validIds.length} testimonial(s) flagged for review`, {
          action: {
            label: "Undo",
            onClick: handleUndoBulkAction
          },
          duration: 10000
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
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTestimonials?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTestimonials?.map((t: Testimonial) => t.id) || []);
    }
  };

  // Keyboard shortcuts for moderation mode
  useKeyboardShortcuts({
    enabled: moderationMode && selectedIds.length > 0,
    shortcuts: [
      {
        key: 'a',
        action: () => {
          if (selectedIds.length === 1 && selectedIds[0]) {
            handleApprove(selectedIds[0]);
          } else {
            handleBulkApprove();
          }
        },
        disabled: loadingState !== null || bulkModerationMutation.isPending || validForApprove.length === 0,
      },
      {
        key: 'r',
        action: () => {
          if (selectedIds.length === 1 && selectedIds[0]) {
            handleReject(selectedIds[0]);
          } else {
            handleBulkReject();
          }
        },
        disabled: loadingState !== null || bulkModerationMutation.isPending || validForReject.length === 0,
      },
      {
        key: 'f',
        action: () => {
          handleBulkFlag();
        },
        disabled: loadingState !== null || bulkModerationMutation.isPending || validForFlag.length === 0,
      },
      {
        key: 'd',
        action: () => {
          if (selectedIds.length === 1 && selectedIds[0]) {
            handleDelete(selectedIds[0]);
          } else {
            toast.error("Can only delete one testimonial at a time. Please select only one.");
          }
        },
        disabled: loadingState !== null,
      },
      {
        key: 'x',
        action: () => {
          setSelectedIds([]);
        },
      },
    ],
  });

  // Keyboard shortcuts for Select All (works in moderation mode always)
  useKeyboardShortcuts({
    enabled: moderationMode,
    shortcuts: [
      {
        key: 'a',
        shift: true,
        action: () => {
          toggleSelectAll();
          toast.success(
            selectedIds.length === filteredTestimonials?.length
              ? "All selections cleared"
              : `${filteredTestimonials?.length || 0} testimonials selected`
          );
        },
      },
    ],
  });

  // Keyboard shortcuts for smart selection by state
  useKeyboardShortcuts({
    enabled: moderationMode,
    shortcuts: [
      {
        key: 'p',
        shift: true,
        action: () => {
          const pendingIds = filteredTestimonials
            ?.filter((t: Testimonial) => t.moderationStatus === 'PENDING')
            .map((t: Testimonial) => t.id) || [];
          
          setSelectedIds(pendingIds);
          toast.success(
            pendingIds.length > 0
              ? `${pendingIds.length} pending testimonial(s) selected`
              : "No pending testimonials to select"
          );
        },
      },
      {
        key: 'v',
        shift: true,
        action: () => {
          const approvedIds = filteredTestimonials
            ?.filter((t: Testimonial) => t.moderationStatus === 'APPROVED')
            .map((t: Testimonial) => t.id) || [];
          
          setSelectedIds(approvedIds);
          toast.success(
            approvedIds.length > 0
              ? `${approvedIds.length} approved testimonial(s) selected`
              : "No approved testimonials to select"
          );
        },
      },
      {
        key: 'r',
        shift: true,
        action: () => {
          const rejectedIds = filteredTestimonials
            ?.filter((t: Testimonial) => t.moderationStatus === 'REJECTED')
            .map((t: Testimonial) => t.id) || [];
          
          setSelectedIds(rejectedIds);
          toast.success(
            rejectedIds.length > 0
              ? `${rejectedIds.length} rejected testimonial(s) selected`
              : "No rejected testimonials to select"
          );
        },
      },
      {
        key: 'f',
        shift: true,
        action: () => {
          const flaggedIds = filteredTestimonials
            ?.filter((t: Testimonial) => t.moderationStatus === 'FLAGGED')
            .map((t: Testimonial) => t.id) || [];
          
          setSelectedIds(flaggedIds);
          toast.success(
            flaggedIds.length > 0
              ? `${flaggedIds.length} flagged testimonial(s) selected`
              : "No flagged testimonials to select"
          );
        },
      },
    ],
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

  const getStatusCounts = () => {
    if (!data?.data) return { pending: 0, approved: 0, published: 0 };
    return {
      pending: data.data.filter((t: Testimonial) => !t.isApproved).length,
      approved: data.data.filter(
        (t: Testimonial) => t.isApproved && !t.isPublished
      ).length,
      published: data.data.filter((t: Testimonial) => t.isPublished).length
    };
  };

  const getModerationCounts = () => {
    if (!data?.data)
      return { pending: 0, approved: 0, flagged: 0, rejected: 0 };
    return {
      pending: data.data.filter(
        (t: Testimonial) => t.moderationStatus === "PENDING"
      ).length,
      approved: data.data.filter(
        (t: Testimonial) => t.moderationStatus === "APPROVED"
      ).length,
      flagged: data.data.filter(
        (t: Testimonial) => t.moderationStatus === "FLAGGED"
      ).length,
      rejected: data.data.filter(
        (t: Testimonial) => t.moderationStatus === "REJECTED"
      ).length
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full h-64 items-center justify-center">
        <LoadingStars />
        <p className="text-sm text-muted-foreground">Loading testimonials...</p>
      </div>
    );
  }

  const counts = getStatusCounts();
  const moderationCounts = getModerationCounts();
  const hasTestimonials = data?.data && data.data.length > 0;

  return (
    <div className="space-y-6">
      {/* Moderation Stats Dashboard - Only in moderation mode */}
      {moderationMode && <ModerationStatsDashboard stats={stats} />}

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
        <div className="flex items-center gap-4 pb-4 border-b flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 rounded-md border bg-muted/30">
              {data?.meta?.pagination?.total || 0} Total
            </Badge>
          </div>
          
          {counts.pending > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">{counts.pending} Pending</span>
            </div>
          )}
          
          {counts.approved > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary/30" />
              <span className="text-muted-foreground">{counts.approved} Approved</span>
            </div>
          )}
          
          {counts.published > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">{counts.published} Published</span>
            </div>
          )}
          
          {moderationCounts.flagged > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-3 w-3 text-destructive/60" />
              <span className="text-muted-foreground">{moderationCounts.flagged} Flagged</span>
            </div>
          )}
          
          {moderationCounts.rejected > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-3 w-3 text-destructive/60" />
              <span className="text-muted-foreground">{moderationCounts.rejected} Rejected</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {hasTestimonials && (
        <div className="space-y-3">
          {/* Select All Checkbox - Only show in moderation mode */}
          {moderationMode && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <Checkbox
                checked={
                  selectedIds.length === filteredTestimonials?.length &&
                  filteredTestimonials?.length > 0
                }
                onCheckedChange={toggleSelectAll}
                id="select-all"
                className="h-5 w-5"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2 flex-1"
              >
                Select All
                <Badge variant="secondary" className="ml-1">
                  {filteredTestimonials?.length || 0}
                </Badge>
                {selectedIds.length > 0 && (
                  <span className="text-muted-foreground text-xs ml-2">
                    ({selectedIds.length} selected)
                  </span>
                )}
              </label>
            </div>
          )}

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Basic Status Filter */}
            {!moderationMode && (
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as FilterStatus)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Eye className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Moderation Mode Filters */}
            {moderationMode && (
              <>
                <Select
                  value={filterModeration}
                  onValueChange={(value) =>
                    setFilterModeration(value as ModerationFilter)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Shield className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Moderation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moderation</SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="APPROVED">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                        Approved
                      </div>
                    </SelectItem>
                    <SelectItem value="FLAGGED">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                        Flagged
                      </div>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filterVerified}
                  onValueChange={(value) =>
                    setFilterVerified(value as "all" | "verified" | "unverified")
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      )}

      {/* Testimonials Grid */}
      {!hasTestimonials ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Testimonials Yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Share your collection link to start receiving testimonials from your
            customers.
          </p>
          <Button variant="outline" size="lg" onClick={handleCopyUrl}>
            <Sparkles className="h-4 w-4 mr-2" />
            Copy Collection Link
          </Button>
        </div>
      ) : filteredTestimonials && filteredTestimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            {moderationMode ? (
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {moderationMode ? "All Clear!" : "No Approved Testimonials"}
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {moderationMode 
              ? "No testimonials need review. All submissions have been processed."
              : "Approve testimonials in the Moderation tab first, then publish them here."
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1">
            {filteredTestimonials?.map((testimonial: Testimonial) => (
              moderationMode ? (
                <ModerationTestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  isSelected={selectedIds.includes(testimonial.id)}
                  onToggleSelect={toggleSelection}
                  loadingAction={loadingState?.id === testimonial.id ? loadingState.action : null}
                />
              ) : (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onDelete={handleDelete}
                />
              )
            ))}
          </div>

          {/* Fixed Bottom Bulk Actions Bar - Only show in moderation mode */}
          {moderationMode && selectedIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 slide-out-to-bottom-4 w-[90%] max-w-3xl">
              <Card className="shadow-2xl border-2">
                <CardContent className="px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-base font-semibold w-12"
                      >
                        {selectedIds.length}
                      </Badge>
                      <span className="text-sm font-medium">selected</span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2 flex-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1">
                              <Button
                                onClick={handleBulkApprove}
                                disabled={
                                  bulkModerationMutation.isPending ||
                                  validForApprove.length === 0
                                }
                                size="sm"
                                variant="default"
                                className="bg-green-500 hover:bg-green-600 w-full flex items-center justify-center gap-2"
                              >
                                <div className="flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve
                                  {validForApprove.length > 0 &&
                                    validForApprove.length < selectedIds.length && (
                                      <span className="ml-1 text-xs opacity-75">
                                        ({validForApprove.length})
                                      </span>
                                    )}
                                </div>
                                <KeyboardShortcutBadge shortcut="A" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {validForApprove.length === 0 && (
                            <TooltipContent>
                              <p className="text-xs">
                                All selected testimonials are already approved
                              </p>
                            </TooltipContent>
                          )}
                          {validForApprove.length > 0 &&
                            validForApprove.length < selectedIds.length && (
                              <TooltipContent>
                                <p className="text-xs">
                                  {validForApprove.length} can be approved,{" "}
                                  {selectedIds.length - validForApprove.length}{" "}
                                  already approved
                                </p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1">
                              <Button
                                onClick={handleBulkFlag}
                                disabled={
                                  bulkModerationMutation.isPending ||
                                  validForFlag.length === 0
                                }
                                size="sm"
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-2"
                              >
                                <div className="flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Flag
                                  {validForFlag.length > 0 &&
                                    validForFlag.length < selectedIds.length && (
                                      <span className="ml-1 text-xs opacity-75">
                                        ({validForFlag.length})
                                      </span>
                                    )}
                                </div>
                                <KeyboardShortcutBadge shortcut="F" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {validForFlag.length === 0 && (
                            <TooltipContent>
                              <p className="text-xs">
                                All selected testimonials are already flagged
                              </p>
                            </TooltipContent>
                          )}
                          {validForFlag.length > 0 &&
                            validForFlag.length < selectedIds.length && (
                              <TooltipContent>
                                <p className="text-xs">
                                  {validForFlag.length} can be flagged,{" "}
                                  {selectedIds.length - validForFlag.length}{" "}
                                  already flagged
                                </p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1">
                              <Button
                                onClick={handleBulkReject}
                                disabled={
                                  bulkModerationMutation.isPending ||
                                  validForReject.length === 0
                                }
                                size="sm"
                                variant="destructive"
                                className="w-full flex items-center justify-center gap-2"
                              >
                                <div className="flex items-center">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                  {validForReject.length > 0 &&
                                    validForReject.length < selectedIds.length && (
                                      <span className="ml-1 text-xs opacity-75">
                                        ({validForReject.length})
                                      </span>
                                    )}
                                </div>
                                <KeyboardShortcutBadge shortcut="R" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {validForReject.length === 0 && (
                            <TooltipContent>
                              <p className="text-xs">
                                All selected testimonials are already rejected
                              </p>
                            </TooltipContent>
                          )}
                          {validForReject.length > 0 &&
                            validForReject.length < selectedIds.length && (
                              <TooltipContent>
                                <p className="text-xs">
                                  {validForReject.length} can be rejected,{" "}
                                  {selectedIds.length - validForReject.length}{" "}
                                  already rejected
                                </p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <Button
                      onClick={() => setSelectedIds([])}
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-2"
                    >
                      Clear
                      <KeyboardShortcutBadge shortcut="X" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
