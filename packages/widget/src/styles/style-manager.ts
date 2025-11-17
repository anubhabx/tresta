/**
 * Style Manager - Handles Shadow DOM and CSS isolation
 */

import baseStyles from './base.css?inline';
import testimonialCardStyles from '../components/testimonial-card.css?inline';
import carouselStyles from '../layouts/carousel.css?inline';

// Combine all styles
const BASE_STYLES = `${baseStyles}\n\n${testimonialCardStyles}\n\n${carouselStyles}`.trim();

export interface StyleManagerConfig {
  useShadowDOM?: boolean;
  debug?: boolean;
}

export class StyleManager {
  private shadowRoot: ShadowRoot | null = null;
  private useShadowDOM: boolean;
  private debug: boolean;

  constructor(config: StyleManagerConfig = {}) {
    this.useShadowDOM = config.useShadowDOM ?? this.detectShadowDOMSupport();
    this.debug = config.debug ?? false;

    if (this.debug) {
      console.log(`[TrestaWidget] StyleManager initialized with Shadow DOM: ${this.useShadowDOM}`);
    }
  }

  /**
   * Detect if Shadow DOM is supported
   */
  private detectShadowDOMSupport(): boolean {
    return 'attachShadow' in Element.prototype;
  }

  /**
   * Initialize styles for the widget
   * Returns the root element where content should be rendered
   */
  initializeStyles(container: HTMLElement): HTMLElement {
    if (this.useShadowDOM) {
      return this.initializeShadowDOM(container);
    } else {
      return this.initializeNamespacedCSS(container);
    }
  }

  /**
   * Initialize Shadow DOM with encapsulated styles
   */
  private initializeShadowDOM(container: HTMLElement): HTMLElement {
    // Attach shadow root
    this.shadowRoot = container.attachShadow({ mode: 'open' });

    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = this.getShadowDOMStyles();
    this.shadowRoot.appendChild(styleElement);

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.setAttribute('data-tresta-widget-root', 'true');
    this.shadowRoot.appendChild(contentWrapper);

    if (this.debug) {
      console.log('[TrestaWidget] Shadow DOM initialized');
    }

    return contentWrapper;
  }

  /**
   * Initialize namespaced CSS fallback for older browsers
   */
  private initializeNamespacedCSS(container: HTMLElement): HTMLElement {
    // Add namespaced class to container
    container.classList.add('tresta-widget');

    // Inject namespaced styles if not already present
    if (!document.getElementById('tresta-widget-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'tresta-widget-styles';
      styleElement.textContent = this.getNamespacedStyles();
      document.head.appendChild(styleElement);
    }

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.setAttribute('data-tresta-widget-root', 'true');
    contentWrapper.classList.add('tresta-widget-root');
    container.appendChild(contentWrapper);

    if (this.debug) {
      console.log('[TrestaWidget] Namespaced CSS initialized');
    }

    return contentWrapper;
  }

  /**
   * Get styles for Shadow DOM (no namespacing needed)
   */
  private getShadowDOMStyles(): string {
    return BASE_STYLES;
  }

  /**
   * Get namespaced styles for fallback mode
   */
  private getNamespacedStyles(): string {
    // Transform base styles to be namespaced
    // Replace :root with .tresta-widget
    // Replace [data-tresta-widget] with .tresta-widget-root
    let namespacedStyles = BASE_STYLES
      .replace(/:root\s*{/g, '.tresta-widget {')
      .replace(/\[data-tresta-widget\]/g, '.tresta-widget-root');

    // Add high specificity to prevent host page overrides
    namespacedStyles = `.tresta-widget { all: initial; }\n${namespacedStyles}`;

    return namespacedStyles;
  }

  /**
   * Clean up styles
   */
  cleanup(): void {
    this.shadowRoot = null;
    
    // Note: We don't remove the global style element in namespaced mode
    // because other widget instances might be using it
  }

  /**
   * Check if Shadow DOM is being used
   */
  isShadowDOM(): boolean {
    return this.useShadowDOM;
  }

  /**
   * Get the shadow root (if using Shadow DOM)
   */
  getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }
}
