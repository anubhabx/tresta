/**
 * Unit tests for auto-initialization loader
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { autoInitialize } from '../loader';

describe('Loader - autoInitialize', () => {
  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  describe('Auto-initialization', () => {
    it('should initialize widget from script tag with data-widget-id', () => {
      // Create container
      const container = document.createElement('div');
      container.id = 'tresta-widget-auto-123';
      document.body.appendChild(container);

      // Create script tag
      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'auto-123');
      document.body.appendChild(script);

      autoInitialize();

      // Check that widget was mounted
      const root = container.querySelector('[data-tresta-widget]');
      expect(root).not.toBeNull();
      expect(root?.getAttribute('data-tresta-widget')).toBe('auto-123');
    });

    it('should initialize multiple widgets', () => {
      // Create containers
      const container1 = document.createElement('div');
      container1.id = 'tresta-widget-widget1';
      document.body.appendChild(container1);

      const container2 = document.createElement('div');
      container2.id = 'tresta-widget-widget2';
      document.body.appendChild(container2);

      // Create script tags
      const script1 = document.createElement('script');
      script1.setAttribute('data-widget-id', 'widget1');
      document.body.appendChild(script1);

      const script2 = document.createElement('script');
      script2.setAttribute('data-widget-id', 'widget2');
      document.body.appendChild(script2);

      autoInitialize();

      // Check that both widgets were mounted
      const root1 = container1.querySelector('[data-tresta-widget]');
      const root2 = container2.querySelector('[data-tresta-widget]');

      expect(root1?.getAttribute('data-tresta-widget')).toBe('widget1');
      expect(root2?.getAttribute('data-tresta-widget')).toBe('widget2');
    });

    it('should not initialize if no script tags found', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      autoInitialize();

      // Should not throw or log errors
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should skip already initialized widgets', () => {
      const container = document.createElement('div');
      container.id = 'tresta-widget-test-123';
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'test-123');
      script.setAttribute('data-debug', 'true');
      document.body.appendChild(script);

      const consoleSpy = vi.spyOn(console, 'log');

      // First initialization
      autoInitialize();

      // Second initialization
      autoInitialize();

      // Should log that widget is already initialized
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already initialized')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Configuration parsing', () => {
    it('should parse debug flag from data attribute', () => {
      const container = document.createElement('div');
      container.id = 'tresta-widget-debug-test';
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'debug-test');
      script.setAttribute('data-debug', 'true');
      document.body.appendChild(script);

      const consoleSpy = vi.spyOn(console, 'log');

      autoInitialize();

      // Should log initialization in debug mode
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget v1.0.0] Initialized with config:'),
        expect.objectContaining({
          widgetId: 'debug-test',
          debug: true,
        })
      );

      consoleSpy.mockRestore();
    });

    it('should parse telemetry flag from data attribute', () => {
      const container = document.createElement('div');
      container.id = 'tresta-widget-telemetry-test';
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'telemetry-test');
      script.setAttribute('data-telemetry', 'false');
      script.setAttribute('data-debug', 'true');
      document.body.appendChild(script);

      const consoleSpy = vi.spyOn(console, 'log');

      autoInitialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget v1.0.0] Initialized with config:'),
        expect.objectContaining({
          widgetId: 'telemetry-test',
          telemetry: false,
        })
      );

      consoleSpy.mockRestore();
    });

    it('should use default version if not specified', () => {
      const container = document.createElement('div');
      container.id = 'tresta-widget-version-test';
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'version-test');
      document.body.appendChild(script);

      autoInitialize();

      const root = container.querySelector('[data-tresta-widget]');
      expect(root?.getAttribute('data-version')).toBe('1.0.0');
    });

    it('should parse custom version from data attribute', () => {
      const container = document.createElement('div');
      container.id = 'tresta-widget-custom-version';
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'custom-version');
      script.setAttribute('data-version', '2.0.0');
      document.body.appendChild(script);

      autoInitialize();

      const root = container.querySelector('[data-tresta-widget]');
      expect(root?.getAttribute('data-version')).toBe('2.0.0');
    });
  });

  describe('Container selection', () => {
    it('should use existing container with matching ID', () => {
      const container = document.createElement('div');
      container.id = 'tresta-widget-existing';
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'existing');
      document.body.appendChild(script);

      autoInitialize();

      const root = container.querySelector('[data-tresta-widget]');
      expect(root).not.toBeNull();
    });

    it('should use custom container specified by data-container', () => {
      const customContainer = document.createElement('div');
      customContainer.id = 'my-custom-container';
      document.body.appendChild(customContainer);

      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'custom-container-test');
      script.setAttribute('data-container', '#my-custom-container');
      document.body.appendChild(script);

      autoInitialize();

      const root = customContainer.querySelector('[data-tresta-widget]');
      expect(root).not.toBeNull();
      expect(root?.getAttribute('data-tresta-widget')).toBe('custom-container-test');
    });

    it('should create inline container if none exists', () => {
      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'inline-test');
      document.body.appendChild(script);

      autoInitialize();

      // Should create container after script tag
      const container = document.getElementById('tresta-widget-inline-test');
      expect(container).not.toBeNull();

      const root = container?.querySelector('[data-tresta-widget]');
      expect(root).not.toBeNull();
    });

    it('should handle missing custom container gracefully', () => {
      const script = document.createElement('script');
      script.setAttribute('data-widget-id', 'missing-container');
      script.setAttribute('data-container', '#non-existent-container');
      document.body.appendChild(script);

      const consoleSpy = vi.spyOn(console, 'error');

      autoInitialize();

      // Should log error but not throw
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Failed to initialize widget:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle missing widget ID gracefully', () => {
      const script = document.createElement('script');
      // No data-widget-id attribute
      document.body.appendChild(script);

      const consoleSpy = vi.spyOn(console, 'error');

      autoInitialize();

      // Should not throw, but no widgets should be initialized
      expect(document.querySelectorAll('[data-tresta-widget]').length).toBe(0);

      consoleSpy.mockRestore();
    });

    it('should continue initializing other widgets if one fails', () => {
      // Widget 1 - will fail (missing container)
      const script1 = document.createElement('script');
      script1.setAttribute('data-widget-id', 'fail-widget');
      script1.setAttribute('data-container', '#non-existent');
      document.body.appendChild(script1);

      // Widget 2 - will succeed
      const container2 = document.createElement('div');
      container2.id = 'tresta-widget-success-widget';
      document.body.appendChild(container2);

      const script2 = document.createElement('script');
      script2.setAttribute('data-widget-id', 'success-widget');
      document.body.appendChild(script2);

      const consoleSpy = vi.spyOn(console, 'error');

      autoInitialize();

      // Widget 2 should be initialized despite widget 1 failing
      const root2 = container2.querySelector('[data-tresta-widget]');
      expect(root2).not.toBeNull();

      // Should have logged error for widget 1
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
