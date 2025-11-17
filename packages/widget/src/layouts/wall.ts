/**
 * Wall Layout
 * 
 * Dense grid layout with varied card sizes for visual interest.
 * Featured testimonials (high ratings or verified) get larger cards.
 * Implements Requirements: 3.4, 7.2, 7.5
 */

import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';
import { TestimonialCard } from '../components/testimonial-card';

export interface WallConfig {
  testimonials: Testimonial[];
  layoutConfig: LayoutConfig;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

export class Wall {
  private testimonials: Testimonial[];
  private layoutConfig: LayoutConfig;
  private displayOptions: DisplayOptions;
  private theme: ThemeConfig;

  constructor(config: WallConfig) {
    this.testimonials = config.testimonials;
    this.layoutConfig = config.layoutConfig;
    this.displayOptions = config.displayOptions;
    this.theme = config.theme;
  }

  /**
   * Renders the wall layout
   */
  render(): HTMLElement {
    const wall = document.createElement('div');
    wall.className = 'tresta-wall';
    wall.setAttribute('role', 'list');
    wall.setAttribute('aria-label', 'Customer testimonials');

    // Apply column configuration if specified
    if (this.layoutConfig.columns) {
      wall.style.setProperty('--wall-columns', this.layoutConfig.columns.toString());
    }

    // Render testimonial items with varied sizes
    this.testimonials.forEach((testimonial, index) => {
      const item = this.renderItem(testimonial, index);
      wall.appendChild(item);
    });

    return wall;
  }

  /**
   * Renders a single testimonial wall item with size variation
   */
  private renderItem(testimonial: Testimonial, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'tresta-wall-item';
    item.setAttribute('role', 'listitem');

    // Determine if this should be a featured (larger) card
    const isFeatured = this.shouldBeFeatured(testimonial, index);
    
    if (isFeatured) {
      item.classList.add('tresta-wall-item-featured');
    }

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
   * Determines if a testimonial should be featured (larger card)
   * Based on rating, verification status, and position
   */
  private shouldBeFeatured(testimonial: Testimonial, index: number): boolean {
    // Feature every 5th testimonial for visual variety
    const isPositionFeatured = index % 5 === 0;
    
    // Feature high-rated testimonials (5 stars)
    const isHighRated = testimonial.rating === 5;
    
    // Feature OAuth verified testimonials
    const isVerified = testimonial.isOAuthVerified;
    
    // A testimonial is featured if it meets any of these criteria
    return isPositionFeatured || (isHighRated && isVerified);
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    // No cleanup needed for wall layout
  }
}
