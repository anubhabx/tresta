/**
 * Retry logic with exponential backoff and jitter
 */

import { WidgetError, WidgetErrorCode } from '../types/index.js';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  jitter: number; // Jitter in milliseconds
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  jitter: 1000, // 1 second
};

/**
 * Calculate delay with exponential backoff and jitter
 * Formula: delay = base * 2^attempt + random(0, jitter)
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * config.jitter;
  const delay = Math.min(exponentialDelay + jitter, config.maxDelay);
  return delay;
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof WidgetError) {
    // Only retry if the error is marked as recoverable
    // Retryable error codes: API_TIMEOUT, NETWORK_ERROR, API_ERROR
    // Note: RATE_LIMITED is NOT retried - it should fail immediately
    const retryableCodes = [
      WidgetErrorCode.API_TIMEOUT,
      WidgetErrorCode.NETWORK_ERROR,
      WidgetErrorCode.API_ERROR,
    ];
    return error.recoverable && retryableCodes.includes(error.code);
  }
  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!isRetryableError(error)) {
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt === retryConfig.maxRetries - 1) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, retryConfig);

      if (error instanceof WidgetError) {
        console.warn(
          `[TrestaWidget] Request failed (attempt ${attempt + 1}/${retryConfig.maxRetries}): ${error.message}. Retrying in ${Math.round(delay)}ms...`
        );
      }

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

