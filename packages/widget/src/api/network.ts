/**
 * Network layer with fetch and timeout support
 */

import { WidgetError, WidgetErrorCode } from '../types/index.js';
import type { RequestOptions, APIResponse } from './types.js';

/**
 * Create a fetch request with timeout support
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: RequestOptions = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 10000, // 10 second default timeout
  } = options;

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
      credentials: 'omit', // Never send credentials (withCredentials: false)
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);

    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WidgetError(
        WidgetErrorCode.API_TIMEOUT,
        `Request timed out after ${timeout}ms`,
        true
      );
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new WidgetError(
        WidgetErrorCode.NETWORK_ERROR,
        'Network request failed. Please check your connection.',
        true
      );
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Request interceptor - can be used to modify requests before sending
 */
export type RequestInterceptor = (
  url: string,
  options: RequestOptions
) => { url: string; options: RequestOptions } | Promise<{ url: string; options: RequestOptions }>;

/**
 * Response interceptor - can be used to modify responses after receiving
 */
export type ResponseInterceptor = <T>(
  response: APIResponse<T>
) => APIResponse<T> | Promise<APIResponse<T>>;

/**
 * Network client with interceptor support
 */
export class NetworkClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Execute a request with interceptors
   */
  async request<T>(url: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    // Apply request interceptors
    let modifiedUrl = url;
    let modifiedOptions = options;

    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(modifiedUrl, modifiedOptions);
      modifiedUrl = result.url;
      modifiedOptions = result.options;
    }

    // Execute request
    let response = await fetchWithTimeout<T>(modifiedUrl, modifiedOptions);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    return response;
  }
}
