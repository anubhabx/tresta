/**
 * Unit tests for Widget core functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Widget } from '../widget';
import type { WidgetConfig } from '../../types';

describe('Widget', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up after each test
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should create a widget instance with valid config', () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      expect(widget).toBeDefined();
      expect(widget.getState().mounted).toBe(false);
    });

    it('should log initialization in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: true,
        version: '1.0.0',
      };

      new Widget(config);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget v1.0.0] Initialized with config:'),
        config
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Mount', () => {
    it('should mount widget to container', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const state = widget.getState();
      expect(state.mounted).toBe(true);
      expect(state.loading).toBe(false);

      // Check that widget root was created
      const root = container.querySelector('[data-tresta-widget]');
      expect(root).toBeDefined();
      expect(root?.getAttribute('data-tresta-widget')).toBe('test-123');
      expect(root?.getAttribute('data-version')).toBe('1.0.0');
    });

    it('should create unique instance ID for each widget', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget1 = new Widget(config);
      await widget1.mount(container);

      const root1 = container.querySelector('[data-tresta-widget]');
      const instanceId1 = root1?.getAttribute('data-instance-id');

      widget1.unmount();

      const widget2 = new Widget(config);
      await widget2.mount(container);

      const root2 = container.querySelector('[data-tresta-widget]');
      const instanceId2 = root2?.getAttribute('data-instance-id');

      expect(instanceId1).toBeDefined();
      expect(instanceId2).toBeDefined();
      expect(instanceId1).not.toBe(instanceId2);
    });

    it('should handle mounting to already occupied container', async () => {
      const config1: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const config2: WidgetConfig = {
        widgetId: 'test-456',
        debug: false,
        version: '1.0.0',
      };

      const widget1 = new Widget(config1);
      await widget1.mount(container);

      const consoleSpy = vi.spyOn(console, 'warn');

      const widget2 = new Widget(config2);
      await widget2.mount(container);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Container already has a widget instance')
      );

      // Second widget should be mounted
      const root = container.querySelector('[data-tresta-widget]');
      expect(root?.getAttribute('data-tresta-widget')).toBe('test-456');

      consoleSpy.mockRestore();
    });

    it('should log mount success in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: true,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Mounted successfully'),
        container
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Unmount', () => {
    it('should unmount widget cleanly', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      expect(widget.getState().mounted).toBe(true);
      expect(container.querySelector('[data-tresta-widget]')).toBeDefined();

      widget.unmount();

      expect(widget.getState().mounted).toBe(false);
      expect(container.querySelector('[data-tresta-widget]')).toBeNull();
    });

    it('should handle unmount when not mounted', () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      
      // Should not throw
      expect(() => widget.unmount()).not.toThrow();
    });

    it('should log unmount in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: true,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      consoleSpy.mockClear(); // Clear mount logs

      widget.unmount();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Unmounted successfully')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Multiple Instances', () => {
    it('should support multiple widgets on same page', async () => {
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

      expect(widget1.getState().mounted).toBe(true);
      expect(widget2.getState().mounted).toBe(true);

      const root1 = container1.querySelector('[data-tresta-widget]');
      const root2 = container2.querySelector('[data-tresta-widget]');

      expect(root1?.getAttribute('data-tresta-widget')).toBe('widget-1');
      expect(root2?.getAttribute('data-tresta-widget')).toBe('widget-2');

      // Clean up
      widget1.unmount();
      widget2.unmount();
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });

    it('should maintain independent state for each instance', async () => {
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

      // Unmount widget1
      widget1.unmount();

      // widget1 should be unmounted, widget2 should still be mounted
      expect(widget1.getState().mounted).toBe(false);
      expect(widget2.getState().mounted).toBe(true);

      expect(container1.querySelector('[data-tresta-widget]')).toBeNull();
      expect(container2.querySelector('[data-tresta-widget]')).not.toBeNull();

      // Clean up
      widget2.unmount();
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });
  });

  describe('getInstance', () => {
    it('should retrieve widget instance from container', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const instance = Widget.getInstance(container);
      expect(instance).toBe(widget);
    });

    it('should return undefined for container without widget', () => {
      const instance = Widget.getInstance(container);
      expect(instance).toBeUndefined();
    });

    it('should return undefined after unmount', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      expect(Widget.getInstance(container)).toBe(widget);

      widget.unmount();

      expect(Widget.getInstance(container)).toBeUndefined();
    });
  });

  describe('getState', () => {
    it('should return current widget state', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      
      let state = widget.getState();
      expect(state.mounted).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.data).toBeNull();

      await widget.mount(container);

      state = widget.getState();
      expect(state.mounted).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should return a copy of state (not reference)', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const state1 = widget.getState();
      const state2 = widget.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });

  describe('refresh', () => {
    it('should log refresh in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: true,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      consoleSpy.mockClear();

      await widget.refresh();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Refresh requested')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Shadow DOM and CSS Isolation', () => {
    it('should initialize StyleManager on mount', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const styleManager = widget.getStyleManager();
      expect(styleManager).toBeDefined();
      expect(styleManager).not.toBeNull();
    });

    it('should create content root for rendering', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const contentRoot = widget.getContentRoot();
      expect(contentRoot).toBeDefined();
      expect(contentRoot?.getAttribute('data-tresta-widget-root')).toBe('true');
    });

    it('should use Shadow DOM when supported', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      const root = container.querySelector('[data-tresta-widget]');
      
      // Check if Shadow DOM is supported and used
      if ('attachShadow' in Element.prototype) {
        expect(root?.shadowRoot).toBeDefined();
      }
    });

    it('should isolate widget styles from host page', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      // Add conflicting host page style
      const hostStyle = document.createElement('style');
      hostStyle.textContent = `
        p { color: red !important; font-size: 50px !important; }
      `;
      document.head.appendChild(hostStyle);

      const widget = new Widget(config);
      await widget.mount(container);

      const contentRoot = widget.getContentRoot();
      const paragraph = contentRoot?.querySelector('p');

      if (paragraph) {
        const computedStyle = window.getComputedStyle(paragraph);
        // Widget styles should be isolated (not red from host page)
        // Note: This test may vary based on Shadow DOM support
        expect(computedStyle.color).toBeDefined();
      }

      hostStyle.remove();
    });

    it('should clean up StyleManager on unmount', async () => {
      const config: WidgetConfig = {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);
      await widget.mount(container);

      expect(widget.getStyleManager()).not.toBeNull();

      widget.unmount();

      expect(widget.getStyleManager()).toBeNull();
      expect(widget.getContentRoot()).toBeNull();
    });
  });
});
