/**
 * Centralized Redis key constants and TTLs
 * All keys use 'tresta:' namespace prefix to prevent collisions
 */
export const REDIS_KEYS = {
  // Email quota
  EMAIL_QUOTA: (date: string) => `tresta:email:quota:${date}`,
  EMAIL_QUOTA_LOCKED: 'tresta:email:quota:locked',
  EMAIL_QUOTA_NEXT_RETRY: 'tresta:email:quota:nextRetry',
  
  // Locks
  LOCK_DIGEST: 'tresta:lock:digest:running',
  
  // Ably
  ABLY_CONNECTIONS: 'tresta:ably:connections:count',
  
  // Rate limiting
  RATELIMIT_API: (userId: string) => `tresta:ratelimit:api:notifications:${userId}`,
  RATELIMIT_EMAIL: (userId: string) => `tresta:ratelimit:email:${userId}`,
  
  // Metrics
  METRICS_NOTIFICATIONS_SENT: 'tresta:metrics:notifications:sent',
  METRICS_EMAILS_SENT: 'tresta:metrics:emails:sent',
  METRICS_EMAILS_DEFERRED: 'tresta:metrics:emails:deferred',
  METRICS_EMAILS_FAILED: 'tresta:metrics:emails:failed',
  METRICS_ABLY_CONNECTIONS: 'tresta:metrics:ably:connections',
  
  // Idempotency
  IDEMPOTENCY: (webhookId: string, eventType: string) => 
    `tresta:idempotency:${webhookId}:${eventType}`,
} as const;

/**
 * TTL constants in seconds
 */
export const REDIS_TTL = {
  EMAIL_QUOTA: 'midnight_utc', // Calculated dynamically
  EMAIL_QUOTA_LOCK: 3600, // 1 hour
  DIGEST_LOCK: 3600, // 1 hour
  METRICS: 604800, // 7 days
  IDEMPOTENCY: 86400, // 24 hours
  RATELIMIT_API: 60, // 1 minute
  RATELIMIT_EMAIL: 3600, // 1 hour
} as const;

/**
 * Calculate TTL to midnight UTC
 * Returns the number of seconds until the next midnight UTC
 * 
 * @returns TTL in seconds
 * 
 * @example
 * // If current time is 2025-11-11 14:30:00 UTC
 * // Returns seconds until 2025-11-12 00:00:00 UTC
 * const ttl = getTTLToMidnightUTC(); // ~34200 seconds (9.5 hours)
 */
export function getTTLToMidnightUTC(): number {
  const now = new Date();
  const tomorrow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  );
  return Math.floor((tomorrow - Date.now()) / 1000);
}

/**
 * Get current date in YYYY-MM-DD format (UTC timezone)
 * Used for email quota keys
 * 
 * @returns Date string in YYYY-MM-DD format
 * 
 * @example
 * getCurrentDateUTC(); // "2025-11-11"
 */
export function getCurrentDateUTC(): string {
  return new Date().toISOString().split('T')[0] as string;
}
