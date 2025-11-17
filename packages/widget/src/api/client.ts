/**
 * API Client with retry logic, rate limiting, and error handling
 */

import { WidgetError, WidgetErrorCode } from '../types';
import type { WidgetData } from '../types';
import { NetworkClient } from './network';
import { retry } from './retry';
import { RateLimiter } from './rate-limiter';
import type { APIClientConfig } from './types';

const DEFAULT_API_CLIENT_CONFIG: APIClientConfig = {
  baseURL: 'https://api.tresta.com',
  timeout: 10000, // 10 seconds
  maxRetries: 3,
};

/**
 * API Client for fetching widget data
 */
export class APIClient {
  private config: APIClientConfig;
  private networkClient: NetworkClient;
  private rateLimiter: RateLimiter;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...DEFAULT_API_CLIENT_CONFIG, ...config };
    this.networkClient = new NetworkClient();
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000, // 100 requests per minute
    });
  }

  /**
   * Fetch widget data from the API
   */
  async fetchWidgetData(widgetId: string): Promise<WidgetData> {
    // Check rate limit
    if (!this.rateLimiter.isAllowed(widgetId)) {
      const retryAfter = this.rateLimiter.getRetryAfter(widgetId);
      console.warn(
        `[TrestaWidget] Rate limit exceeded for widget ${widgetId}. Retry after ${Math.ceil(retryAfter / 1000)}s`
      );
      throw new WidgetError(
        WidgetErrorCode.RATE_LIMITED,
        `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 1000)} seconds.`,
        true
      );
    }

    // Fetch with retry logic
    return retry(
      async () => {
        const url = `${this.config.baseURL}/api/widget/${widgetId}/data`;

        try {
          const response = await this.networkClient.request<WidgetData>(url, {
            method: 'GET',
            timeout: this.config.timeout,
          });

          // Handle HTTP status codes
          return this.handleResponse(response, widgetId);
        } catch (error) {
          // Re-throw WidgetErrors as-is
          if (error instanceof WidgetError) {
            throw error;
          }

          // Wrap unknown errors
          console.error(`[TrestaWidget] Unexpected error for widget ${widgetId}:`, error);
          throw new WidgetError(
            WidgetErrorCode.API_ERROR,
            'An unexpected error occurred while fetching widget data',
            true
          );
        }
      },
      { maxRetries: this.config.maxRetries }
    );
  }

  /**
   * Handle API response based on status code
   */
  private handleResponse<T>(
    response: { data: T; status: number; headers: Headers },
    widgetId: string
  ): T {
    const { data, status, headers } = response;

    // Success responses (2xx)
    if (status >= 200 && status < 300) {
      return data;
    }

    // Handle specific error status codes
    switch (status) {
      case 401:
      case 403:
        console.error(
          `[TrestaWidget] Unauthorized access for widget ${widgetId} (${status})`
        );
        throw new WidgetError(
          WidgetErrorCode.UNAUTHORIZED,
          'Unable to load testimonials. Please check your widget configuration.',
          false // Not recoverable
        );

      case 404:
        console.error(`[TrestaWidget] Widget ${widgetId} not found (404)`);
        throw new WidgetError(
          WidgetErrorCode.INVALID_WIDGET_ID,
          'Widget not found. Please check your widget ID.',
          false // Not recoverable
        );

      case 429: {
        // Rate limited by server
        const retryAfterHeader = headers.get('Retry-After');
        const retryAfter = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : 60000; // Default to 60 seconds

        console.warn(
          `[TrestaWidget] Server rate limit for widget ${widgetId}. Retry after ${retryAfter / 1000}s`
        );

        throw new WidgetError(
          WidgetErrorCode.RATE_LIMITED,
          `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 1000)} seconds.`,
          true // Recoverable with retry
        );
      }

      case 500:
      case 502:
      case 503:
      case 504:
        console.error(
          `[TrestaWidget] Server error for widget ${widgetId} (${status})`
        );
        throw new WidgetError(
          WidgetErrorCode.API_ERROR,
          'Server error. Please try again later.',
          true // Recoverable with retry
        );

      default:
        console.error(
          `[TrestaWidget] Unexpected status code ${status} for widget ${widgetId}`
        );
        throw new WidgetError(
          WidgetErrorCode.API_ERROR,
          `Unexpected error (${status}). Please try again later.`,
          status >= 500 // 5xx errors are recoverable
        );
    }
  }

  /**
   * Get the network client (for testing/advanced usage)
   */
  getNetworkClient(): NetworkClient {
    return this.networkClient;
  }

  /**
   * Get the rate limiter (for testing/advanced usage)
   */
  getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): APIClientConfig {
    return { ...this.config };
  }
}
