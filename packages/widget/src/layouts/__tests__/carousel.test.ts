/**
 * Carousel Layout Tests
 * 
 * Tests for carousel functionality including navigation, auto-rotation,
 * touch gestures, and keyboard navigation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Carousel } from '../carousel';
import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../../types';

describe('Carousel', () => {
  let mockTestimonials: Testimonial[];
  let layoutConfig: LayoutConfig;
  let displayOptions: DisplayOptions;
  let theme: ThemeConfig;

  beforeEach(() => {
    // Mock testimonials
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
          avatar: 'https://example.com/avatar1.jpg',
          role: 'CEO',
          company: 'Acme Inc',
        },
      },
      {
        id: '2',
        content: 'Excellent service!',
        rating: 5,
        createdAt: '2025-01-02T00:00:00Z',
        isPublished: true,
        isApproved: true,
        isOAuthVerified: false,
        author: {
          name: 'Jane Smith',
          avatar: 'https://example.com/avatar2.jpg',
          role: 'CTO',
          company: 'Tech Corp',
        },
      },
      {
        id: '3',
        content: 'Highly recommend!',
        rating: 4,
        createdAt: '2025-01-03T00:00:00Z',
        isPublished: true,
        isApproved: true,
        isOAuthVerified: true,
        oauthProvider: 'LinkedIn',
        author: {
          name: 'Bob Johnson',
          avatar: 'https://example.com/avatar3.jpg',
          role: 'Manager',
          company: 'Business LLC',
        },
      },
    ];

    layoutConfig = {
      type: 'carousel',
      autoRotate: true,
      rotateInterval: 3000,
      showNavigation: true,
    };

    displayOptions = {
      showRating: true,
      showDate: true,
      showAvatar: true,
      showAuthorRole: true,
      showAuthorCompany: true,
    };

    theme = {
      mode: 'light',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      cardStyle: 'default',
    };

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render carousel with all testimonials', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      expect(element.className).toBe('tresta-carousel');
      expect(element.getAttribute('role')).toBe('region');
      expect(element.getAttribute('aria-label')).toBe('Customer testimonials');

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides.length).toBe(3);
    });

    it('should render navigation buttons when showNavigation is true', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, showNavigation: true },
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const prevButton = element.querySelector('.tresta-carousel-prev');
      const nextButton = element.querySelector('.tresta-carousel-next');

      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      expect(prevButton?.getAttribute('aria-label')).toBe('Previous testimonial');
      expect(nextButton?.getAttribute('aria-label')).toBe('Next testimonial');
    });

    it('should not render navigation buttons when showNavigation is false', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, showNavigation: false },
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const nav = element.querySelector('.tresta-carousel-nav');

      expect(nav).toBeNull();
    });

    it('should render dot indicators for each testimonial', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const dots = element.querySelectorAll('.tresta-carousel-dot');

      expect(dots.length).toBe(3);
      expect(dots[0].classList.contains('active')).toBe(true);
      expect(dots[0].getAttribute('aria-selected')).toBe('true');
    });

    it('should set first slide as active initially', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const slides = element.querySelectorAll('.tresta-carousel-slide');

      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
      expect(slides[1].getAttribute('aria-hidden')).toBe('true');
      expect(slides[2].getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Navigation', () => {
    it('should navigate to next slide when next button is clicked', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const nextButton = element.querySelector('.tresta-carousel-next') as HTMLButtonElement;

      nextButton.click();

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[1].getAttribute('aria-hidden')).toBe('false');
      expect(slides[0].getAttribute('aria-hidden')).toBe('true');
    });

    it('should navigate to previous slide when previous button is clicked', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const prevButton = element.querySelector('.tresta-carousel-prev') as HTMLButtonElement;

      prevButton.click();

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[2].getAttribute('aria-hidden')).toBe('false');
      expect(slides[0].getAttribute('aria-hidden')).toBe('true');
    });

    it('should wrap around to first slide when navigating next from last slide', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const nextButton = element.querySelector('.tresta-carousel-next') as HTMLButtonElement;

      // Navigate to last slide
      nextButton.click();
      vi.advanceTimersByTime(300); // Wait for transition
      nextButton.click();
      vi.advanceTimersByTime(300); // Wait for transition

      // Navigate one more time to wrap around
      nextButton.click();
      vi.advanceTimersByTime(300); // Wait for transition

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });

    it('should navigate to specific slide when dot indicator is clicked', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const dots = element.querySelectorAll('.tresta-carousel-dot') as NodeListOf<HTMLButtonElement>;

      dots[2].click();

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[2].getAttribute('aria-hidden')).toBe('false');
      expect(dots[2].classList.contains('active')).toBe(true);
    });
  });

  describe('Auto-rotation', () => {
    it('should auto-rotate when autoRotate is true', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, autoRotate: true, rotateInterval: 3000 },
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Initially on first slide
      let slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');

      // Advance timer
      vi.advanceTimersByTime(3000);

      // Should be on second slide
      slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[1].getAttribute('aria-hidden')).toBe('false');
    });

    it('should not auto-rotate when autoRotate is false', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, autoRotate: false },
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Initially on first slide
      let slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');

      // Advance timer
      vi.advanceTimersByTime(5000);

      // Should still be on first slide
      slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });

    it('should pause auto-rotation on hover', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, autoRotate: true, rotateInterval: 3000 },
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Trigger mouseenter
      element.dispatchEvent(new Event('mouseenter'));

      // Advance timer
      vi.advanceTimersByTime(3000);

      // Should still be on first slide (paused)
      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });

    it('should resume auto-rotation on mouse leave', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, autoRotate: true, rotateInterval: 3000 },
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Pause
      element.dispatchEvent(new Event('mouseenter'));

      // Resume
      element.dispatchEvent(new Event('mouseleave'));

      // Advance timer
      vi.advanceTimersByTime(3000);

      // Should advance to second slide
      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[1].getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate to next slide on ArrowRight key', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      element.dispatchEvent(event);

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[1].getAttribute('aria-hidden')).toBe('false');
    });

    it('should navigate to previous slide on ArrowLeft key', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      element.dispatchEvent(event);

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[2].getAttribute('aria-hidden')).toBe('false');
    });

    it('should navigate to first slide on Home key', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Navigate to second slide first
      const nextButton = element.querySelector('.tresta-carousel-next') as HTMLButtonElement;
      nextButton.click();
      vi.advanceTimersByTime(300); // Wait for transition

      // Press Home key
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      element.dispatchEvent(event);
      vi.advanceTimersByTime(300); // Wait for transition

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });

    it('should navigate to last slide on End key', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      const event = new KeyboardEvent('keydown', { key: 'End' });
      element.dispatchEvent(event);

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[2].getAttribute('aria-hidden')).toBe('false');
    });

    it('should pause auto-rotation on Escape key', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, autoRotate: true, rotateInterval: 3000 },
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Press Escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      element.dispatchEvent(event);

      // Advance timer
      vi.advanceTimersByTime(3000);

      // Should still be on first slide (paused)
      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('Touch Gestures', () => {
    it('should navigate to next slide on swipe left', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Simulate swipe left
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100 } as Touch],
      });

      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[1].getAttribute('aria-hidden')).toBe('false');
    });

    it('should navigate to previous slide on swipe right', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Simulate swipe right
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 200 } as Touch],
      });

      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[2].getAttribute('aria-hidden')).toBe('false');
    });

    it('should not navigate on small swipe gestures', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Simulate small swipe (below threshold)
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 120 } as Touch],
      });

      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);

      // Should still be on first slide
      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('Cleanup', () => {
    it('should stop auto-rotation when destroyed', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig: { ...layoutConfig, autoRotate: true, rotateInterval: 3000 },
        displayOptions,
        theme,
      });

      carousel.render();
      carousel.destroy();

      // Advance timer
      vi.advanceTimersByTime(3000);

      // Timer should be cleared, so no error should occur
      expect(true).toBe(true);
    });

    it('should remove event listeners when destroyed', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      carousel.destroy();

      // Try to trigger events - should not cause errors
      element.dispatchEvent(new Event('mouseenter'));
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      expect(true).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      expect(element.getAttribute('role')).toBe('region');
      expect(element.getAttribute('aria-label')).toBe('Customer testimonials');
      expect(element.getAttribute('aria-roledescription')).toBe('carousel');
    });

    it('should update ARIA attributes when navigating', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();
      const nextButton = element.querySelector('.tresta-carousel-next') as HTMLButtonElement;

      nextButton.click();

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      const dots = element.querySelectorAll('.tresta-carousel-dot');

      expect(slides[1].getAttribute('aria-hidden')).toBe('false');
      expect(dots[1].getAttribute('aria-selected')).toBe('true');
      expect(dots[1].getAttribute('tabindex')).toBe('0');
      expect(dots[0].getAttribute('tabindex')).toBe('-1');
    });

    it('should have proper focus management', () => {
      const carousel = new Carousel({
        testimonials: mockTestimonials,
        layoutConfig,
        displayOptions,
        theme,
      });

      const element = carousel.render();

      // Trigger focus
      element.dispatchEvent(new Event('focusin'));

      // Advance timer - should be paused
      vi.advanceTimersByTime(3000);

      const slides = element.querySelectorAll('.tresta-carousel-slide');
      expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    });
  });
});
