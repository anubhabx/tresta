/**
 * Unit tests for APIClient
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIClient } from '../client';
import { WidgetError, WidgetErrorCode } from '../../types';
import type { WidgetData } from '../../types';

// Mock the network client
vi.mock('../network', () => {
  const mockRequest = vi.fn();
  return {
    NetworkClient: class MockNetworkClient {
      request = mockRequest;
      addRequestInterceptor = vi.fn();
      addResponseInterceptor = vi.fn();
    },
  };
});

describe('APIClient', () => {
  let apiClient: APIClient;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const mockWidgetData: WidgetData = {
    widgetId: 'test-widget-123',
    config: {
      layout: {
        type: 'grid',
        maxTestimonials: 10,
      },
      theme: {
        mode: 'light',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        cardStyle: 'default',
      },
      display: {
        showRating: true,
        showDate: true,
        showAvatar: true,
        showAuthorRole: true,
        showAuthorCompany: true,
      },
    },
    testimonials: [
      {
        id: '1',
        content: 'Great product!',
        rating: 5,
        createdAt: '2025-01-01T00:00:00Z',
        isPublished: true,
        isApproved: true,
        isOAuthVerified: true,
        oauthProvider: 'google',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://example.com/avatar.jpg',
          role: 'CEO',
          company: 'Acme Inc',
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient = new APIClient({
      baseURL: 'https://api.tresta.com',
      timeout: 10000,
      maxRetries: 3,
    }, 'test-api-key-123');
    mockRequest = apiClient.getNetworkClient().request as ReturnType<typeof vi.fn>;
  });

  describe('fetchWidgetData', () => {
    it('should successfully fetch widget data', async () => {
      // Mock the new API response format
      const apiResponse = {
        success: true,
        message: 'Widget data fetched successfully',
        data: {
          widget: {
            id: 'test-widget-123',
            layout: 'grid',
            theme: {
              primaryColor: '#007bff',
              secondaryColor: '#6c757d',
            },
            settings: {
              maxTestimonials: 10,
              showRating: true,
              showDate: true,
              showAvatar: true,
              showAuthorRole: true,
              showAuthorCompany: true,
              theme: 'light',
              cardStyle: 'default',
            },
          },
          testimonials: [
            {
              id: '1',
              content: 'Great product!',
              rating: 5,
              createdAt: '2025-01-01T00:00:00Z',
              isOAuthVerified: true,
              oauthProvider: 'google',
              authorName: 'John Doe',
              authorAvatar: 'https://example.com/avatar.jpg',
              authorRole: 'CEO',
              authorCompany: 'Acme Inc',
            },
          ],
        },
      };

      mockRequest.mockResolvedValue({
        data: apiResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await apiClient.fetchWidgetData('test-widget-123');

      expect(result.widgetId).toBe('test-widget-123');
      expect(result.testimonials).toHaveLength(1);
      expect(mockRequest).toHaveBeenCalledWith(
        'https://api.tresta.com/api/widgets/test-widget-123/public',
        expect.objectContaining({
          method: 'GET',
          timeout: 10000,
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key-123',
          }),
        })
      );
    });

    it('should handle 401 unauthorized error', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 401,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-widget-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-widget-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.UNAUTHORIZED);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should handle 403 forbidden error', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 403,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-widget-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-widget-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.UNAUTHORIZED);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should handle 404 not found error', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 404,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('invalid-widget')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('invalid-widget');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.INVALID_WIDGET_ID);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should handle 429 rate limit with Retry-After header', async () => {
      const headers = new Headers();
      headers.set('Retry-After', '30');

      mockRequest.mockResolvedValue({
        data: null,
        status: 429,
        headers,
      });

      // 429 errors should not retry - they should fail immediately
      await expect(apiClient.fetchWidgetData('test-widget-123')).rejects.toThrow(
        WidgetError
      );

      // Should only be called once (no retries for rate limit)
      expect(mockRequest).toHaveBeenCalledTimes(1);

      try {
        await apiClient.fetchWidgetData('test-widget-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.RATE_LIMITED);
        expect((error as WidgetError).recoverable).toBe(true);
        expect((error as WidgetError).message).toContain('30 seconds');
      }
    });

    it('should handle 429 rate limit without Retry-After header', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 429,
        headers: new Headers(),
      });

      // 429 errors should not retry - they should fail immediately
      await expect(apiClient.fetchWidgetData('test-widget-123')).rejects.toThrow(
        WidgetError
      );

      // Should only be called once (no retries for rate limit)
      expect(mockRequest).toHaveBeenCalledTimes(1);

      try {
        await apiClient.fetchWidgetData('test-widget-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.RATE_LIMITED);
        expect((error as WidgetError).message).toContain('60 seconds');
      }
    });

    it('should handle 500 server error', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 500,
        headers: new Headers(),
      });

      const promise = apiClient.fetchWidgetData('test-widget-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
      expect(error.recoverable).toBe(true);
    });

    it('should handle 502 bad gateway error', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 502,
        headers: new Headers(),
      });

      const promise = apiClient.fetchWidgetData('test-widget-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
      expect(error.recoverable).toBe(true);
    });

    it('should handle 503 service unavailable error', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 503,
        headers: new Headers(),
      });

      const promise = apiClient.fetchWidgetData('test-widget-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
      expect(error.recoverable).toBe(true);
    });

    it('should handle client-side rate limiting', async () => {
      const rateLimiter = apiClient.getRateLimiter();

      // Configure for 2 requests per window for testing
      rateLimiter.updateConfig({ maxRequests: 2, windowMs: 60000 });

      // Mock API response format matching the actual API
      const apiResponse = {
        success: true,
        message: 'Widget data fetched successfully',
        data: {
          widget: {
            id: 'test-widget-123',
            layout: 'grid',
            theme: {
              primaryColor: '#007bff',
              secondaryColor: '#6c757d',
            },
            settings: {
              maxTestimonials: 10,
              showRating: true,
              showDate: true,
              showAvatar: true,
              showAuthorRole: true,
              showAuthorCompany: true,
              theme: 'light',
              cardStyle: 'default',
            },
          },
          testimonials: [
            {
              id: '1',
              content: 'Great product!',
              rating: 5,
              createdAt: '2025-01-01T00:00:00Z',
              isOAuthVerified: true,
              oauthProvider: 'google',
              authorName: 'John Doe',
              authorAvatar: 'https://example.com/avatar.jpg',
              authorRole: 'CEO',
              authorCompany: 'Acme Inc',
            },
          ],
        },
      };

      mockRequest.mockResolvedValue({
        data: apiResponse,
        status: 200,
        headers: new Headers(),
      });

      // First 2 requests should succeed
      await apiClient.fetchWidgetData('test-widget-123');
      await apiClient.fetchWidgetData('test-widget-123');

      // 3rd request should be rate limited
      await expect(apiClient.fetchWidgetData('test-widget-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-widget-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.RATE_LIMITED);
      }
    });

    it('should retry on recoverable errors', async () => {
      // Mock API response format matching the actual API
      const apiResponse = {
        success: true,
        message: 'Widget data fetched successfully',
        data: {
          widget: {
            id: 'test-widget-123',
            layout: 'grid',
            theme: {
              primaryColor: '#007bff',
              secondaryColor: '#6c757d',
            },
            settings: {
              maxTestimonials: 10,
              showRating: true,
              showDate: true,
              showAvatar: true,
              showAuthorRole: true,
              showAuthorCompany: true,
              theme: 'light',
              cardStyle: 'default',
            },
          },
          testimonials: [
            {
              id: '1',
              content: 'Great product!',
              rating: 5,
              createdAt: '2025-01-01T00:00:00Z',
              isOAuthVerified: true,
              oauthProvider: 'google',
              authorName: 'John Doe',
              authorAvatar: 'https://example.com/avatar.jpg',
              authorRole: 'CEO',
              authorCompany: 'Acme Inc',
            },
          ],
        },
      };

      // First 2 calls fail with 500, 3rd succeeds
      mockRequest
        .mockResolvedValueOnce({
          data: null,
          status: 500,
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          data: null,
          status: 500,
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          data: apiResponse,
          status: 200,
          headers: new Headers(),
        });

      const promise = apiClient.fetchWidgetData('test-widget-123');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.widgetId).toBe('test-widget-123');
      expect(result.testimonials).toHaveLength(1);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-recoverable errors', async () => {
      mockRequest.mockResolvedValue({
        data: null,
        status: 404,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-widget-123')).rejects.toThrow(
        WidgetError
      );

      // Should only be called once (no retries)
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      mockRequest.mockRejectedValue(
        new WidgetError(
          WidgetErrorCode.NETWORK_ERROR,
          'Network request failed',
          true
        )
      );

      const promise = apiClient.fetchWidgetData('test-widget-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.NETWORK_ERROR);
    });

    it('should handle timeout errors', async () => {
      mockRequest.mockRejectedValue(
        new WidgetError(WidgetErrorCode.API_TIMEOUT, 'Request timed out', true)
      );

      const promise = apiClient.fetchWidgetData('test-widget-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_TIMEOUT);
    });

    it('should wrap unexpected errors', async () => {
      mockRequest.mockRejectedValue(new Error('Unexpected error'));

      const promise = apiClient.fetchWidgetData('test-widget-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const client = new APIClient({}, 'test-key');
      const config = client.getConfig();

      expect(config.baseURL).toBe('https://api.tresta.com');
      expect(config.timeout).toBe(10000);
      expect(config.maxRetries).toBe(3);
    });

    it('should accept custom configuration', () => {
      const client = new APIClient({
        baseURL: 'https://custom.api.com',
        timeout: 5000,
        maxRetries: 5,
      }, 'test-key');
      const config = client.getConfig();

      expect(config.baseURL).toBe('https://custom.api.com');
      expect(config.timeout).toBe(5000);
      expect(config.maxRetries).toBe(5);
    });

    it('should update configuration', () => {
      apiClient.updateConfig({ timeout: 15000 });
      const config = apiClient.getConfig();

      expect(config.timeout).toBe(15000);
    });
  });
});
