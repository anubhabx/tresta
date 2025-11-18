/**
 * Auto-initialization logic for widgets embedded via script tag
 */

import { Widget } from './widget';
import { parseWidgetConfig, validateConfig } from './config';
import type { WidgetConfig } from '../types';

/**
 * Parse configuration from data attributes on script tag or container
 */
function parseConfig(element: HTMLScriptElement | HTMLElement): WidgetConfig {
  const config = parseWidgetConfig(element);
  
  // Validate the configuration
  if (!validateConfig(config)) {
    throw new Error('[TrestaWidget] Invalid widget configuration');
  }
  
  return config;
}

/**
 * Find container for widget
 */
function findContainer(script: HTMLScriptElement, widgetId: string): HTMLElement {
  const containerSelector = script.getAttribute('data-container');
  
  if (containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      throw new Error(`[TrestaWidget] Container not found: ${containerSelector}`);
    }
    return container as HTMLElement;
  }

  // Look for div with matching widget ID
  const defaultContainer = document.getElementById(`tresta-widget-${widgetId}`);
  if (defaultContainer) {
    return defaultContainer;
  }

  // Create container inline after script tag
  const container = document.createElement('div');
  container.id = `tresta-widget-${widgetId}`;
  script.parentNode?.insertBefore(container, script.nextSibling);
  
  return container;
}

/**
 * Initialize a single widget from a script tag
 */
function initializeWidget(script: HTMLScriptElement): void {
  try {
    const config = parseConfig(script);
    const container = findContainer(script, config.widgetId);
    
    // Check if already initialized
    const existingInstance = Widget.getInstance(container);
    if (existingInstance) {
      if (config.debug) {
        console.debug(`[TrestaWidget v${config.version || '1.0.0'}] Widget ${config.widgetId} already initialized in container`);
      }
      return;
    }

    // Create and mount new widget instance
    const widget = new Widget(config);
    widget.mount(container);
  } catch (error) {
    console.error('[TrestaWidget] Failed to initialize widget:', error);
  }
}

/**
 * Auto-initialize all widgets on the page
 */
export function autoInitialize(): void {
  try {
    const scripts = document.querySelectorAll(
      'script[data-widget-id], script[data-tresta-widget]'
    );
    
    if (scripts.length === 0) {
      // No widgets to initialize
      return;
    }

    // Initialize each widget independently
    scripts.forEach((script) => {
      initializeWidget(script as HTMLScriptElement);
    });
  } catch (error) {
    console.error('[TrestaWidget] Auto-initialization failed:', error);
  }
}
