/**
 * Layout Engine
 * 
 * Factory for creating different layout types.
 * Implements Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.5
 */

import type { Testimonial, LayoutConfig, DisplayOptions, ThemeConfig } from '../types';
import { Carousel } from './carousel';
import { Grid } from './grid';
import { Masonry } from './masonry';
import { Wall } from './wall';
import { List } from './list';

export { Carousel } from './carousel';
export { Grid } from './grid';
export { Masonry } from './masonry';
export { Wall } from './wall';
export { List } from './list';

export type { CarouselConfig } from './carousel';
export type { GridConfig } from './grid';
export type { MasonryConfig } from './masonry';
export type { WallConfig } from './wall';
export type { ListConfig } from './list';

/**
 * Layout interface that all layouts must implement
 */
export interface Layout {
  render(): HTMLElement;
  destroy(): void;
}

/**
 * Configuration for creating a layout
 */
export interface LayoutEngineConfig {
  testimonials: Testimonial[];
  layoutConfig: LayoutConfig;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

/**
 * LayoutEngine - Factory for creating layout instances
 */
export class LayoutEngine {
  /**
   * Creates a layout instance based on the specified type
   * 
   * @param config - Configuration including layout type and testimonials
   * @returns Layout instance
   * @throws Error if layout type is not supported
   */
  static create(config: LayoutEngineConfig): Layout {
    const { layoutConfig } = config;

    switch (layoutConfig.type) {
      case 'carousel':
        return new Carousel(config);
      
      case 'grid':
        return new Grid(config);
      
      case 'masonry':
        return new Masonry(config);
      
      case 'wall':
        return new Wall(config);
      
      case 'list':
        return new List(config);
      
      default:
        // Fallback to list layout for unknown types (graceful degradation)
        console.warn(`[TrestaWidget] Unknown layout type: ${layoutConfig.type}. Falling back to list layout.`);
        return new List(config);
    }
  }
}
