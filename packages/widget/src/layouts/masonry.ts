/**
 * Masonry Layout
 * 
 * Pinterest-style layout with dynamic height cards and optimal spacing.
 * Uses CSS Grid with auto-flow dense for efficient packing.
 * Implements Requirements: 3.3, 7.2, 7.5
 */

import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';
import { TestimonialCard } from '../components/testimonial-card';

export interface MasonryConfig {
  testimonials: Testimonial[];
  layoutConfig: LayoutConfig;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

export class Masonry {
  private testimonials: Testimonial[];
  private layoutConfig: LayoutConfig;
  private displayOptions: DisplayOptions;
  private theme: ThemeConfig;
  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(config: MasonryConfig) {
    this.testimonials = config.testimonials;
    this.layoutConfig = config.layoutConfig;
    this.displayOptions = config.displayOptions;
    this.theme = config.theme;
  }

  /**
   * Renders the masonry layout
   */
  render(): HTMLElement {
    const masonry = document.createElement('div');
    masonry.className = 'tresta-masonry';
    masonry.setAttribute('role', 'list');
    masonry.setAttribute('aria-label', 'Customer testimonials');

    // Apply column configuration if specified
    if (this.layoutConfig.columns) {
      masonry.style.setProperty('--masonry-columns', this.layoutConfig.columns.toString());
    }

    // Render testimonial items
    this.testimonials.forEach((testimonial) => {
      const item = this.renderItem(testimonial);
      masonry.appendChild(item);
    });

    this.container = masonry;

    // Set up resize observer to recalculate layout on size changes
    this.setupResizeObserver();

    return masonry;
  }

  /**
   * Renders a single testimonial masonry item
   */
  private renderItem(testimonial: Testimonial): HTMLElement {
    const item = document.createElement('div');
    item.className = 'tresta-masonry-item';
    item.setAttribute('role', 'listitem');

    // Create testimonial card
    const card = new TestimonialCard({
      testimonial,
      displayOptions: this.displayOptions,
      theme: this.theme,
    });

    item.appendChild(card.render());

    return item;
  }

  /**
   * Sets up ResizeObserver to handle dynamic height changes
   */
  private setupResizeObserver(): void {
    if (!this.container) return;

    // Check if ResizeObserver is supported
    if (typeof ResizeObserver === 'undefined') {
      return; // Graceful degradation - layout will still work without dynamic adjustments
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const item = entry.target as HTMLElement;
        const height = entry.contentRect.height;
        
        // Calculate grid row span based on item height
        // Each row is approximately 10px, so we calculate how many rows this item needs
        const rowSpan = Math.ceil(height / 10);
        item.style.gridRowEnd = `span ${rowSpan}`;
      });
    });

    // Observe all masonry items
    const items = this.container.querySelectorAll('.tresta-masonry-item');
    items.forEach((item) => {
      this.resizeObserver!.observe(item);
    });
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.container = null;
  }
}
