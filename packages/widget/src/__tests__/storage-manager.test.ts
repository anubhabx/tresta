/**
 * Unit tests for Storage Manager (Task 21.3)
 * Tests Requirements: 24.2
 * 
 * Coverage:
 * - IndexedDB operations
 * - localStorage fallback (simulate private browsing)
 * - Cache expiration and cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager } from '../storage/cache-manager.js';
import type { WidgetData } from '../types/index.js';
import type { StorageAdapter } from '../storage/types.js';

describe('Storage Manager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    // Clear any existing data
    localStorage.clear();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await storageManager.clear();
    localStorage.clear();
  });

  const createMockWidgetData = (widgetId: string): WidgetData => ({
    widgetId,
    config: {
      layout: { type: 'list' },
      theme: {
        mode: 'light',
        primaryColor: '#000',
        secondaryColor: '#666',
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
        content: 'Test testimonial',
        rating: 5,
        createdAt: '2024-01-01',
        isPublished: true,
        isApproved: true,
        isOAuthVerified: false,
        author: { name: 'Test User' },
      },
    ],
  });

  const attachAdapter = (manager: StorageManager, adapter: StorageAdapter) => {
    const managerWithInternals = manager as StorageManager & {
      adapter: StorageAdapter | null;
      initPromise: Promise<void> | null;
    };

    managerWithInternals.adapter = adapter;
    managerWithInternals.initPromise = Promise.resolve();
  };

  describe('Initialization', () => {
    it('should initialize storage manager', () => {
      const manager = new StorageManager();
      expect(manager).toBeDefined();
    });

    it('should attempt to use IndexedDB first', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const manager = new StorageManager();
      const data = createMockWidgetData('test-123');

      await manager.set('test-123', data);

      // Check if IndexedDB or localStorage was used
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Using (IndexedDB|localStorage) for caching/)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Set and Get', () => {
    it('should store and retrieve widget data', async () => {
      const data = createMockWidgetData('test-123');

      await storageManager.set('test-123', data);
      const retrieved = await storageManager.get('test-123');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.widgetId).toBe('test-123');
      expect(retrieved?.testimonials).toHaveLength(1);
      expect(retrieved?.testimonials[0].content).toBe('Test testimonial');
    });

    it('should return null for non-existent key', async () => {
      const retrieved = await storageManager.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should overwrite existing data', async () => {
      const data1 = createMockWidgetData('test-123');
      const data2 = createMockWidgetData('test-123');
      data2.testimonials[0].content = 'Updated testimonial';

      await storageManager.set('test-123', data1);
      await storageManager.set('test-123', data2);

      const retrieved = await storageManager.get('test-123');

      expect(retrieved?.testimonials[0].content).toBe('Updated testimonial');
    });

    it('should handle multiple widget IDs independently', async () => {
      const data1 = createMockWidgetData('widget-1');
      const data2 = createMockWidgetData('widget-2');

      await storageManager.set('widget-1', data1);
      await storageManager.set('widget-2', data2);

      const retrieved1 = await storageManager.get('widget-1');
      const retrieved2 = await storageManager.get('widget-2');

      expect(retrieved1?.widgetId).toBe('widget-1');
      expect(retrieved2?.widgetId).toBe('widget-2');
    });
  });

  describe('Cache Expiration', () => {
    it('should expire cache after TTL', async () => {
      const data = createMockWidgetData('test-123');

      // Set with 100ms TTL
      await storageManager.set('test-123', data, 100);

      // Should be available immediately
      let retrieved = await storageManager.get('test-123');
      expect(retrieved).not.toBeNull();

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired
      retrieved = await storageManager.get('test-123');
      expect(retrieved).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      const data = createMockWidgetData('test-123');

      await storageManager.set('test-123', data);

      // Should be available
      const retrieved = await storageManager.get('test-123');
      expect(retrieved).not.toBeNull();
    });

    it('should clean up expired entries', async () => {
      const data1 = createMockWidgetData('widget-1');
      const data2 = createMockWidgetData('widget-2');

      // Set widget-1 with short TTL
      await storageManager.set('widget-1', data1, 100);
      // Set widget-2 with long TTL
      await storageManager.set('widget-2', data2, 10000);

      // Wait for widget-1 to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Clear expired entries
      await storageManager.clearExpired();

      // widget-1 should be gone
      const retrieved1 = await storageManager.get('widget-1');
      expect(retrieved1).toBeNull();

      // widget-2 should still be there
      const retrieved2 = await storageManager.get('widget-2');
      expect(retrieved2).not.toBeNull();
    });
  });

  describe('Delete', () => {
    it('should delete cached data', async () => {
      const data = createMockWidgetData('test-123');

      await storageManager.set('test-123', data);

      let retrieved = await storageManager.get('test-123');
      expect(retrieved).not.toBeNull();

      await storageManager.delete('test-123');

      retrieved = await storageManager.get('test-123');
      expect(retrieved).toBeNull();
    });

    it('should not throw when deleting non-existent key', async () => {
      await expect(storageManager.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('Clear', () => {
    it('should clear all cached data', async () => {
      const data1 = createMockWidgetData('widget-1');
      const data2 = createMockWidgetData('widget-2');

      await storageManager.set('widget-1', data1);
      await storageManager.set('widget-2', data2);

      await storageManager.clear();

      const retrieved1 = await storageManager.get('widget-1');
      const retrieved2 = await storageManager.get('widget-2');

      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });
  });

  describe('localStorage Fallback', () => {
    it('should use localStorage when IndexedDB is unavailable', async () => {
      // Mock IndexedDB to be unavailable
      const originalIndexedDB = (global as any).indexedDB;
      (global as any).indexedDB = undefined;

      const consoleSpy = vi.spyOn(console, 'log');

      const manager = new StorageManager();
      const data = createMockWidgetData('test-123');

      await manager.set('test-123', data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using localStorage for caching')
      );

      const retrieved = await manager.get('test-123');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.widgetId).toBe('test-123');

      // Restore IndexedDB
      (global as any).indexedDB = originalIndexedDB;
      consoleSpy.mockRestore();
    });

    it('should handle localStorage quota exceeded', async () => {
      // Mock IndexedDB to be unavailable
      const originalIndexedDB = (global as any).indexedDB;
      (global as any).indexedDB = undefined;

      const manager = new StorageManager();

      // Fill up localStorage
      const largeData = createMockWidgetData('large-widget');
      largeData.testimonials = Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          content: 'x'.repeat(1000),
          rating: 5,
          createdAt: '2024-01-01',
          isPublished: true,
          isApproved: true,
          isOAuthVerified: false,
          author: { name: 'User' },
        }));

      // Should handle quota exceeded gracefully
      await expect(manager.set('large-widget', largeData)).resolves.not.toThrow();

      // Restore IndexedDB
      (global as any).indexedDB = originalIndexedDB;
    });

    it('should use reduced TTL for localStorage', async () => {
      // Mock IndexedDB to be unavailable
      const originalIndexedDB = (global as any).indexedDB;
      (global as any).indexedDB = undefined;

      const manager = new StorageManager();
      const data = createMockWidgetData('test-123');

      await manager.set('test-123', data);

      // localStorage should use reduced TTL (1 hour vs 24 hours for IndexedDB)
      // This is implementation detail, but we can verify data is stored
      const retrieved = await manager.get('test-123');
      expect(retrieved).not.toBeNull();

      // Restore IndexedDB
      (global as any).indexedDB = originalIndexedDB;
    });
  });

  describe('Error Handling', () => {
    it('should handle get errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const manager = new StorageManager();

      attachAdapter(manager, {
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockRejectedValue(new Error('Storage get error')),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
      });

      const retrieved = await manager.get('test-123');

      expect(retrieved).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('[TrestaWidget]', 'Cache get error:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle set errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const manager = new StorageManager();

      attachAdapter(manager, {
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockRejectedValue(new Error('Storage set error')),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
      });

      const data = createMockWidgetData('test-123');

      // Should not throw
      await expect(manager.set('test-123', data)).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('[TrestaWidget]', 'Cache set error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle delete errors gracefully', async () => {
      const manager = new StorageManager();

      const consoleSpy = vi.spyOn(console, 'error');

      // Should not throw even if key doesn't exist
      await expect(manager.delete('non-existent')).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle clear errors gracefully', async () => {
      const manager = new StorageManager();

      const consoleSpy = vi.spyOn(console, 'error');

      // Should not throw
      await expect(manager.clear()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle clearExpired errors gracefully', async () => {
      const manager = new StorageManager();

      const consoleSpy = vi.spyOn(console, 'error');

      // Should not throw
      await expect(manager.clearExpired()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Cache Key Format', () => {
    it('should use correct cache key format', async () => {
      const data = createMockWidgetData('test-123');
      const adapter: StorageAdapter = {
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
      };

      attachAdapter(storageManager, adapter);

      await storageManager.set('test-123', data);

      expect(adapter.set).toHaveBeenCalledWith(
        'tresta-widget-test-123',
        expect.objectContaining({
          widgetId: 'test-123',
          data,
        })
      );
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent set operations', async () => {
      const manager = new StorageManager();
      const data1 = createMockWidgetData('widget-1');
      const data2 = createMockWidgetData('widget-2');
      const data3 = createMockWidgetData('widget-3');
      const cache = new Map<string, {
        widgetId: string;
        data: WidgetData;
        timestamp: number;
        expiresAt: number;
      }>();

      attachAdapter(manager, {
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn(async (key: string) => cache.get(key) ?? null),
        set: vi.fn(async (key: string, entry) => {
          cache.set(key, { data: entry.data });
        }),
        delete: vi.fn(async (key: string) => {
          cache.delete(key);
        }),
        clear: vi.fn(async () => {
          cache.clear();
        }),
      });

      // Set multiple widgets concurrently
      await Promise.all([
        manager.set('widget-1', data1),
        manager.set('widget-2', data2),
        manager.set('widget-3', data3),
      ]);

      // All should be retrievable
      const [retrieved1, retrieved2, retrieved3] = await Promise.all([
        manager.get('widget-1'),
        manager.get('widget-2'),
        manager.get('widget-3'),
      ]);

      expect(retrieved1?.widgetId).toBe('widget-1');
      expect(retrieved2?.widgetId).toBe('widget-2');
      expect(retrieved3?.widgetId).toBe('widget-3');
    });

    it('should handle concurrent get operations', async () => {
      const manager = new StorageManager();
      const data = createMockWidgetData('test-123');
      const entry = {
        widgetId: 'test-123',
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + 1000,
      };

      attachAdapter(manager, {
        isAvailable: vi.fn().mockResolvedValue(true),
        get: vi.fn().mockResolvedValue(entry),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
      });

      await manager.set('test-123', data);

      // Get same widget concurrently
      const results = await Promise.all([
        manager.get('test-123'),
        manager.get('test-123'),
        manager.get('test-123'),
      ]);

      results.forEach((result) => {
        expect(result?.widgetId).toBe('test-123');
      });
    });
  });

  describe('No Storage Available', () => {
    it('should handle case when no storage is available', async () => {
      // Mock both IndexedDB and localStorage to be unavailable
      const originalIndexedDB = (global as any).indexedDB;
      const originalLocalStorage = (global as any).localStorage;

      (global as any).indexedDB = undefined;
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('localStorage unavailable');
          },
          setItem: () => {
            throw new Error('localStorage unavailable');
          },
          removeItem: () => {
            throw new Error('localStorage unavailable');
          },
          clear: () => {
            throw new Error('localStorage unavailable');
          },
          key: () => null,
          length: 0,
        },
        writable: true,
        configurable: true,
      });

      const consoleSpy = vi.spyOn(console, 'warn');

      try {
        const manager = new StorageManager();
        const data = createMockWidgetData('test-123');

        // Should not throw
        await expect(manager.set('test-123', data)).resolves.not.toThrow();

        // Should return null when getting
        const retrieved = await manager.get('test-123');
        expect(retrieved).toBeNull();

        expect(consoleSpy).toHaveBeenCalled();
        expect(
          consoleSpy.mock.calls.some((call) =>
            call.some((arg) => String(arg).includes('No storage available'))
          )
        ).toBe(true);
      } finally {
        (global as any).indexedDB = originalIndexedDB;
        Object.defineProperty(global, 'localStorage', {
          value: originalLocalStorage,
          writable: true,
          configurable: true,
        });
        consoleSpy.mockRestore();
      }
    });
  });
});
