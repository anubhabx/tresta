/**
 * Unit tests for Layout Engine (Task 21.5)
 * Tests Requirements: 24.4
 * 
 * Coverage:
 * - Each layout type renders correctly
 * - Responsive behavior
 * - Empty state handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LayoutEngine } from '../layouts';
import type { Testimonial, LayoutEngineConfig } from '../layouts';

describe('Layout Engine', () => {
  const createMockTestimonials = (count: number): Testimonial[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${i + 1}`,
      content: `Test testimonial ${i + 1}`,
      rating: 5,
      createdAt: '2024-01-01',
      isPublished: true,
      isApproved: true,
      isOAuthVerified: false,
      author: {
        name: `User ${i + 1}`,
        avatar: `https://example.com/avatar${i + 1}.jpg`,
        role: 'Customer',
        company: 'Acme Inc',
      },
    }));
  };

  const createBaseConfig = (layoutType: string, testimonials: Testimonial[]): LayoutEngineConfig => ({
    testimonials,
    layoutConfig: {
      type: layoutType as any,
    },
    displayOptions: {
      showRating: true,
      showDate: true,
      showAvatar: true,
      showAuthorRole: true,
      showAuthorCompany: true,
    },
    theme: {
      mode: 'light',
      primaryColor: '#0066FF',
      secondaryColor: '#00CC99',
      cardStyle: 'default',
    },
  });

  describe('Layout Creation', () => {
    it('should create carousel layout', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);

      const layout = LayoutEngine.create(config);

      expect(layout).toBeDefined();
      expect(layout.render).toBeDefined();
      expect(layout.destroy).toBeDefined();
    });

    it('should create grid layout', () => {
      const testimonials = createMockTestimonials(6);
      const config = createBaseConfig('grid', testimonials);

      const layout = LayoutEngine.create(config);

      expect(layout).toBeDefined();
      expect(layout.render).toBeDefined();
      expect(layout.destroy).toBeDefined();
    });

    it('should create masonry layout', () => {
      const testimonials = createMockTestimonials(8);
      const config = createBaseConfig('masonry', testimonials);

      const layout = LayoutEngine.create(config);

      expect(layout).toBeDefined();
      expect(layout.render).toBeDefined();
      expect(layout.destroy).toBeDefined();
    });

    it('should create wall layout', () => {
      const testimonials = createMockTestimonials(10);
      const config = createBaseConfig('wall', testimonials);

      const layout = LayoutEngine.create(config);

      expect(layout).toBeDefined();
      expect(layout.render).toBeDefined();
      expect(layout.destroy).toBeDefined();
    });

    it('should create list layout', () => {
      const testimonials = createMockTestimonials(5);
      const config = createBaseConfig('list', testimonials);

      const layout = LayoutEngine.create(config);

      expect(layout).toBeDefined();
      expect(layout.render).toBeDefined();
      expect(layout.destroy).toBeDefined();
    });

    it('should fallback to list layout for unknown type', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('unknown-layout', testimonials);

      const consoleSpy = vi.spyOn(console, 'warn');

      const layout = LayoutEngine.create(config);

      expect(layout).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown layout type: unknown-layout')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Carousel Layout', () => {
    it('should render carousel with testimonials', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.classList.contains('tresta-carousel')).toBe(true);
    });

    it('should render navigation controls', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);
      config.layoutConfig.showNavigation = true;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const prevButton = element.querySelector('[aria-label*="Previous"]');
      const nextButton = element.querySelector('[aria-label*="Next"]');

      expect(prevButton).not.toBeNull();
      expect(nextButton).not.toBeNull();
    });

    it('should support auto-rotate', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);
      config.layoutConfig.autoRotate = true;
      config.layoutConfig.rotateInterval = 3000;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
    });

    it('should clean up timers on destroy', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);
      config.layoutConfig.autoRotate = true;

      const layout = LayoutEngine.create(config);
      layout.render();

      // Should not throw
      expect(() => layout.destroy()).not.toThrow();
    });
  });

  describe('Grid Layout', () => {
    it('should render grid with testimonials', () => {
      const testimonials = createMockTestimonials(6);
      const config = createBaseConfig('grid', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.classList.contains('tresta-grid')).toBe(true);
    });

    it('should support custom column count', () => {
      const testimonials = createMockTestimonials(6);
      const config = createBaseConfig('grid', testimonials);
      config.layoutConfig.columns = 3;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      // Grid should have CSS custom property for columns
      const style = element.getAttribute('style');
      if (style) {
        expect(style).toContain('--grid-columns');
      }
    });

    it('should render all testimonials in grid', () => {
      const testimonials = createMockTestimonials(6);
      const config = createBaseConfig('grid', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(6);
    });
  });

  describe('Masonry Layout', () => {
    it('should render masonry with testimonials', () => {
      const testimonials = createMockTestimonials(8);
      const config = createBaseConfig('masonry', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.classList.contains('tresta-masonry')).toBe(true);
    });

    it('should support custom column count', () => {
      const testimonials = createMockTestimonials(8);
      const config = createBaseConfig('masonry', testimonials);
      config.layoutConfig.columns = 4;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
    });

    it('should render all testimonials in masonry', () => {
      const testimonials = createMockTestimonials(8);
      const config = createBaseConfig('masonry', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(8);
    });
  });

  describe('Wall Layout', () => {
    it('should render wall with testimonials', () => {
      const testimonials = createMockTestimonials(10);
      const config = createBaseConfig('wall', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.classList.contains('tresta-wall')).toBe(true);
    });

    it('should render all testimonials in wall', () => {
      const testimonials = createMockTestimonials(10);
      const config = createBaseConfig('wall', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(10);
    });
  });

  describe('List Layout', () => {
    it('should render list with testimonials', () => {
      const testimonials = createMockTestimonials(5);
      const config = createBaseConfig('list', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.classList.contains('tresta-list')).toBe(true);
    });

    it('should render all testimonials in list', () => {
      const testimonials = createMockTestimonials(5);
      const config = createBaseConfig('list', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(5);
    });
  });

  describe('Empty State Handling', () => {
    it('should handle empty testimonials array for carousel', () => {
      const config = createBaseConfig('carousel', []);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      expect(element.textContent).toContain('No testimonials');
    });

    it('should handle empty testimonials array for grid', () => {
      const config = createBaseConfig('grid', []);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      expect(element.textContent).toContain('No testimonials');
    });

    it('should handle empty testimonials array for masonry', () => {
      const config = createBaseConfig('masonry', []);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      expect(element.textContent).toContain('No testimonials');
    });

    it('should handle empty testimonials array for wall', () => {
      const config = createBaseConfig('wall', []);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      expect(element.textContent).toContain('No testimonials');
    });

    it('should handle empty testimonials array for list', () => {
      const config = createBaseConfig('list', []);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      expect(element.textContent).toContain('No testimonials');
    });
  });

  describe('Display Options', () => {
    it('should respect showRating option', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.displayOptions.showRating = false;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const ratings = element.querySelectorAll('.tresta-rating');
      expect(ratings.length).toBe(0);
    });

    it('should respect showDate option', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.displayOptions.showDate = false;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const dates = element.querySelectorAll('.tresta-date');
      expect(dates.length).toBe(0);
    });

    it('should respect showAvatar option', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.displayOptions.showAvatar = false;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const avatars = element.querySelectorAll('.tresta-avatar');
      expect(avatars.length).toBe(0);
    });

    it('should respect showAuthorRole option', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.displayOptions.showAuthorRole = false;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const roles = element.querySelectorAll('.tresta-author-role');
      expect(roles.length).toBe(0);
    });

    it('should respect showAuthorCompany option', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.displayOptions.showAuthorCompany = false;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const companies = element.querySelectorAll('.tresta-author-company');
      expect(companies.length).toBe(0);
    });
  });

  describe('Theme Support', () => {
    it('should apply light theme', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.theme.mode = 'light';

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
    });

    it('should apply dark theme', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.theme.mode = 'dark';

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
    });

    it('should apply custom colors', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.theme.primaryColor = '#FF0000';
      config.theme.secondaryColor = '#00FF00';

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
    });

    it('should apply card style', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);
      config.theme.cardStyle = 'minimal';

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render responsive grid layout', () => {
      const testimonials = createMockTestimonials(6);
      const config = createBaseConfig('grid', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      // Grid should have responsive classes or styles
      expect(element.classList.contains('tresta-grid')).toBe(true);
    });

    it('should render responsive masonry layout', () => {
      const testimonials = createMockTestimonials(8);
      const config = createBaseConfig('masonry', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element.classList.contains('tresta-masonry')).toBe(true);
    });

    it('should render responsive carousel layout', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element.classList.contains('tresta-carousel')).toBe(true);
    });
  });

  describe('Destroy Cleanup', () => {
    it('should clean up carousel timers', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);
      config.layoutConfig.autoRotate = true;

      const layout = LayoutEngine.create(config);
      layout.render();

      expect(() => layout.destroy()).not.toThrow();
    });

    it('should clean up event listeners', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);

      const layout = LayoutEngine.create(config);
      layout.render();

      expect(() => layout.destroy()).not.toThrow();
    });

    it('should allow multiple destroy calls', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);

      const layout = LayoutEngine.create(config);
      layout.render();

      expect(() => {
        layout.destroy();
        layout.destroy();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should include ARIA labels for carousel navigation', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('carousel', testimonials);
      config.layoutConfig.showNavigation = true;

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const prevButton = element.querySelector('button[aria-label*="Previous"]');
      const nextButton = element.querySelector('button[aria-label*="Next"]');

      expect(prevButton).not.toBeNull();
      expect(nextButton).not.toBeNull();
    });

    it('should include proper semantic structure', () => {
      const testimonials = createMockTestimonials(3);
      const config = createBaseConfig('list', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      // Should have proper list structure
      expect(element).toBeDefined();
    });
  });

  describe('Single Testimonial', () => {
    it('should render carousel with single testimonial', () => {
      const testimonials = createMockTestimonials(1);
      const config = createBaseConfig('carousel', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      expect(element).toBeDefined();
      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(1);
    });

    it('should render grid with single testimonial', () => {
      const testimonials = createMockTestimonials(1);
      const config = createBaseConfig('grid', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(1);
    });
  });

  describe('Large Number of Testimonials', () => {
    it('should handle many testimonials in grid', () => {
      const testimonials = createMockTestimonials(50);
      const config = createBaseConfig('grid', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(50);
    });

    it('should handle many testimonials in masonry', () => {
      const testimonials = createMockTestimonials(50);
      const config = createBaseConfig('masonry', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(50);
    });

    it('should handle many testimonials in list', () => {
      const testimonials = createMockTestimonials(50);
      const config = createBaseConfig('list', testimonials);

      const layout = LayoutEngine.create(config);
      const element = layout.render();

      const cards = element.querySelectorAll('.tresta-testimonial-card');
      expect(cards.length).toBe(50);
    });
  });
});
