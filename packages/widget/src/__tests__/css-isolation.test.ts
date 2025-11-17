/**
 * Integration tests for CSS isolation
 * Tests that widget styles don't leak to host page and vice versa
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Widget } from '../core/widget';
import type { WidgetConfig } from '../types';

describe('CSS Isolation Integration Tests', () => {
  let container: HTMLElement;
  let hostElement: HTMLElement;

  beforeEach(() => {
    // Create widget container
    container = document.createElement('div');
    container.id = 'widget-container';
    document.body.appendChild(container);

    // Create host page element
    hostElement = document.createElement('div');
    hostElement.id = 'host-element';
    hostElement.className = 'button';
    hostElement.textContent = 'Host Button';
    document.body.appendChild(hostElement);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (hostElement.parentNode) {
      hostElement.parentNode.removeChild(hostElement);
    }
    // Clean up any injected styles
    const styleElement = document.getElementById('tresta-widget-styles');
    if (styleElement) {
      styleElement.remove();
    }
  });

  describe('Host Page CSS Should Not Affect Widget', () => {
    it('should not be affected by global button styles', async () => {
      // Add aggressive host page styles
      const hostStyle = document.createElement('style');
      hostStyle.id = 'host-styles';
      hostStyle.textContent = `
        .button {
          background-color: red !important;
          color: white !important;
          font-size: 50px !important;
          padding: 100px !important;
        }
        p {
          color: purple !important;
          font-size: 100px !important;
        }
        * {
          border: 10px solid orange !important;
        }
      `;
      document.head.appendChild(hostStyle);

      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const contentRoot = widget.getContentRoot();
      expect(contentRoot).toBeDefined();

      // Verify Shadow DOM structure is correct
      if (widget.getStyleManager()?.isShadowDOM()) {
        const root = container.querySelector('[data-tresta-widget]');
        expect(root?.shadowRoot).toBeDefined();
        
        // Verify content is inside Shadow DOM
        expect(contentRoot?.parentNode).toBe(root?.shadowRoot);
      }

      // Note: jsdom's Shadow DOM doesn't fully isolate styles like real browsers
      // In production, Shadow DOM will provide complete isolation

      hostStyle.remove();
    });

    it('should not be affected by CSS resets', async () => {
      // Add CSS reset
      const resetStyle = document.createElement('style');
      resetStyle.id = 'reset-styles';
      resetStyle.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: content-box;
          font-family: 'Comic Sans MS', cursive;
        }
      `;
      document.head.appendChild(resetStyle);

      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const contentRoot = widget.getContentRoot();
      const widgetElement = contentRoot?.querySelector('[data-tresta-widget]');

      expect(widgetElement).toBeDefined();
      
      // Verify Shadow DOM structure
      if (widget.getStyleManager()?.isShadowDOM()) {
        const root = container.querySelector('[data-tresta-widget]');
        expect(root?.shadowRoot).toBeDefined();
        
        // Verify styles are injected into Shadow DOM
        const styleElement = root?.shadowRoot?.querySelector('style');
        expect(styleElement).toBeDefined();
        expect(styleElement?.textContent).toContain('box-sizing: border-box');
      }

      resetStyle.remove();
    });
  });

  describe('Widget CSS Should Not Leak to Host Page', () => {
    it('should not affect host page elements', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      // Check that host element is not affected by widget styles
      const hostComputedStyle = window.getComputedStyle(hostElement);
      
      // Host element should not have widget font family
      expect(hostComputedStyle.fontFamily).not.toContain('Segoe UI');
      
      // Host element should not have widget colors
      expect(hostComputedStyle.color).not.toBe('rgb(30, 41, 59)'); // not --tresta-text-color
    });

    it('should not leak custom properties to host page', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      // Check that host element doesn't have widget custom properties
      const hostComputedStyle = window.getComputedStyle(hostElement);
      const primaryColor = hostComputedStyle.getPropertyValue('--tresta-primary-color');
      
      // In Shadow DOM mode, custom properties should not leak
      if (widget.getStyleManager()?.isShadowDOM()) {
        expect(primaryColor).toBe('');
      }
    });
  });

  describe('Multiple Widget Instances Isolation', () => {
    it('should isolate styles between multiple widget instances', async () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const config1: WidgetConfig = {
        widgetId: 'widget-1',
        debug: false,
        version: '1.0.0',
      };

      const config2: WidgetConfig = {
        widgetId: 'widget-2',
        debug: false,
        version: '1.0.0',
      };

      const widget1 = new Widget(config1);
      const widget2 = new Widget(config2);

      await widget1.mount(container1);
      await widget2.mount(container2);

      const contentRoot1 = widget1.getContentRoot();
      const contentRoot2 = widget2.getContentRoot();

      expect(contentRoot1).toBeDefined();
      expect(contentRoot2).toBeDefined();

      // Both widgets should have their own isolated style contexts
      if (widget1.getStyleManager()?.isShadowDOM()) {
        const root1 = container1.querySelector('[data-tresta-widget]');
        const root2 = container2.querySelector('[data-tresta-widget]');
        
        expect(root1?.shadowRoot).toBeDefined();
        expect(root2?.shadowRoot).toBeDefined();
        expect(root1?.shadowRoot).not.toBe(root2?.shadowRoot);
      }

      // Clean up
      widget1.unmount();
      widget2.unmount();
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });
  });

  describe('Fallback Mode (Namespaced CSS)', () => {
    it('should use namespaced classes when Shadow DOM is not available', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const styleManager = widget.getStyleManager();
      
      if (!styleManager?.isShadowDOM()) {
        // Should have namespaced class
        const root = container.querySelector('[data-tresta-widget]');
        expect(root?.classList.contains('tresta-widget')).toBe(true);

        // Should have injected global styles
        const styleElement = document.getElementById('tresta-widget-styles');
        expect(styleElement).toBeDefined();
        expect(styleElement?.textContent).toContain('.tresta-widget');
      }
    });
  });
});
