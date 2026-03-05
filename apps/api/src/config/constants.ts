export const API_KEY_LIMITS = {
  nameMinLength: 3,
  nameMaxLength: 255,
  rateLimitMin: 1,
  rateLimitMax: 10_000,
  defaultRateLimit: 100,
} as const;

export const WIDGET_LIMITS = {
  maxMvpTestimonials: 20,
  minRotateIntervalMs: 2_000,
  maxRotateIntervalMs: 10_000,
} as const;

export const EMAIL_LIMITS = {
  dailyQuota: 200,
  snapshotInterval: 10,
} as const;

export const FALLBACK_PLAN_LIMITS = {
  projects: 1,
  widgets: 1,
  testimonials: 10,
  teamMembers: 1,
} as const;

/**
 * Static plan limits keyed by UserPlan enum.
 * Source of truth for server-side enforcement — mirrors pricing.ts on the client.
 * -1 = unlimited.
 */
export const PLAN_LIMITS: Record<"FREE" | "PRO", Record<string, number>> = {
  FREE: {
    projects: 1,
    widgets: 1,
    testimonials: 10,
    teamMembers: 1,
  },
  PRO: {
    projects: -1,
    widgets: -1,
    testimonials: -1,
    teamMembers: -1,
  },
};
