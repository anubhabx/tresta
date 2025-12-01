/**
 * IndexedDB storage adapter
 */

import type { CacheEntry, StorageAdapter } from './types.js';

const DB_NAME = 'tresta-widget-cache';
const DB_VERSION = 1;
const STORE_NAME = 'testimonials';

export class IndexedDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private available: boolean | null = null;

  /**
   * Check if IndexedDB is available (handles private browsing mode)
   */
  async isAvailable(): Promise<boolean> {
    if (this.available !== null) {
      return this.available;
    }

    try {
      // Immediate detection of IndexedDB unavailability
      if (!('indexedDB' in window)) {
        this.available = false;
        return false;
      }

      // Test if we can actually open a database (private browsing check)
      const testDB = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('__test__', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
          // Create a test store
          request.result.createObjectStore('test');
        };
      });

      testDB.close();
      indexedDB.deleteDatabase('__test__');

      this.available = true;
      return true;
    } catch (error) {
      console.warn('[TrestaWidget] IndexedDB unavailable, will use localStorage fallback:', error);
      this.available = false;
      return false;
    }
  }

  /**
   * Get or create the database connection
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'widgetId' });
          // Create index on expiresAt for efficient cleanup
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Get a cache entry by key
   */
  async get(key: string): Promise<CacheEntry | null> {
    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const entry = request.result as CacheEntry | undefined;

          // Check if entry is expired
          if (entry && entry.expiresAt < Date.now()) {
            // Delete expired entry asynchronously
            this.delete(key).catch(() => {
              // Ignore deletion errors
            });
            resolve(null);
          } else {
            resolve(entry || null);
          }
        };
      });
    } catch (error) {
      console.error('[TrestaWidget] IndexedDB get error:', error);
      return null;
    }
  }

  /**
   * Set a cache entry
   */
  async set(_key: string, value: CacheEntry): Promise<void> {
    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('[TrestaWidget] IndexedDB set error:', error);
      throw error;
    }
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('[TrestaWidget] IndexedDB delete error:', error);
      throw error;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('[TrestaWidget] IndexedDB clear error:', error);
      throw error;
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<void> {
    try {
      const db = await this.getDB();
      const now = Date.now();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('expiresAt');

        // Get all entries with expiresAt < now
        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
      });
    } catch (error) {
      console.error('[TrestaWidget] IndexedDB clearExpired error:', error);
      // Don't throw - cleanup is best effort
    }
  }
}
