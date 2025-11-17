/**
 * Cache manager with IndexedDB and localStorage fallback
 */

import type { WidgetData } from '../types';
import type { CacheEntry, StorageAdapter } from './types';
import { IndexedDBAdapter } from './indexeddb';
import { LocalStorageAdapter } from './localstorage';

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const LOCALSTORAGE_TTL = 60 * 60 * 1000; // 1 hour (reduced for localStorage)

export class StorageManager {
  private adapter: StorageAdapter | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the storage adapter
   */
  private async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // Try IndexedDB first
      const indexedDBAdapter = new IndexedDBAdapter();
      if (await indexedDBAdapter.isAvailable()) {
        this.adapter = indexedDBAdapter;
        console.log('[TrestaWidget] Using IndexedDB for caching');
        
        // Clear expired entries on initialization (don't await to avoid blocking)
        this.clearExpired().catch(() => {
          // Ignore cleanup errors
        });
        return;
      }

      // Fall back to localStorage
      const localStorageAdapter = new LocalStorageAdapter();
      if (await localStorageAdapter.isAvailable()) {
        this.adapter = localStorageAdapter;
        console.log('[TrestaWidget] Using localStorage for caching (IndexedDB unavailable)');
        
        // Clear expired entries on initialization (don't await to avoid blocking)
        this.clearExpired().catch(() => {
          // Ignore cleanup errors
        });
        return;
      }

      // No storage available
      console.warn('[TrestaWidget] No storage available, caching disabled');
      this.adapter = null;
    })();

    return this.initPromise;
  }

  /**
   * Get the current adapter
   */
  private async getAdapter(): Promise<StorageAdapter | null> {
    await this.init();
    return this.adapter;
  }

  /**
   * Generate cache key for a widget ID
   */
  private getCacheKey(widgetId: string): string {
    return `tresta-widget-${widgetId}`;
  }

  /**
   * Get TTL based on adapter type
   */
  private getTTL(): number {
    if (this.adapter instanceof IndexedDBAdapter) {
      return DEFAULT_TTL;
    } else if (this.adapter instanceof LocalStorageAdapter) {
      return LOCALSTORAGE_TTL;
    }
    return DEFAULT_TTL;
  }

  /**
   * Get cached widget data
   */
  async get(widgetId: string): Promise<WidgetData | null> {
    try {
      const adapter = await this.getAdapter();
      if (!adapter) {
        return null;
      }

      const key = this.getCacheKey(widgetId);
      const entry = await adapter.get(key);
      
      if (!entry) {
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('[TrestaWidget] Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached widget data
   */
  async set(widgetId: string, data: WidgetData, ttl?: number): Promise<void> {
    try {
      const adapter = await this.getAdapter();
      if (!adapter) {
        return;
      }

      const key = this.getCacheKey(widgetId);
      const now = Date.now();
      const effectiveTTL = ttl ?? this.getTTL();

      const entry: CacheEntry = {
        widgetId,
        data,
        timestamp: now,
        expiresAt: now + effectiveTTL,
      };

      await adapter.set(key, entry);
    } catch (error) {
      console.error('[TrestaWidget] Cache set error:', error);
      // Don't throw - caching is best effort
    }
  }

  /**
   * Delete cached widget data
   */
  async delete(widgetId: string): Promise<void> {
    try {
      const adapter = await this.getAdapter();
      if (!adapter) {
        return;
      }

      const key = this.getCacheKey(widgetId);
      await adapter.delete(key);
    } catch (error) {
      console.error('[TrestaWidget] Cache delete error:', error);
      // Don't throw - deletion is best effort
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    try {
      const adapter = await this.getAdapter();
      if (!adapter) {
        return;
      }

      await adapter.clear();
    } catch (error) {
      console.error('[TrestaWidget] Cache clear error:', error);
      // Don't throw - clearing is best effort
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<void> {
    try {
      const adapter = await this.getAdapter();
      if (!adapter) {
        return;
      }

      if ('clearExpired' in adapter && typeof adapter.clearExpired === 'function') {
        await adapter.clearExpired();
      }
    } catch (error) {
      console.error('[TrestaWidget] Cache clearExpired error:', error);
      // Don't throw - cleanup is best effort
    }
  }
}
