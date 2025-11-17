/**
 * API Client with retry logic, rate limiting, and error handling
 */

import { WidgetError, WidgetErrorCode } from '../types';
import type { WidgetData } from '../types';
import { NetworkClient } from './network';
import { retry } from './retry';
import { RateLimiter } from './rate-limiter';
import type { APIClientConfig } from './types';
import { Logger } from '../utils/logger';

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
  private apiKey: string | undefined;
  private logger: Logger | null = null;

  constructor(config: Partial<APIClientConfig> = {}, apiKey?: string, logger?: Logger) {
    this.config = { ...DEFAULT_API_CLIENT_CONFIG, ...config };
    this.networkClient = new NetworkClient();
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000, // 100 requests per minute
    });
    this.apiKey = apiKey;
    this.logger = logger || null;
  }

  /**
   * Fetch widget data from the API
   */
  async fetchWidgetData(widgetId: string): Promise<WidgetData> {
    // Check if API key is provided
    if (!this.apiKey) {
      throw new WidgetError(
        WidgetErrorCode.UNAUTHORIZED,
        'API key is required. Please provide an API key.',
        false
      );
    }

    // Check rate limit
    if (!this.rateLimiter.isAllowed(widgetId)) {
      const retryAfter = this.rateLimiter.getRetryAfter(widgetId);
      const message = `Rate limit exceeded for widget ${widgetId}. Retry after ${Math.ceil(retryAfter / 1000)}s`;
      if (this.logger) {
        this.logger.warn(message);
      } else {
        console.warn(`[TrestaWidget] ${message}`);
      }
      throw new WidgetError(
        WidgetErrorCode.RATE_LIMITED,
        `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 1000)} seconds.`,
        true
      );
    }

    // Fetch with retry logic
    return retry(
      async () => {
        const url = `${this.config.baseURL}/api/widgets/${widgetId}/public`;

        if (this.logger) {
          this.logger.debug(`Fetching widget data from: ${url}`);
          this.logger.debug(`Using API key: ${this.apiKey?.substring(0, 15)}...`);
        }

        try {
          const response = await this.networkClient.request<any>(url, {
            method: 'GET',
            timeout: this.config.timeout,
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (this.logger) {
            this.logger.debug('Received response:', response.status);
          }

          // Handle HTTP status codes and transform response
          const rawData = this.handleResponse(response, widgetId);

          // Transform the API response to match WidgetData interface
          return this.transformApiResponse(rawData);
        } catch (error) {
          // Re-throw WidgetErrors as-is
          if (error instanceof WidgetError) {
            throw error;
          }

          // Wrap unknown errors
          const errorMessage = `Unexpected error for widget ${widgetId}:`;
          if (this.logger) {
            this.logger.error(errorMessage, error);
          } else {
            console.error(`[TrestaWidget] ${errorMessage}`, error);
          }
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
   * Transform API response to WidgetData format
   */
  private transformApiResponse(apiResponse: any): WidgetData {
    if (this.logger) {
      this.logger.debug('Raw API response:', apiResponse);
    }
    
    // Handle both direct data and wrapped response formats
    const data = apiResponse.data || apiResponse;

    if (!data || !data.widget) {
      const errorDetails = { hasData: !!data, hasWidget: !!(data?.widget) };
      if (this.logger) {
        this.logger.error('Invalid API response structure:', errorDetails);
      } else {
        console.error('[TrestaWidget] Invalid API response structure:', errorDetails);
      }
      throw new WidgetError(
        WidgetErrorCode.PARSE_ERROR,
        'Invalid API response format',
        false
      );
    }

    if (this.logger) {
      this.logger.debug('Transforming widget data:', {
        widgetId: data.widget.id,
        testimonialCount: data.testimonials?.length || 0,
      });
    }

    // Transform to WidgetData format
    return {
      widgetId: data.widget.id,
      config: {
        layout: {
          type: data.widget.layout || 'grid',
          maxTestimonials: data.widget.settings?.maxTestimonials,
          autoRotate: data.widget.settings?.autoRotate,
          rotateInterval: data.widget.settings?.rotateInterval,
          showNavigation: true,
          columns: data.widget.settings?.columns,
        },
        theme: {
          mode: data.widget.settings?.theme || 'light',
          primaryColor: data.widget.theme?.primaryColor || '#0066FF',
          secondaryColor: data.widget.theme?.secondaryColor || '#00CC99',
          fontFamily: data.widget.settings?.fontFamily,
          cardStyle: data.widget.settings?.cardStyle || 'default',
        },
        display: {
          showRating: data.widget.settings?.showRating ?? true,
          showDate: data.widget.settings?.showDate ?? true,
          showAvatar: data.widget.settings?.showAvatar ?? true,
          showAuthorRole: data.widget.settings?.showAuthorRole ?? true,
          showAuthorCompany: data.widget.settings?.showAuthorCompany ?? true,
          maxTestimonials: data.widget.settings?.maxTestimonials,
        },
      },
      testimonials: (data.testimonials || []).map((t: any) => ({
        id: t.id,
        content: t.content,
        rating: t.rating,
        createdAt: t.createdAt,
        isPublished: true,
        isApproved: true,
        isOAuthVerified: t.isOAuthVerified || false,
        oauthProvider: t.oauthProvider,
        author: {
          name: t.authorName,
          email: undefined, // Never expose email
          avatar: t.authorAvatar,
          role: t.authorRole,
          company: t.authorCompany,
        },
        media: t.videoUrl ? {
          type: 'video' as const,
          url: t.videoUrl,
        } : undefined,
      })),
    };
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
      case 403: {
        const message = `Unauthorized access for widget ${widgetId} (${status})`;
        if (this.logger) {
          this.logger.error(message);
        } else {
          console.error(`[TrestaWidget] ${message}`);
        }
        throw new WidgetError(
          WidgetErrorCode.UNAUTHORIZED,
          'Unable to load testimonials. Please check your widget configuration.',
          false // Not recoverable
        );
      }

      case 404: {
        const message = `Widget ${widgetId} not found (404)`;
        if (this.logger) {
          this.logger.error(message);
        } else {
          console.error(`[TrestaWidget] ${message}`);
        }
        throw new WidgetError(
          WidgetErrorCode.INVALID_WIDGET_ID,
          'Widget not found. Please check your widget ID.',
          false // Not recoverable
        );
      }

      case 429: {
        // Rate limited by server
        const retryAfterHeader = headers.get('Retry-After');
        const retryAfter = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : 60000; // Default to 60 seconds

        const message = `Server rate limit for widget ${widgetId}. Retry after ${retryAfter / 1000}s`;
        if (this.logger) {
          this.logger.warn(message);
        } else {
          console.warn(`[TrestaWidget] ${message}`);
        }

        throw new WidgetError(
          WidgetErrorCode.RATE_LIMITED,
          `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 1000)} seconds.`,
          true // Recoverable with retry
        );
      }

      case 500:
      case 502:
      case 503:
      case 504: {
        const message = `Server error for widget ${widgetId} (${status})`;
        if (this.logger) {
          this.logger.error(message);
        } else {
          console.error(`[TrestaWidget] ${message}`);
        }
        throw new WidgetError(
          WidgetErrorCode.API_ERROR,
          'Server error. Please try again later.',
          true // Recoverable with retry
        );
      }

      default: {
        const message = `Unexpected status code ${status} for widget ${widgetId}`;
        if (this.logger) {
          this.logger.error(message);
        } else {
          console.error(`[TrestaWidget] ${message}`);
        }
        throw new WidgetError(
          WidgetErrorCode.API_ERROR,
          `Unexpected error (${status}). Please try again later.`,
          status >= 500 // 5xx errors are recoverable
        );
      }
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
