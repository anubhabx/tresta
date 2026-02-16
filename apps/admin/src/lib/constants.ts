/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  METRICS: '/admin/metrics',
  HEALTH: '/readyz',
  DLQ: '/admin/dlq',
  USERS: '/admin/users',
  BILLING_OVERVIEW: '/admin/billing/overview',
  BILLING_RECORDS: '/admin/billing/records',
  PROJECTS: '/admin/projects',
  TESTIMONIALS: '/admin/testimonials',
  SETTINGS: '/admin/settings',
  AUDIT_LOGS: '/admin/audit-logs',
  SESSIONS: '/admin/sessions',
  ALERTS: '/admin/alerts',
  ERRORS: '/admin/errors',
} as const;

/**
 * Query keys for React Query
 */
export const QUERY_KEYS = {
  METRICS: ['metrics'],
  HEALTH: ['health'],
  DLQ: ['dlq'],
  USERS: ['users'],
  BILLING_OVERVIEW: ['billing-overview'],
  BILLING_RECORDS: ['billing-records'],
  PROJECTS: ['projects'],
  TESTIMONIALS: ['testimonials'],
  SETTINGS: ['settings'],
  AUDIT_LOGS: ['audit-logs'],
  SESSIONS: ['sessions'],
  ALERTS: ['alerts'],
  ERRORS: ['errors'],
} as const;

/**
 * Refetch intervals (in milliseconds)
 */
export const REFETCH_INTERVALS = {
  METRICS: 60000, // 1 minute
  HEALTH: 30000, // 30 seconds
  REAL_TIME: 5000, // 5 seconds
  SLOW: 300000, // 5 minutes
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
} as const;
