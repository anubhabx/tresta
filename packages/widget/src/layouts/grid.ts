/**
 * Grid Layout
 * 
 * Responsive grid layout with CSS Grid and equal-height cards.
 * Supports 1-4 columns based on screen size.
 * Implements Requirements: 3.2, 7.2, 7.5
 */

import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';
import { TestimonialCard } from '../components/testimonial-card';

export interface GridConfig {
  testimonials: Testimonial[];
  layoutConfig: LayoutConfig;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

export class Grid {
  private testimonials: Testimonial[];
  private layoutConfig: LayoutConfig;
  private displayOptions: DisplayOptions;
  private theme: ThemeConfig;

  constructor(config: GridConfig) {
    this.testimonials = config.testimonials;
    this.layoutConfig = config.layoutConfig;
    this.displayOptions = config.displayOptions;
    this.theme = config.theme;
  }

  /**
   * Renders the grid layout
   */
  render(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'tresta-grid';
    grid.setAttribute('role', 'list');
    grid.setAttribute('aria-label', 'Customer testimonials');

    // Apply column configuration if specified
    if (this.layoutConfig.columns) {
      grid.style.setProperty('--grid-columns', this.layoutConfig.columns.toString());
    }

    // Render testimonial items
    this.testimonials.forEach((testimonial) => {
      const item = this.renderItem(testimonial);
      grid.appendChild(item);
    });

    return grid;
  }

  /**
   * Renders a single testimonial grid item
   */
  private renderItem(testimonial: Testimonial): HTMLElement {
    const item = document.createElement('div');
    item.className = 'tresta-grid-item';
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
    // No cleanup needed for grid layout
  }
}
