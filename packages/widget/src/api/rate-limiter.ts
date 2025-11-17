/**
 * Rate limiter for client-side throttling
 * Implements 100 requests per minute per widgetId
 */

export interface RateLimiterConfig {
  maxRequests: number; // Maximum requests per window
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};

interface RequestRecord {
  timestamps: number[];
}

/**
 * Rate limiter using sliding window algorithm
 */
export class RateLimiter {
  private config: RateLimiterConfig;
  private records: Map<string, RequestRecord> = new Map();

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_RATE_LIMITER_CONFIG, ...config };
  }

  /**
   * Check if a request is allowed for the given key (widgetId)
   * Returns true if allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.getOrCreateRecord(key);

    // Remove timestamps outside the current window
    record.timestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    // Check if we're under the limit
    if (record.timestamps.length < this.config.maxRequests) {
      record.timestamps.push(now);
      return true;
    }

    return false;
  }

  /**
   * Get the time until the next request is allowed (in milliseconds)
   * Returns 0 if a request is currently allowed
   */
  getRetryAfter(key: string): number {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || record.timestamps.length === 0) {
      return 0;
    }

    // Remove timestamps outside the current window
    record.timestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    // If we're under the limit, no wait needed
    if (record.timestamps.length < this.config.maxRequests) {
      return 0;
    }

    // Calculate when the oldest request will expire
    const oldestTimestamp = record.timestamps[0];
    if (!oldestTimestamp) {
      return 0;
    }
    
    const retryAfter = oldestTimestamp + this.config.windowMs - now;

    return Math.max(0, retryAfter);
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.records.clear();
  }

  /**
   * Get current request count for a key
   */
  getRequestCount(key: string): number {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record) {
      return 0;
    }

    // Filter to only count requests in current window
    const validTimestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    return validTimestamps.length;
  }

  /**
   * Get or create a record for a key
   */
  private getOrCreateRecord(key: string): RequestRecord {
    let record = this.records.get(key);

    if (!record) {
      record = { timestamps: [] };
      this.records.set(key, record);
    }

    return record;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimiterConfig {
    return { ...this.config };
  }
}
