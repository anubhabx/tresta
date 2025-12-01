/**
 * Storage type definitions
 */

import type { WidgetData } from '../types/index.js';

export interface CacheEntry {
  widgetId: string;
  data: WidgetData;
  timestamp: number;
  expiresAt: number;
}

export interface StorageAdapter {
  get(key: string): Promise<CacheEntry | null>;
  set(key: string, value: CacheEntry): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  isAvailable(): Promise<boolean>;
}
