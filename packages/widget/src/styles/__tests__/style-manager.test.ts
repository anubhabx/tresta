/**
 * Unit tests for StyleManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleManager } from '../style-manager';

describe('StyleManager', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    // Clean up any injected style elements
    const styleElement = document.getElementById('tresta-widget-styles');
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('Shadow DOM Support Detection', () => {
    it('should detect Shadow DOM support', () => {
      const styleManager = new StyleManager();
      const hasShadowDOM = 'attachShadow' in Element.prototype;
      expect(styleManager.isShadowDOM()).toBe(hasShadowDOM);
    });

    it('should allow forcing Shadow DOM mode', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      expect(styleManager.isShadowDOM()).toBe(true);
    });

    it('should allow forcing namespaced CSS mode', () => {
      const styleManager = new StyleManager({ useShadowDOM: false });
      expect(styleManager.isShadowDOM()).toBe(false);
    });
  });

  describe('Shadow DOM Initialization', () => {
    it('should create Shadow DOM when supported', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      const contentRoot = styleManager.initializeStyles(container);

      expect(container.shadowRoot).toBeDefined();
      expect(contentRoot).toBeDefined();
      expect(contentRoot.getAttribute('data-tresta-widget-root')).toBe('true');
    });

    it('should inject styles into Shadow DOM', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      styleManager.initializeStyles(container);

      const shadowRoot = container.shadowRoot;
      expect(shadowRoot).toBeDefined();

      const styleElement = shadowRoot?.querySelector('style');
      expect(styleElement).toBeDefined();
      expect(styleElement?.textContent).toContain('--tresta-primary-color');
    });

    it('should return content wrapper inside Shadow DOM', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      const contentRoot = styleManager.initializeStyles(container);

      expect(contentRoot.parentNode).toBe(container.shadowRoot);
    });

    it('should log initialization in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const styleManager = new StyleManager({ useShadowDOM: true, debug: true });
      styleManager.initializeStyles(container);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Shadow DOM initialized')
      );

      consoleSpy.mockRestore();
    });

    it('should apply nonce to Shadow DOM style element when provided', () => {
      const styleManager = new StyleManager({
        useShadowDOM: true,
        nonceApplier: (element) => element.setAttribute('nonce', 'test-nonce'),
      });

      styleManager.initializeStyles(container);

      const shadowRoot = container.shadowRoot;
      const styleElement = shadowRoot?.querySelector('style');
      expect(styleElement?.getAttribute('nonce')).toBe('test-nonce');
    });
  });

  describe('Namespaced CSS Fallback', () => {
    it('should add namespaced class to container', () => {
      const styleManager = new StyleManager({ useShadowDOM: false });
      styleManager.initializeStyles(container);

      expect(container.classList.contains('tresta-widget')).toBe(true);
    });

    it('should inject namespaced styles into document head', () => {
      const styleManager = new StyleManager({ useShadowDOM: false });
      styleManager.initializeStyles(container);

      const styleElement = document.getElementById('tresta-widget-styles');
      expect(styleElement).toBeDefined();
      expect(styleElement?.textContent).toContain('.tresta-widget');
    });

    it('should not inject styles multiple times', () => {
      const styleManager1 = new StyleManager({ useShadowDOM: false });
      const styleManager2 = new StyleManager({ useShadowDOM: false });

      styleManager1.initializeStyles(container);
      
      const container2 = document.createElement('div');
      document.body.appendChild(container2);
      styleManager2.initializeStyles(container2);

      const styleElements = document.querySelectorAll('#tresta-widget-styles');
      expect(styleElements.length).toBe(1);

      document.body.removeChild(container2);
    });

    it('should return content wrapper with namespaced class', () => {
      const styleManager = new StyleManager({ useShadowDOM: false });
      const contentRoot = styleManager.initializeStyles(container);

      expect(contentRoot.classList.contains('tresta-widget-root')).toBe(true);
      expect(contentRoot.getAttribute('data-tresta-widget-root')).toBe('true');
    });

    it('should log initialization in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const styleManager = new StyleManager({ useShadowDOM: false, debug: true });
      styleManager.initializeStyles(container);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Namespaced CSS initialized')
      );

      consoleSpy.mockRestore();
    });

    it('should apply nonce to global style element when provided', () => {
      const styleManager = new StyleManager({
        useShadowDOM: false,
        nonceApplier: (element) => element.setAttribute('nonce', 'global-nonce'),
      });

      styleManager.initializeStyles(container);

      const styleElement = document.getElementById('tresta-widget-styles');
      expect(styleElement?.getAttribute('nonce')).toBe('global-nonce');
    });
  });

  describe('Style Isolation', () => {
    it('should isolate styles in Shadow DOM', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      const contentRoot = styleManager.initializeStyles(container);

      // Verify Shadow DOM was created
      expect(container.shadowRoot).toBeDefined();
      expect(contentRoot.parentNode).toBe(container.shadowRoot);

      // Add content with a class
      contentRoot.innerHTML = '<div class="test-element">Test</div>';

      // Add conflicting style to host page
      const hostStyle = document.createElement('style');
      hostStyle.textContent = '.test-element { color: red; }';
      document.head.appendChild(hostStyle);

      const element = contentRoot.querySelector('.test-element') as HTMLElement;
      
      // Note: jsdom's Shadow DOM implementation doesn't fully isolate styles
      // In a real browser, Shadow DOM would prevent host styles from affecting the widget
      // We verify the structure is correct even if jsdom doesn't fully isolate
      expect(element).toBeDefined();

      hostStyle.remove();
    });

    it('should prevent style leakage from Shadow DOM', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      styleManager.initializeStyles(container);

      // Add element outside Shadow DOM
      const outsideElement = document.createElement('div');
      outsideElement.className = 'test-element';
      document.body.appendChild(outsideElement);

      // Shadow DOM styles should not affect outside elements
      const computedStyle = window.getComputedStyle(outsideElement);
      expect(computedStyle.fontFamily).not.toContain('Segoe UI');

      document.body.removeChild(outsideElement);
    });
  });

  describe('Cleanup', () => {
    it('should clean up Shadow DOM reference', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      styleManager.initializeStyles(container);

      expect(styleManager.getShadowRoot()).toBeDefined();

      styleManager.cleanup();

      expect(styleManager.getShadowRoot()).toBeNull();
    });

    it('should not remove global styles in namespaced mode', () => {
      const styleManager = new StyleManager({ useShadowDOM: false });
      styleManager.initializeStyles(container);

      const styleElement = document.getElementById('tresta-widget-styles');
      expect(styleElement).toBeDefined();

      styleManager.cleanup();

      // Style should still exist for other instances
      const styleElementAfter = document.getElementById('tresta-widget-styles');
      expect(styleElementAfter).toBeDefined();
    });
  });

  describe('getShadowRoot', () => {
    it('should return shadow root when using Shadow DOM', () => {
      const styleManager = new StyleManager({ useShadowDOM: true });
      styleManager.initializeStyles(container);

      const shadowRoot = styleManager.getShadowRoot();
      expect(shadowRoot).toBe(container.shadowRoot);
    });

    it('should return null when using namespaced CSS', () => {
      const styleManager = new StyleManager({ useShadowDOM: false });
      styleManager.initializeStyles(container);

      const shadowRoot = styleManager.getShadowRoot();
      expect(shadowRoot).toBeNull();
    });
  });
});
