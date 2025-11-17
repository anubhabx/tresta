/**
 * API-specific type definitions
 */

import type { WidgetData } from '../types';

export interface APIClientConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface APIError {
  code: string;
  message: string;
  status?: number;
  retryable: boolean;
}
