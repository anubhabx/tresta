/**
 * Carousel Layout
 * 
 * Auto-rotating slider with navigation controls, touch gestures, and keyboard support.
 * Implements Requirements: 3.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.3, 7.4
 */

import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';
import { TestimonialCard } from '../components/testimonial-card';

export interface CarouselConfig {
  testimonials: Testimonial[];
  layoutConfig: LayoutConfig;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

export class Carousel {
  private testimonials: Testimonial[];
  private layoutConfig: LayoutConfig;
  private displayOptions: DisplayOptions;
  private theme: ThemeConfig;
  private container: HTMLElement | null = null;
  private currentIndex: number = 0;
  private autoRotateTimer: number | null = null;
  private isPaused: boolean = false;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private isTransitioning: boolean = false;

  constructor(config: CarouselConfig) {
    this.testimonials = config.testimonials;
    this.layoutConfig = config.layoutConfig;
    this.displayOptions = config.displayOptions;
    this.theme = config.theme;
  }

  /**
   * Renders the carousel layout
   */
  render(): HTMLElement {
    const carousel = document.createElement('div');
    carousel.className = 'tresta-carousel';
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Customer testimonials');
    carousel.setAttribute('aria-roledescription', 'carousel');

    // Create carousel structure
    const track = document.createElement('div');
    track.className = 'tresta-carousel-track';

    // Render testimonial slides
    this.testimonials.forEach((testimonial, index) => {
      const slide = this.renderSlide(testimonial, index);
      track.appendChild(slide);
    });

    carousel.appendChild(track);

    // Add navigation buttons if enabled
    if (this.layoutConfig.showNavigation !== false) {
      carousel.appendChild(this.renderNavigationButtons());
    }

    // Add dot indicators
    carousel.appendChild(this.renderDotIndicators());

    this.container = carousel;

    // Set up event listeners
    this.setupEventListeners();

    // Start auto-rotation if enabled
    if (this.layoutConfig.autoRotate !== false) {
      this.startAutoRotate();
    }

    // Show first slide
    this.updateSlidePosition(false);

    return carousel;
  }

  /**
   * Renders a single testimonial slide
   */
  private renderSlide(testimonial: Testimonial, index: number): HTMLElement {
    const slide = document.createElement('div');
    slide.className = 'tresta-carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${this.testimonials.length}`);

    // Create testimonial card
    const card = new TestimonialCard({
      testimonial,
      displayOptions: this.displayOptions,
      theme: this.theme,
    });

    slide.appendChild(card.render());

    return slide;
  }

  /**
   * Renders navigation buttons (previous/next)
   */
  private renderNavigationButtons(): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'tresta-carousel-nav';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'tresta-carousel-button tresta-carousel-prev';
    prevButton.setAttribute('aria-label', 'Previous testimonial');
    prevButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    prevButton.addEventListener('click', () => this.previous());

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'tresta-carousel-button tresta-carousel-next';
    nextButton.setAttribute('aria-label', 'Next testimonial');
    nextButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    nextButton.addEventListener('click', () => this.next());

    nav.appendChild(prevButton);
    nav.appendChild(nextButton);

    return nav;
  }

  /**
   * Renders dot indicators for position tracking
   */
  private renderDotIndicators(): HTMLElement {
    const indicators = document.createElement('div');
    indicators.className = 'tresta-carousel-indicators';
    indicators.setAttribute('role', 'tablist');
    indicators.setAttribute('aria-label', 'Testimonial navigation');

    this.testimonials.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'tresta-carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
      
      if (index === 0) {
        dot.classList.add('active');
      }

      dot.addEventListener('click', () => this.goToSlide(index));

      indicators.appendChild(dot);
    });

    return indicators;
  }

  /**
   * Sets up event listeners for touch gestures, keyboard navigation, and pause-on-hover
   */
  private setupEventListeners(): void {
    if (!this.container) return;

    // Touch gesture support
    this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.pause());
    this.container.addEventListener('mouseleave', () => this.resume());

    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Focus management
    this.container.addEventListener('focusin', () => this.pause());
    this.container.addEventListener('focusout', () => this.resume());
  }

  /**
   * Handles touch start event
   */
  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    
    this.touchStartX = touch.clientX;
    this.pause();
  }

  /**
   * Handles touch end event and detects swipe gestures
   */
  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    if (!touch) return;
    
    this.touchEndX = touch.clientX;
    this.handleSwipe();
    this.resume();
  }

  /**
   * Processes swipe gesture
   */
  private handleSwipe(): void {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) < swipeThreshold) {
      return; // Not a swipe
    }

    if (diff > 0) {
      // Swipe left - go to next
      this.next();
    } else {
      // Swipe right - go to previous
      this.previous();
    }
  }

  /**
   * Handles keyboard navigation
   */
  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.previous();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.next();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.testimonials.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        this.pause();
        break;
    }
  }

  /**
   * Navigates to the previous slide
   */
  previous(): void {
    if (this.isTransitioning) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    this.updateSlidePosition();
  }

  /**
   * Navigates to the next slide
   */
  next(): void {
    if (this.isTransitioning) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.updateSlidePosition();
  }

  /**
   * Navigates to a specific slide by index
   */
  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentIndex) return;
    if (index < 0 || index >= this.testimonials.length) return;

    this.currentIndex = index;
    this.updateSlidePosition();
  }

  /**
   * Updates the carousel position to show the current slide
   */
  private updateSlidePosition(animate: boolean = true): void {
    if (!this.container) return;

    const track = this.container.querySelector('.tresta-carousel-track') as HTMLElement;
    const slides = this.container.querySelectorAll('.tresta-carousel-slide');
    const dots = this.container.querySelectorAll('.tresta-carousel-dot');

    if (!track || slides.length === 0) return;

    // Update track position
    const offset = -this.currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    track.style.transition = animate ? 'transform 0.3s ease-in-out' : 'none';

    // Update slide visibility and ARIA attributes
    slides.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      
      if (isActive) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update dot indicators
    dots.forEach((dot, index) => {
      const isActive = index === this.currentIndex;
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      dot.setAttribute('tabindex', isActive ? '0' : '-1');
      
      if (isActive) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Set transitioning flag after DOM updates
    if (animate) {
      this.isTransitioning = true;
      setTimeout(() => {
        this.isTransitioning = false;
      }, 300); // Match CSS transition duration
    }
  }

  /**
   * Starts auto-rotation
   */
  private startAutoRotate(): void {
    if (this.layoutConfig.autoRotate === false) return;

    const interval = this.layoutConfig.rotateInterval || 5000; // Default 5 seconds

    this.autoRotateTimer = window.setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, interval);
  }

  /**
   * Stops auto-rotation
   */
  private stopAutoRotate(): void {
    if (this.autoRotateTimer !== null) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  /**
   * Pauses auto-rotation
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resumes auto-rotation
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Cleans up event listeners and timers
   */
  destroy(): void {
    this.stopAutoRotate();

    if (this.container) {
      // Remove event listeners
      const clonedContainer = this.container.cloneNode(true) as HTMLElement;
      this.container.parentNode?.replaceChild(clonedContainer, this.container);
      this.container = null;
    }
  }
}
