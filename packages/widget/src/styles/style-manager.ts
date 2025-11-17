/**
 * Style Manager - Handles Shadow DOM and CSS isolation
 */

// Base styles as a constant (will be replaced by Vite in production with actual CSS file)
const BASE_STYLES = `
:root {
  --tresta-primary-color: #3b82f6;
  --tresta-secondary-color: #64748b;
  --tresta-text-color: #1e293b;
  --tresta-bg-color: #ffffff;
  --tresta-border-color: #e2e8f0;
  --tresta-border-radius: 8px;
  --tresta-spacing: 16px;
  --tresta-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --tresta-theme-bg: #ffffff;
  --tresta-theme-text: #1e293b;
  --tresta-theme-border: #e2e8f0;
}

:root[data-theme="dark"] {
  --tresta-theme-bg: #1e293b;
  --tresta-theme-text: #f1f5f9;
  --tresta-theme-border: #334155;
}

[data-tresta-widget] {
  font-family: var(--tresta-font-family);
  color: var(--tresta-text-color);
  background-color: var(--tresta-bg-color);
  box-sizing: border-box;
  line-height: 1.5;
  font-size: 16px;
  all: revert;
  display: block;
}

[data-tresta-widget] *,
[data-tresta-widget] *::before,
[data-tresta-widget] *::after {
  box-sizing: border-box;
}

[data-tresta-widget] p,
[data-tresta-widget] h1,
[data-tresta-widget] h2,
[data-tresta-widget] h3,
[data-tresta-widget] h4,
[data-tresta-widget] h5,
[data-tresta-widget] h6 {
  margin: 0;
  padding: 0;
  font-weight: normal;
}

[data-tresta-widget] button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  color: inherit;
}

[data-tresta-widget] img {
  max-width: 100%;
  height: auto;
  display: block;
  border: none;
}

[data-tresta-widget] a {
  color: var(--tresta-primary-color);
  text-decoration: none;
}

[data-tresta-widget] a:hover {
  text-decoration: underline;
}

[data-tresta-widget] .widget-container {
  padding: var(--tresta-spacing);
  border: 2px solid var(--tresta-border-color);
  border-radius: var(--tresta-border-radius);
  background-color: var(--tresta-bg-color);
}

[data-tresta-widget] .widget-loading {
  text-align: center;
  color: var(--tresta-secondary-color);
  padding: var(--tresta-spacing);
}

[data-tresta-widget] .widget-error {
  text-align: center;
  color: #dc2626;
  padding: var(--tresta-spacing);
}

[data-tresta-widget] .widget-empty {
  text-align: center;
  color: var(--tresta-secondary-color);
  padding: var(--tresta-spacing);
}
`.trim();

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
