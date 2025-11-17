/**
 * Unit tests for RateLimiter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000, // 1 second for faster tests
    });
    vi.useFakeTimers();
  });

  it('should allow requests under the limit', () => {
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.getRequestCount('widget-1')).toBe(3);
  });

  it('should block requests over the limit', () => {
    // Make 5 requests (at the limit)
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    }

    // 6th request should be blocked
    expect(rateLimiter.isAllowed('widget-1')).toBe(false);
    expect(rateLimiter.getRequestCount('widget-1')).toBe(5);
  });

  it('should allow requests after window expires', () => {
    // Make 5 requests (at the limit)
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    }

    // 6th request should be blocked
    expect(rateLimiter.isAllowed('widget-1')).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(1100);

    // Should allow requests again
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
  });

  it('should track separate limits for different keys', () => {
    // Widget 1: make 5 requests
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    }
    expect(rateLimiter.isAllowed('widget-1')).toBe(false);

    // Widget 2: should still be allowed
    expect(rateLimiter.isAllowed('widget-2')).toBe(true);
    expect(rateLimiter.getRequestCount('widget-2')).toBe(1);
  });

  it('should calculate correct retry-after time', () => {
    const startTime = Date.now();
    vi.setSystemTime(startTime);

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.isAllowed('widget-1');
    }

    // Get retry-after time
    const retryAfter = rateLimiter.getRetryAfter('widget-1');

    // Should be approximately 1000ms (window duration)
    expect(retryAfter).toBeGreaterThan(900);
    expect(retryAfter).toBeLessThanOrEqual(1000);
  });

  it('should return 0 retry-after when under limit', () => {
    rateLimiter.isAllowed('widget-1');
    expect(rateLimiter.getRetryAfter('widget-1')).toBe(0);
  });

  it('should reset rate limit for specific key', () => {
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.isAllowed('widget-1');
    }
    expect(rateLimiter.isAllowed('widget-1')).toBe(false);

    // Reset
    rateLimiter.reset('widget-1');

    // Should allow requests again
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
  });

  it('should reset all rate limits', () => {
    // Make requests for multiple widgets
    for (let i = 0; i < 5; i++) {
      rateLimiter.isAllowed('widget-1');
      rateLimiter.isAllowed('widget-2');
    }

    expect(rateLimiter.isAllowed('widget-1')).toBe(false);
    expect(rateLimiter.isAllowed('widget-2')).toBe(false);

    // Reset all
    rateLimiter.resetAll();

    // Both should allow requests again
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.isAllowed('widget-2')).toBe(true);
  });

  it('should use sliding window algorithm', () => {
    const startTime = Date.now();
    vi.setSystemTime(startTime);

    // Make 3 requests at t=0
    for (let i = 0; i < 3; i++) {
      rateLimiter.isAllowed('widget-1');
    }

    // Advance 600ms
    vi.advanceTimersByTime(600);

    // Make 2 more requests at t=600 (total 5)
    for (let i = 0; i < 2; i++) {
      rateLimiter.isAllowed('widget-1');
    }

    // Should be at limit
    expect(rateLimiter.isAllowed('widget-1')).toBe(false);

    // Advance another 500ms (t=1100, first 3 requests expired)
    vi.advanceTimersByTime(500);

    // Should allow 3 more requests (only 2 from t=600 remain in window)
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.isAllowed('widget-1')).toBe(true);
    expect(rateLimiter.isAllowed('widget-1')).toBe(false);
  });

  it('should update configuration', () => {
    rateLimiter.updateConfig({ maxRequests: 10 });
    const config = rateLimiter.getConfig();
    expect(config.maxRequests).toBe(10);
  });
});
