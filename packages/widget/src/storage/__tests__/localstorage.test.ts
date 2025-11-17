/**
 * localStorage adapter tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageAdapter } from '../localstorage';
import type { CacheEntry } from '../types';
import type { WidgetData } from '../../types';

// Mock widget data
const mockWidgetData: WidgetData = {
  widgetId: 'test-widget-123',
  config: {
    layout: {
      type: 'grid',
      maxTestimonials: 10,
    },
    theme: {
      mode: 'light',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
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
      isOAuthVerified: false,
      author: {
        name: 'John Doe',
      },
    },
  ],
};

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(async () => {
    // Clean up
    await adapter.clear();
  });

  it('should check if localStorage is available', async () => {
    const available = await adapter.isAvailable();
    expect(available).toBe(true);
  });

  it('should store and retrieve a cache entry', async () => {
    const key = 'tresta-widget-test-123';
    const now = Date.now();
    const entry: CacheEntry = {
      widgetId: 'test-123',
      data: mockWidgetData,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    await adapter.set(key, entry);
    const retrieved = await adapter.get(key);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.widgetId).toBe('test-123');
    expect(retrieved?.data.widgetId).toBe('test-widget-123');
    expect(retrieved?.timestamp).toBe(now);
  });

  it('should return null for non-existent key', async () => {
    const result = await adapter.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('should delete a cache entry', async () => {
    const key = 'tresta-widget-test-delete';
    const now = Date.now();
    const entry: CacheEntry = {
      widgetId: 'test-delete',
      data: mockWidgetData,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    await adapter.set(key, entry);
    await adapter.delete(key);
    const retrieved = await adapter.get(key);

    expect(retrieved).toBeNull();
  });

  it('should return null for expired entries', async () => {
    const key = 'tresta-widget-test-expired';
    const now = Date.now();
    const entry: CacheEntry = {
      widgetId: 'test-expired',
      data: mockWidgetData,
      timestamp: now - 1000,
      expiresAt: now - 500, // Already expired
    };

    await adapter.set(key, entry);
    const retrieved = await adapter.get(key);

    expect(retrieved).toBeNull();
  });

  it('should clear all entries with prefix', async () => {
    const now = Date.now();
    const entry1: CacheEntry = {
      widgetId: 'test-1',
      data: mockWidgetData,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };
    const entry2: CacheEntry = {
      widgetId: 'test-2',
      data: mockWidgetData,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    await adapter.set('tresta-widget-test-1', entry1);
    await adapter.set('tresta-widget-test-2', entry2);
    
    // Add a non-widget item to localStorage
    localStorage.setItem('other-key', 'other-value');
    
    await adapter.clear();

    const retrieved1 = await adapter.get('tresta-widget-test-1');
    const retrieved2 = await adapter.get('tresta-widget-test-2');
    const otherValue = localStorage.getItem('other-key');

    expect(retrieved1).toBeNull();
    expect(retrieved2).toBeNull();
    expect(otherValue).toBe('other-value'); // Should not be cleared
  });

  it('should clear only expired entries', async () => {
    const now = Date.now();
    const expiredEntry: CacheEntry = {
      widgetId: 'test-expired',
      data: mockWidgetData,
      timestamp: now - 1000,
      expiresAt: now - 500,
    };
    const validEntry: CacheEntry = {
      widgetId: 'test-valid',
      data: mockWidgetData,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    await adapter.set('tresta-widget-test-expired', expiredEntry);
    await adapter.set('tresta-widget-test-valid', validEntry);
    await adapter.clearExpired();

    const retrievedExpired = await adapter.get('tresta-widget-test-expired');
    const retrievedValid = await adapter.get('tresta-widget-test-valid');

    expect(retrievedExpired).toBeNull();
    expect(retrievedValid).not.toBeNull();
    expect(retrievedValid?.widgetId).toBe('test-valid');
  });

  it('should handle JSON parse errors gracefully', async () => {
    // Manually set invalid JSON
    localStorage.setItem('tresta-widget-invalid', 'invalid-json');
    
    const result = await adapter.get('invalid');
    expect(result).toBeNull();
  });

  it('should use correct storage key prefix', async () => {
    const key = 'test-123';
    const now = Date.now();
    const entry: CacheEntry = {
      widgetId: 'test-123',
      data: mockWidgetData,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    await adapter.set(key, entry);
    
    // Check that the key is stored with prefix
    const storageKey = 'tresta-widget-test-123';
    const storedValue = localStorage.getItem(storageKey);
    expect(storedValue).not.toBeNull();
  });
});
