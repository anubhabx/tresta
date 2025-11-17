/**
 * Unit tests for Layout Engine and individual layouts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutEngine, List, Grid, Masonry, Wall, Carousel } from '../layouts';
import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';

describe('Layout Engine', () => {
  let mockTestimonials: Testimonial[];
  let mockDisplayOptions: DisplayOptions;
  let mockTheme: ThemeConfig;

  beforeEach(() => {
    mockTestimonials = [
      {
        id: '1',
        content: 'Great product!',
        rating: 5,
        createdAt: '2025-01-01T00:00:00Z',
        isPublished: true,
        isApproved: true,
        isOAuthVerified: true,
        oauthProvider: 'Google',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://example.com/avatar.jpg',
          role: 'CEO',
          company: 'Acme Inc',
        },
      },
      {
        id: '2',
        content: 'Excellent service!',
        rating: 4,
        createdAt: '2025-01-02T00:00:00Z',
        isPublished: true,
        isApproved: true,
        isOAuthVerified: false,
        author: {
          name: 'Jane Smith',
          role: 'Manager',
        },
      },
    ];

    mockDisplayOptions = {
      showRating: true,
      showDate: true,
      showAvatar: true,
      showAuthorRole: true,
      showAuthorCompany: true,
    };

    mockTheme = {
      mode: 'light',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      cardStyle: 'default',
    };
  });

  describe('LayoutEngine.create', () => {
    it('should create List layout', () => {
      const layoutConfig: LayoutConfig = { type: 'list' };
      const layout = LayoutEngine.create({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      expect(layout).toBeInstanceOf(List);
    });

    it('should create Grid layout', () => {
      const layoutConfig: LayoutConfig = { type: 'grid' };
      const layout = LayoutEngine.create({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      expect(layout).toBeInstanceOf(Grid);
    });

    it('should create Masonry layout', () => {
      const layoutConfig: LayoutConfig = { type: 'masonry' };
      const layout = LayoutEngine.create({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      expect(layout).toBeInstanceOf(Masonry);
    });

    it('should create Wall layout', () => {
      const layoutConfig: LayoutConfig = { type: 'wall' };
      const layout = LayoutEngine.create({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      expect(layout).toBeInstanceOf(Wall);
    });

    it('should create Carousel layout', () => {
      const layoutConfig: LayoutConfig = { type: 'carousel' };
      const layout = LayoutEngine.create({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      expect(layout).toBeInstanceOf(Carousel);
    });

    it('should fallback to List layout for unknown type', () => {
      const layoutConfig: LayoutConfig = { type: 'unknown' as any };
      const layout = LayoutEngine.create({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      expect(layout).toBeInstanceOf(List);
    });
  });

  describe('List Layout', () => {
    it('should render list container with correct attributes', () => {
      const layoutConfig: LayoutConfig = { type: 'list' };
      const layout = new List({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.className).toBe('tresta-list');
      expect(element.getAttribute('role')).toBe('list');
      expect(element.getAttribute('aria-label')).toBe('Customer testimonials');
    });

    it('should render all testimonials', () => {
      const layoutConfig: LayoutConfig = { type: 'list' };
      const layout = new List({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();
      const items = element.querySelectorAll('.tresta-list-item');

      expect(items.length).toBe(2);
    });
  });

  describe('Grid Layout', () => {
    it('should render grid container with correct attributes', () => {
      const layoutConfig: LayoutConfig = { type: 'grid' };
      const layout = new Grid({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.className).toBe('tresta-grid');
      expect(element.getAttribute('role')).toBe('list');
      expect(element.getAttribute('aria-label')).toBe('Customer testimonials');
    });

    it('should render all testimonials', () => {
      const layoutConfig: LayoutConfig = { type: 'grid' };
      const layout = new Grid({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();
      const items = element.querySelectorAll('.tresta-grid-item');

      expect(items.length).toBe(2);
    });

    it('should apply custom column count', () => {
      const layoutConfig: LayoutConfig = { type: 'grid', columns: 3 };
      const layout = new Grid({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.style.getPropertyValue('--grid-columns')).toBe('3');
    });
  });

  describe('Masonry Layout', () => {
    it('should render masonry container with correct attributes', () => {
      const layoutConfig: LayoutConfig = { type: 'masonry' };
      const layout = new Masonry({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.className).toBe('tresta-masonry');
      expect(element.getAttribute('role')).toBe('list');
      expect(element.getAttribute('aria-label')).toBe('Customer testimonials');
    });

    it('should render all testimonials', () => {
      const layoutConfig: LayoutConfig = { type: 'masonry' };
      const layout = new Masonry({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();
      const items = element.querySelectorAll('.tresta-masonry-item');

      expect(items.length).toBe(2);
    });

    it('should apply custom column count', () => {
      const layoutConfig: LayoutConfig = { type: 'masonry', columns: 4 };
      const layout = new Masonry({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.style.getPropertyValue('--masonry-columns')).toBe('4');
    });
  });

  describe('Wall Layout', () => {
    it('should render wall container with correct attributes', () => {
      const layoutConfig: LayoutConfig = { type: 'wall' };
      const layout = new Wall({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.className).toBe('tresta-wall');
      expect(element.getAttribute('role')).toBe('list');
      expect(element.getAttribute('aria-label')).toBe('Customer testimonials');
    });

    it('should render all testimonials', () => {
      const layoutConfig: LayoutConfig = { type: 'wall' };
      const layout = new Wall({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();
      const items = element.querySelectorAll('.tresta-wall-item');

      expect(items.length).toBe(2);
    });

    it('should mark featured items', () => {
      const layoutConfig: LayoutConfig = { type: 'wall' };
      const layout = new Wall({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();
      const featuredItems = element.querySelectorAll('.tresta-wall-item-featured');

      // First item (index 0) should be featured (5 stars + verified)
      expect(featuredItems.length).toBeGreaterThan(0);
    });

    it('should apply custom column count', () => {
      const layoutConfig: LayoutConfig = { type: 'wall', columns: 2 };
      const layout = new Wall({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      const element = layout.render();

      expect(element.style.getPropertyValue('--wall-columns')).toBe('2');
    });
  });

  describe('Layout destroy', () => {
    it('should clean up List layout', () => {
      const layoutConfig: LayoutConfig = { type: 'list' };
      const layout = new List({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      layout.render();
      layout.destroy();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should clean up Grid layout', () => {
      const layoutConfig: LayoutConfig = { type: 'grid' };
      const layout = new Grid({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      layout.render();
      layout.destroy();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should clean up Masonry layout', () => {
      const layoutConfig: LayoutConfig = { type: 'masonry' };
      const layout = new Masonry({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      layout.render();
      layout.destroy();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should clean up Wall layout', () => {
      const layoutConfig: LayoutConfig = { type: 'wall' };
      const layout = new Wall({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions: mockDisplayOptions,
        theme: mockTheme,
      });

      layout.render();
      layout.destroy();

      // Should not throw
      expect(true).toBe(true);
    });
  });
});
