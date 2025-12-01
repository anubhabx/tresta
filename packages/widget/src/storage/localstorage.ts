/**
 * localStorage storage adapter (fallback)
 */

import type { CacheEntry, StorageAdapter } from './types.js';

const STORAGE_PREFIX = 'tresta-widget-';

export class LocalStorageAdapter implements StorageAdapter {
  private available: boolean | null = null;

  /**
   * Check if localStorage is available
   */
  async isAvailable(): Promise<boolean> {
    if (this.available !== null) {
      return this.available;
    }

    try {
      const testKey = '__tresta_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.available = true;
      return true;
    } catch (error) {
      console.warn('[TrestaWidget] localStorage unavailable:', error);
      this.available = false;
      return false;
    }
  }

  /**
   * Get a cache entry by key
   */
  async get(key: string): Promise<CacheEntry | null> {
    try {
      const storageKey = STORAGE_PREFIX + key;
      const item = localStorage.getItem(storageKey);

      if (!item) {
        return null;
      }

      const entry = JSON.parse(item) as CacheEntry;

      // Check if entry is expired
      if (entry.expiresAt < Date.now()) {
        // Delete expired entry
        await this.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      console.error('[TrestaWidget] localStorage get error:', error);
      return null;
    }
  }

  /**
   * Set a cache entry
   */
  async set(key: string, value: CacheEntry): Promise<void> {
    try {
      const storageKey = STORAGE_PREFIX + key;
      const serialized = JSON.stringify(value);
      localStorage.setItem(storageKey, serialized);
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn('[TrestaWidget] localStorage quota exceeded, clearing old entries');
        await this.clearExpired();

        // Try again after cleanup
        try {
          const storageKey = STORAGE_PREFIX + key;
          const serialized = JSON.stringify(value);
          localStorage.setItem(storageKey, serialized);
        } catch (retryError) {
          console.error('[TrestaWidget] localStorage set error after cleanup:', retryError);
          throw retryError;
        }
      } else {
        console.error('[TrestaWidget] localStorage set error:', error);
        throw error;
      }
    }
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      const storageKey = STORAGE_PREFIX + key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('[TrestaWidget] localStorage delete error:', error);
      throw error;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];

      // Find all keys with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // Remove all matching keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[TrestaWidget] localStorage clear error:', error);
      throw error;
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<void> {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      // Find all expired entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item) as CacheEntry;
              if (entry.expiresAt < now) {
                keysToRemove.push(key);
              }
            }
          } catch (parseError) {
            // If we can't parse it, remove it
            keysToRemove.push(key);
          }
        }
      }

      // Remove expired keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[TrestaWidget] localStorage clearExpired error:', error);
      // Don't throw - cleanup is best effort
    }
  }
}
