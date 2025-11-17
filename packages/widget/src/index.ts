/**
 * Tresta Widget - CDN-delivered testimonial widget system
 * @version 1.0.0
 */

import { Widget } from './core/widget';
import { autoInitialize } from './core/loader';
import type { WidgetConfig, WidgetInstance } from './types';

// Expose global API
export const TrestaWidget = {
  /**
   * Programmatically mount a widget instance
   * @param element - Container element or CSS selector
   * @param config - Widget configuration
   * @returns Widget instance
   */
  mount(element: string | HTMLElement, config: WidgetConfig): WidgetInstance {
    const container = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!container) {
      throw new Error(`[TrestaWidget] Container not found: ${element}`);
    }

    const widget = new Widget(config);
    widget.mount(container as HTMLElement);
    return widget;
  },

  /**
   * Unmount a widget instance
   * @param element - Container element or CSS selector
   */
  unmount(element: string | HTMLElement): void {
    const container = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!container) {
      console.warn(`[TrestaWidget] Container not found: ${element}`);
      return;
    }

    // Get the widget instance and unmount it properly
    const instance = Widget.getInstance(container as HTMLElement);
    if (instance) {
      instance.unmount();
    } else {
      console.warn(`[TrestaWidget] No widget instance found in container`);
    }
  },

  version: '1.0.0',
};

// Auto-initialize widgets on page load
if (typeof window !== 'undefined') {
  // Expose to global scope
  (window as any).TrestaWidget = TrestaWidget;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitialize);
  } else {
    // DOM is already ready, initialize immediately
    autoInitialize();
  }
}

export { Widget };
export type { WidgetConfig, WidgetInstance };
