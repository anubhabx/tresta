/**
 * List Layout
 * 
 * Simple vertical list layout with minimal JavaScript.
 * Serves as a fallback for older browsers.
 * Implements Requirements: 3.5, 7.5
 */

import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';
import { TestimonialCard } from '../components/testimonial-card';

export interface ListConfig {
  testimonials: Testimonial[];
  layoutConfig: LayoutConfig;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

export class List {
  private testimonials: Testimonial[];
  private displayOptions: DisplayOptions;
  private theme: ThemeConfig;

  constructor(config: ListConfig) {
    this.testimonials = config.testimonials;
    this.displayOptions = config.displayOptions;
    this.theme = config.theme;
  }

  /**
   * Renders the list layout
   */
  render(): HTMLElement {
    const list = document.createElement('div');
    list.className = 'tresta-list';
    list.setAttribute('role', 'list');
    list.setAttribute('aria-label', 'Customer testimonials');

    // Handle empty state
    if (this.testimonials.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'tresta-empty-state';
      emptyState.textContent = 'No testimonials to display yet.';
      list.appendChild(emptyState);
      return list;
    }

    // Render testimonial items
    this.testimonials.forEach((testimonial) => {
      const item = this.renderItem(testimonial);
      list.appendChild(item);
    });

    return list;
  }

  /**
   * Renders a single testimonial list item
   */
  private renderItem(testimonial: Testimonial): HTMLElement {
    const item = document.createElement('div');
    item.className = 'tresta-list-item';
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
   * Cleans up resources
   */
  destroy(): void {
    // No cleanup needed for list layout
  }
}
