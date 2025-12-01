/**
 * Unit tests for global TrestaWidget API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TrestaWidget } from '../index.js';

describe('TrestaWidget Global API', () => {
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
  });

  describe('mount', () => {
    it('should mount widget using element reference', async () => {
      const instance = await TrestaWidget.mount(container, {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      });

      expect(instance).toBeDefined();
      expect(instance.getState().mounted).toBe(true);

      const root = container.querySelector('[data-tresta-widget]');
      expect(root).not.toBeNull();
    });

    it('should mount widget using CSS selector', async () => {
      const instance = await TrestaWidget.mount('#test-container', {
        widgetId: 'test-456',
        debug: false,
        version: '1.0.0',
      });

      expect(instance).toBeDefined();
      expect(instance.getState().mounted).toBe(true);

      const root = container.querySelector('[data-tresta-widget]');
      expect(root?.getAttribute('data-tresta-widget')).toBe('test-456');
    });

    it('should throw error if container not found', async () => {
      await expect(TrestaWidget.mount('#non-existent', {
        widgetId: 'test-789',
        debug: false,
        version: '1.0.0',
      })).rejects.toThrow('[TrestaWidget] Container not found: #non-existent');
    });

    it('should return widget instance with methods', async () => {
      const instance = await TrestaWidget.mount(container, {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      });

      expect(typeof instance.mount).toBe('function');
      expect(typeof instance.unmount).toBe('function');
      expect(typeof instance.refresh).toBe('function');
      expect(typeof instance.getState).toBe('function');
    });
  });

  describe('unmount', () => {
    it('should unmount widget using element reference', async () => {
      await TrestaWidget.mount(container, {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      });

      expect(container.querySelector('[data-tresta-widget]')).not.toBeNull();

      TrestaWidget.unmount(container);

      expect(container.querySelector('[data-tresta-widget]')).toBeNull();
    });

    it('should unmount widget using CSS selector', async () => {
      await TrestaWidget.mount('#test-container', {
        widgetId: 'test-456',
        debug: false,
        version: '1.0.0',
      });

      expect(container.querySelector('[data-tresta-widget]')).not.toBeNull();

      TrestaWidget.unmount('#test-container');

      expect(container.querySelector('[data-tresta-widget]')).toBeNull();
    });

    it('should warn if container not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      TrestaWidget.unmount('#non-existent');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Container not found: #non-existent')
      );

      consoleSpy.mockRestore();
    });

    it('should warn if no widget instance in container', () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      TrestaWidget.unmount(container);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] No widget instance found in container')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('version', () => {
    it('should expose version number', () => {
      expect(TrestaWidget.version).toBe('1.0.0');
    });
  });

  describe('Multiple instances', () => {
    it('should support mounting multiple widgets', async () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const instance1 = await TrestaWidget.mount(container1, {
        widgetId: 'widget-1',
        debug: false,
        version: '1.0.0',
      });

      const instance2 = await TrestaWidget.mount(container2, {
        widgetId: 'widget-2',
        debug: false,
        version: '1.0.0',
      });

      expect(instance1.getState().mounted).toBe(true);
      expect(instance2.getState().mounted).toBe(true);

      const root1 = container1.querySelector('[data-tresta-widget]');
      const root2 = container2.querySelector('[data-tresta-widget]');

      expect(root1?.getAttribute('data-tresta-widget')).toBe('widget-1');
      expect(root2?.getAttribute('data-tresta-widget')).toBe('widget-2');

      // Clean up
      TrestaWidget.unmount(container1);
      TrestaWidget.unmount(container2);
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });

    it('should maintain independent state for each instance', async () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const instance1 = await TrestaWidget.mount(container1, {
        widgetId: 'widget-1',
        debug: false,
        version: '1.0.0',
      });

      const instance2 = await TrestaWidget.mount(container2, {
        widgetId: 'widget-2',
        debug: false,
        version: '1.0.0',
      });

      // Unmount instance1
      TrestaWidget.unmount(container1);

      // instance1 should be unmounted, instance2 should still be mounted
      expect(instance1.getState().mounted).toBe(false);
      expect(instance2.getState().mounted).toBe(true);

      // Clean up
      TrestaWidget.unmount(container2);
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });
  });

  describe('Programmatic API', () => {
    it('should allow calling methods on returned instance', async () => {
      const instance = await TrestaWidget.mount(container, {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      });

      expect(instance.getState().mounted).toBe(true);

      // Call refresh
      await instance.refresh();

      // Call unmount
      instance.unmount();

      expect(instance.getState().mounted).toBe(false);
    });

    it('should allow remounting after unmount', async () => {
      const instance = await TrestaWidget.mount(container, {
        widgetId: 'test-123',
        debug: false,
        version: '1.0.0',
      });

      instance.unmount();
      expect(instance.getState().mounted).toBe(false);

      // Remount
      await instance.mount(container);
      expect(instance.getState().mounted).toBe(true);
    });
  });
});
