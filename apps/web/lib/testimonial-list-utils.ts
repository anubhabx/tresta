import type { Testimonial, ModerationStatus } from "@/types/api";

export type FilterStatus = "all" | "pending" | "approved" | "published";
export type ModerationFilter =
  | "all"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "FLAGGED";

export interface BulkActionHistory {
  id: string;
  timestamp: Date;
  testimonialIds: string[];
  action: "approve" | "reject" | "flag";
  previousStatuses: Map<string, ModerationStatus>;
  count: number;
}

export interface StatusCounts {
  pending: number;
  approved: number;
  published: number;
}

export interface ModerationCounts {
  pending: number;
  approved: number;
  flagged: number;
  rejected: number;
}

export interface ModerationStats {
  pending: number;
  flagged: number;
  approved: number;
  rejected: number;
  oauthVerified: number;
  autoModerated: number;
  all: number;
  needsReview: number;
  highRisk: number;
  verified: number;
}

/**
 * Canonical status helpers
 * Moderation workflow should be derived from moderationStatus first.
 */
export function isModerationApproved(testimonial: Testimonial): boolean {
  return testimonial.moderationStatus === "APPROVED" || testimonial.isApproved;
}

export function isModerationPending(testimonial: Testimonial): boolean {
  return testimonial.moderationStatus === "PENDING" || !isModerationApproved(testimonial);
}

export function matchesFilterStatus(
  testimonial: Testimonial,
  filterStatus: FilterStatus,
): boolean {
  if (filterStatus === "all") return true;
  if (filterStatus === "published") return testimonial.isPublished;
  if (filterStatus === "approved") {
    return isModerationApproved(testimonial) && !testimonial.isPublished;
  }
  if (filterStatus === "pending") {
    return isModerationPending(testimonial);
  }

  return true;
}

/**
 * Calculate status counts from testimonials array
 */
export function getStatusCounts(testimonials: Testimonial[]): StatusCounts {
  return {
    pending: testimonials.filter((t) => isModerationPending(t)).length,
    approved: testimonials.filter((t) => isModerationApproved(t) && !t.isPublished).length,
    published: testimonials.filter((t) => t.isPublished).length,
  };
}

/**
 * Calculate moderation status counts from testimonials array
 */
export function getModerationCounts(
  testimonials: Testimonial[],
): ModerationCounts {
  return {
    pending: testimonials.filter((t) => t.moderationStatus === "PENDING")
      .length,
    approved: testimonials.filter((t) => t.moderationStatus === "APPROVED")
      .length,
    flagged: testimonials.filter((t) => t.moderationStatus === "FLAGGED")
      .length,
    rejected: testimonials.filter((t) => t.moderationStatus === "REJECTED")
      .length,
  };
}

/**
 * Calculate comprehensive moderation statistics
 */
export function calculateModerationStats(
  testimonials: Testimonial[],
): ModerationStats {
  const pending = testimonials.filter(
    (t) => t.moderationStatus === "PENDING",
  ).length;
  const flagged = testimonials.filter(
    (t) => t.moderationStatus === "FLAGGED",
  ).length;
  const approved = testimonials.filter(
    (t) => t.moderationStatus === "APPROVED",
  ).length;
  const rejected = testimonials.filter(
    (t) => t.moderationStatus === "REJECTED",
  ).length;
  const oauthVerified = testimonials.filter((t) => t.isOAuthVerified).length;
  const autoModerated = testimonials.filter((t) => t.autoPublished).length;
  const needsReview = pending + flagged;
  const highRisk = testimonials.filter(
    (t) => (t.moderationScore ?? 0) >= 0.7,
  ).length;

  return {
    pending,
    flagged,
    approved,
    rejected,
    oauthVerified,
    autoModerated,
    all: testimonials.length,
    needsReview,
    highRisk,
    verified: oauthVerified,
  };
}

/**
 * Get valid testimonials for a specific bulk action
 */
export function getValidTestimonialsForAction(
  testimonials: Testimonial[],
  selectedIds: string[],
  action: "approve" | "reject" | "flag",
): Testimonial[] {
  const selected = testimonials.filter((t) => selectedIds.includes(t.id));

  switch (action) {
    case "approve":
      return selected.filter((t) => t.moderationStatus !== "APPROVED");
    case "reject":
      return selected.filter((t) => t.moderationStatus !== "REJECTED");
    case "flag":
      return selected.filter((t) => t.moderationStatus !== "FLAGGED");
    default:
      return selected;
  }
}

/**
 * Create a new bulk action history entry
 */
export function createActionHistoryEntry(
  action: Omit<BulkActionHistory, "id" | "timestamp">,
): BulkActionHistory {
  return {
    ...action,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
  };
}

/**
 * Add action to history and trim to max size
 */
export function addToActionHistory(
  history: BulkActionHistory[],
  action: Omit<BulkActionHistory, "id" | "timestamp">,
  maxSize: number = 10,
): { history: BulkActionHistory[]; actionId: string } {
  const newAction = createActionHistoryEntry(action);
  const updated = [newAction, ...history].slice(0, maxSize);
  return { history: updated, actionId: newAction.id };
}
