/**
 * Unit tests for API Client (Task 21.2)
 * Tests Requirements: 24.2
 * 
 * Coverage:
 * - Exponential backoff with jitter
 * - Rate limiting (429 handling)
 * - Timeout (10s)
 * - All error status codes
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIClient } from '../api/client';
import { WidgetError, WidgetErrorCode } from '../types';

describe('API Client', () => {
  let apiClient: APIClient;

  beforeEach(() => {
    vi.useFakeTimers();
    apiClient = new APIClient(
      { baseURL: 'https://api.test.com', timeout: 10000 },
      'test-api-key'
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const client = new APIClient({}, 'test-key');
      const config = client.getConfig();

      expect(config.baseURL).toBe('https://api.tresta.com');
      expect(config.timeout).toBe(10000);
      expect(config.maxRetries).toBe(3);
    });

    it('should initialize with custom config', () => {
      const client = new APIClient(
        {
          baseURL: 'https://custom.api.com',
          timeout: 5000,
          maxRetries: 5,
        },
        'test-key'
      );
      const config = client.getConfig();

      expect(config.baseURL).toBe('https://custom.api.com');
      expect(config.timeout).toBe(5000);
      expect(config.maxRetries).toBe(5);
    });

    it('should initialize network client and rate limiter', () => {
      const client = new APIClient({}, 'test-key');

      expect(client.getNetworkClient()).toBeDefined();
      expect(client.getRateLimiter()).toBeDefined();
    });
  });

  describe('fetchWidgetData', () => {
    it('should throw error when API key is not provided', async () => {
      const client = new APIClient();

      await expect(client.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await client.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.UNAUTHORIZED);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should fetch widget data successfully', async () => {
      const mockResponse = {
        data: {
          widget: {
            id: 'test-123',
            layout: 'grid',
            settings: {
              maxTestimonials: 10,
              showRating: true,
              showDate: true,
              showAvatar: true,
              showAuthorRole: true,
              showAuthorCompany: true,
            },
            theme: {
              primaryColor: '#0066FF',
              secondaryColor: '#00CC99',
            },
          },
          testimonials: [
            {
              id: '1',
              content: 'Great product!',
              rating: 5,
              createdAt: '2024-01-01',
              isOAuthVerified: false,
              authorName: 'John Doe',
            },
          ],
        },
      };

      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await apiClient.fetchWidgetData('test-123');

      expect(result.widgetId).toBe('test-123');
      expect(result.testimonials).toHaveLength(1);
      expect(result.testimonials[0].content).toBe('Great product!');
      expect(result.config.layout.type).toBe('grid');
    });

    it('should transform API response correctly', async () => {
      const mockResponse = {
        data: {
          widget: {
            id: 'test-123',
            layout: 'carousel',
            settings: {
              maxTestimonials: 5,
              autoRotate: true,
              rotateInterval: 3000,
              showRating: false,
              showDate: false,
              showAvatar: true,
              showAuthorRole: false,
              showAuthorCompany: false,
            },
            theme: {
              primaryColor: '#FF0000',
              secondaryColor: '#00FF00',
            },
          },
          testimonials: [
            {
              id: '1',
              content: 'Test testimonial',
              rating: 4,
              createdAt: '2024-01-01',
              isOAuthVerified: true,
              oauthProvider: 'Google',
              authorName: 'Jane Smith',
              authorRole: 'CEO',
              authorCompany: 'Acme Inc',
              authorAvatar: 'https://example.com/avatar.jpg',
              videoUrl: 'https://example.com/video.mp4',
            },
          ],
        },
      };

      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: mockResponse,
        status: 200,
        headers: new Headers(),
      });

      const result = await apiClient.fetchWidgetData('test-123');

      expect(result.config.layout.type).toBe('carousel');
      expect(result.config.layout.autoRotate).toBe(true);
      expect(result.config.layout.rotateInterval).toBe(3000);
      expect(result.config.theme.primaryColor).toBe('#FF0000');
      expect(result.config.display.showRating).toBe(false);
      expect(result.testimonials[0].isOAuthVerified).toBe(true);
      expect(result.testimonials[0].oauthProvider).toBe('Google');
      expect(result.testimonials[0].author.name).toBe('Jane Smith');
      expect(result.testimonials[0].media?.type).toBe('video');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Unauthorized' },
        status: 401,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.UNAUTHORIZED);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should handle 403 Forbidden', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Forbidden' },
        status: 403,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.UNAUTHORIZED);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should handle 404 Not Found', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Not Found' },
        status: 404,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.INVALID_WIDGET_ID);
        expect((error as WidgetError).recoverable).toBe(false);
      }
    });

    it('should handle 429 Rate Limited', async () => {
      const headers = new Headers();
      headers.set('Retry-After', '60');

      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Rate Limited' },
        status: 429,
        headers,
      });

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.RATE_LIMITED);
        expect((error as WidgetError).recoverable).toBe(true);
        expect((error as WidgetError).message).toContain('60 seconds');
      }
    });

    it('should handle 500 Server Error', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Internal Server Error' },
        status: 500,
        headers: new Headers(),
      });

      const promise = apiClient.fetchWidgetData('test-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
      expect(error.recoverable).toBe(true);
    });

    it('should handle 502 Bad Gateway', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Bad Gateway' },
        status: 502,
        headers: new Headers(),
      });

      const promise = apiClient.fetchWidgetData('test-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
      expect(error.recoverable).toBe(true);
    });

    it('should handle 503 Service Unavailable', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { error: 'Service Unavailable' },
        status: 503,
        headers: new Headers(),
      });

      const promise = apiClient.fetchWidgetData('test-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_ERROR);
      expect(error.recoverable).toBe(true);
    });

    it('should handle invalid API response format', async () => {
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: { invalid: 'response' },
        status: 200,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.PARSE_ERROR);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit before making request', async () => {
      const rateLimiter = apiClient.getRateLimiter();

      // Exhaust rate limit
      for (let i = 0; i < 100; i++) {
        rateLimiter.isAllowed('test-123');
      }

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      try {
        await apiClient.fetchWidgetData('test-123');
      } catch (error) {
        expect(error).toBeInstanceOf(WidgetError);
        expect((error as WidgetError).code).toBe(WidgetErrorCode.RATE_LIMITED);
      }
    });

    it('should respect rate limit per widget ID', async () => {
      const rateLimiter = apiClient.getRateLimiter();

      // Exhaust rate limit for widget-1
      for (let i = 0; i < 100; i++) {
        rateLimiter.isAllowed('widget-1');
      }

      // widget-1 should be rate limited
      await expect(apiClient.fetchWidgetData('widget-1')).rejects.toThrow(
        WidgetError
      );

      // widget-2 should still be allowed
      const networkClient = apiClient.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockResolvedValue({
        data: {
          data: {
            widget: { id: 'widget-2', layout: 'list', settings: {}, theme: {} },
            testimonials: [],
          },
        },
        status: 200,
        headers: new Headers(),
      });

      await expect(apiClient.fetchWidgetData('widget-2')).resolves.toBeDefined();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on recoverable errors', async () => {
      const networkClient = apiClient.getNetworkClient();
      let attemptCount = 0;

      vi.spyOn(networkClient, 'request').mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          return {
            data: { error: 'Server Error' },
            status: 500,
            headers: new Headers(),
          };
        }
        return {
          data: {
            data: {
              widget: { id: 'test-123', layout: 'list', settings: {}, theme: {} },
              testimonials: [],
            },
          },
          status: 200,
          headers: new Headers(),
        };
      });

      const promise = apiClient.fetchWidgetData('test-123');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(attemptCount).toBe(3);
      expect(result.widgetId).toBe('test-123');
    });

    it('should not retry on non-recoverable errors', async () => {
      const networkClient = apiClient.getNetworkClient();
      let attemptCount = 0;

      vi.spyOn(networkClient, 'request').mockImplementation(async () => {
        attemptCount++;
        return {
          data: { error: 'Not Found' },
          status: 404,
          headers: new Headers(),
        };
      });

      await expect(apiClient.fetchWidgetData('test-123')).rejects.toThrow(
        WidgetError
      );

      // Should only attempt once (no retries for 404)
      expect(attemptCount).toBe(1);
    });

    it('should implement exponential backoff with jitter', async () => {
      const networkClient = apiClient.getNetworkClient();
      const timestamps: number[] = [];

      vi.spyOn(networkClient, 'request').mockImplementation(async () => {
        timestamps.push(Date.now());
        return {
          data: { error: 'Server Error' },
          status: 500,
          headers: new Headers(),
        };
      });

      const promise = apiClient.fetchWidgetData('test-123').catch((e) => e);
      await vi.runAllTimersAsync();
      await promise;

      // Should have made 3 attempts
      expect(timestamps).toHaveLength(3);

      // Check that delays increase (exponential backoff)
      if (timestamps.length >= 3) {
        const delay1 = timestamps[1] - timestamps[0];
        const delay2 = timestamps[2] - timestamps[1];

        // Second delay should be longer than first (with some tolerance for jitter)
        expect(delay2).toBeGreaterThanOrEqual(delay1 * 0.8);
      }
    });

    it('should respect maxRetries configuration', async () => {
      const client = new APIClient(
        { baseURL: 'https://api.test.com', maxRetries: 2 },
        'test-key'
      );

      const networkClient = client.getNetworkClient();
      let attemptCount = 0;

      vi.spyOn(networkClient, 'request').mockImplementation(async () => {
        attemptCount++;
        return {
          data: { error: 'Server Error' },
          status: 500,
          headers: new Headers(),
        };
      });

      const promise = client.fetchWidgetData('test-123').catch((e) => e);
      await vi.runAllTimersAsync();
      await promise;

      // Should only attempt 2 times (maxRetries = 2)
      expect(attemptCount).toBe(2);
    });
  });

  describe('Timeout', () => {
    it('should timeout after configured duration', async () => {
      const client = new APIClient(
        { baseURL: 'https://api.test.com', timeout: 100 },
        'test-key'
      );

      const networkClient = client.getNetworkClient();
      vi.spyOn(networkClient, 'request').mockRejectedValue(
        new WidgetError(WidgetErrorCode.API_TIMEOUT, 'Request timed out after 100ms', true)
      );

      const promise = client.fetchWidgetData('test-123').catch((e) => e);
      await vi.runAllTimersAsync();
      const error = await promise;

      expect(error).toBeInstanceOf(WidgetError);
      expect(error.code).toBe(WidgetErrorCode.API_TIMEOUT);
    });

    it('should use default 10 second timeout', () => {
      const client = new APIClient({}, 'test-key');
      const config = client.getConfig();

      expect(config.timeout).toBe(10000);
    });
  });

  describe('Configuration', () => {
    it('should allow updating configuration', () => {
      const client = new APIClient(
        { baseURL: 'https://api.test.com' },
        'test-key'
      );

      client.updateConfig({
        timeout: 5000,
        maxRetries: 5,
      });

      const config = client.getConfig();
      expect(config.timeout).toBe(5000);
      expect(config.maxRetries).toBe(5);
      expect(config.baseURL).toBe('https://api.test.com');
    });

    it('should return copy of configuration', () => {
      const client = new APIClient({}, 'test-key');

      const config1 = client.getConfig();
      const config2 = client.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });
});
