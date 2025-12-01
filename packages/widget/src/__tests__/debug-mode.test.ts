/**
 * Integration tests for debug mode functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { Widget } from '../core/widget.js';
import type { WidgetConfig } from '../types/index.js';

describe('Debug Mode Integration', () => {
  let dom: JSDOM;
  let container: HTMLElement;
  let consoleDebugSpy: any;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document as any;
    global.window = dom.window as any;
    global.HTMLElement = dom.window.HTMLElement as any;

    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Spy on console methods
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Debug mode enabled', () => {
    it('should log initialization details when debug is true', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: true,
        version: '1.2.3',
      };

      new Widget(config);

      // Should log initialization with config details
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Initialized with config:',
        expect.objectContaining({
          widgetId: 'test-widget-123',
          debug: true,
        })
      );
    });

    it('should log telemetry status when debug is true', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: true,
        telemetry: true,
        version: '1.2.3',
      };

      new Widget(config);

      // Should log telemetry enabled status
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.2.3]',
        'Telemetry enabled:',
        true
      );
    });

    it('should include version number in all debug logs', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: true,
        version: '2.0.0',
      };

      new Widget(config);

      // All debug logs should include version
      const debugCalls = consoleDebugSpy.mock.calls;
      debugCalls.forEach((call: any[]) => {
        expect(call[0]).toMatch(/\[TrestaWidget v2\.0\.0\]/);
      });
    });

    it('should mask API key in debug logs', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345-secret',
        debug: true,
        version: '1.0.0',
      };

      new Widget(config);

      // API key should be masked
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.0.0]',
        'Initialized with config:',
        expect.objectContaining({
          apiKey: 'test-api-key-12...',
        })
      );
    });
  });

  describe('Debug mode disabled', () => {
    it('should NOT log debug messages when debug is false', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: false,
        version: '1.2.3',
      };

      new Widget(config);

      // Should not log any debug messages
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should NOT log debug messages when debug is undefined', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        version: '1.2.3',
      };

      new Widget(config);

      // Should not log any debug messages
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should still log errors when debug is false', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: false,
        version: '1.2.3',
      };

      const widget = new Widget(config);

      // Trigger an error by trying to render without content root
      (widget as any).renderContent({ testimonials: [], config: {} });

      // Errors should still be logged
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Version in logs', () => {
    it('should use provided version in logs', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: true,
        version: '3.1.4',
      };

      new Widget(config);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v3.1.4]',
        expect.any(String),
        expect.anything()
      );
    });

    it('should default to 1.0.0 when version is not provided', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: true,
      };

      new Widget(config);

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[TrestaWidget v1.0.0]',
        expect.any(String),
        expect.anything()
      );
    });
  });

  describe('Empty state logging', () => {
    it('should log empty state in debug mode', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: true,
        version: '1.0.0',
      };

      const widget = new Widget(config);

      // Mock the content root
      const contentRoot = document.createElement('div');
      (widget as any).contentRoot = contentRoot;

      // Render empty state
      (widget as any).renderContent({
        widgetId: 'test-widget-123',
        testimonials: [],
        config: {
          layout: { type: 'grid' },
          theme: { mode: 'light', primaryColor: '#000', secondaryColor: '#fff', cardStyle: 'default' },
          display: {
            showRating: true,
            showDate: true,
            showAvatar: true,
            showAuthorRole: true,
            showAuthorCompany: true,
          },
        },
      });

      // Should log empty state
      expect(consoleDebugSpy).toHaveBeenCalledWith('[TrestaWidget v1.0.0] empty');
    });

    it('should NOT log empty state when debug is disabled', () => {
      const config: WidgetConfig = {
        widgetId: 'test-widget-123',
        apiKey: 'test-api-key-12345',
        debug: false,
        version: '1.0.0',
      };

      const widget = new Widget(config);

      // Mock the content root
      const contentRoot = document.createElement('div');
      (widget as any).contentRoot = contentRoot;

      // Render empty state
      (widget as any).renderContent({
        widgetId: 'test-widget-123',
        testimonials: [],
        config: {
          layout: { type: 'grid' },
          theme: { mode: 'light', primaryColor: '#000', secondaryColor: '#fff', cardStyle: 'default' },
          display: {
            showRating: true,
            showDate: true,
            showAvatar: true,
            showAuthorRole: true,
            showAuthorCompany: true,
          },
        },
      });

      // Should NOT log empty state
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });
});
