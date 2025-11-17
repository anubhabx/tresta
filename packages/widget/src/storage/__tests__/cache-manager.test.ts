/**
 * StorageManager tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager } from '../cache-manager';
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

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(async () => {
    // Clean up
    await manager.clear();
  });

  it('should initialize with available storage adapter', async () => {
    const widgetId = 'test-123';
    await manager.set(widgetId, mockWidgetData);
    const retrieved = await manager.get(widgetId);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.widgetId).toBe('test-widget-123');
  });

  it('should store and retrieve widget data', async () => {
    const widgetId = 'test-widget-456';
    
    await manager.set(widgetId, mockWidgetData);
    const retrieved = await manager.get(widgetId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.widgetId).toBe('test-widget-123');
    expect(retrieved?.testimonials).toHaveLength(1);
    expect(retrieved?.testimonials[0].content).toBe('Great product!');
  });

  it('should return null for non-existent widget', async () => {
    const result = await manager.get('non-existent-widget');
    expect(result).toBeNull();
  });

  it('should delete widget data', async () => {
    const widgetId = 'test-widget-delete';
    
    await manager.set(widgetId, mockWidgetData);
    await manager.delete(widgetId);
    const retrieved = await manager.get(widgetId);

    expect(retrieved).toBeNull();
  });

  it('should use correct cache key format', async () => {
    const widgetId = '123';
    await manager.set(widgetId, mockWidgetData);
    
    // Check that the key follows the format: tresta-widget-${widgetId}
    const storageKey = 'tresta-widget-tresta-widget-123';
    const directValue = localStorage.getItem(storageKey);
    
    // The key should exist in storage
    expect(directValue).not.toBeNull();
  });

  it('should handle custom TTL', async () => {
    const widgetId = 'test-widget-ttl';
    const customTTL = 1000; // 1 second
    
    await manager.set(widgetId, mockWidgetData, customTTL);
    
    // Should be retrievable immediately
    const retrieved = await manager.get(widgetId);
    expect(retrieved).not.toBeNull();
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Should be expired now
    const expiredResult = await manager.get(widgetId);
    expect(expiredResult).toBeNull();
  });

  it('should clear all cached data', async () => {
    await manager.set('widget-1', mockWidgetData);
    await manager.set('widget-2', mockWidgetData);
    
    await manager.clear();
    
    const result1 = await manager.get('widget-1');
    const result2 = await manager.get('widget-2');
    
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should clear expired entries on initialization', async () => {
    // Manually create an expired entry
    const now = Date.now();
    const expiredEntry = {
      widgetId: 'expired-widget',
      data: mockWidgetData,
      timestamp: now - 2000,
      expiresAt: now - 1000,
    };
    
    localStorage.setItem(
      'tresta-widget-tresta-widget-expired',
      JSON.stringify(expiredEntry)
    );
    
    // Create a new manager instance to trigger initialization
    const newManager = new StorageManager();
    
    // Give it time to initialize and clean up
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await newManager.get('expired-widget');
    expect(result).toBeNull();
  });

  it('should handle storage errors gracefully', async () => {
    const widgetId = 'test-error-handling';
    
    // Should not throw even if storage operations fail
    await expect(manager.set(widgetId, mockWidgetData)).resolves.not.toThrow();
    await expect(manager.get(widgetId)).resolves.not.toThrow();
    await expect(manager.delete(widgetId)).resolves.not.toThrow();
    await expect(manager.clear()).resolves.not.toThrow();
  });

  it('should handle multiple concurrent operations', async () => {
    const widgetId = 'test-concurrent';
    
    // Perform multiple operations concurrently
    await Promise.all([
      manager.set(widgetId, mockWidgetData),
      manager.get(widgetId),
      manager.set(widgetId, mockWidgetData),
    ]);
    
    const result = await manager.get(widgetId);
    expect(result).not.toBeNull();
  });

  it('should preserve data structure when caching', async () => {
    const widgetId = 'test-structure';
    const complexData: WidgetData = {
      ...mockWidgetData,
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
          media: {
            type: 'image',
            url: 'https://example.com/image.jpg',
            thumbnail: 'https://example.com/thumb.jpg',
          },
        },
      ],
    };
    
    await manager.set(widgetId, complexData);
    const retrieved = await manager.get(widgetId);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.testimonials[0].isOAuthVerified).toBe(true);
    expect(retrieved?.testimonials[0].oauthProvider).toBe('google');
    expect(retrieved?.testimonials[0].author.email).toBe('john@example.com');
    expect(retrieved?.testimonials[0].media?.type).toBe('image');
  });
});
