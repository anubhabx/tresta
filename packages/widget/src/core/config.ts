/**
 * Configuration parser and validator
 */

import type { WidgetConfig, ThemeConfig } from '../types/index.js';
import { ThemeManager } from '../styles/theme-manager.js';

function getWidgetId(element: HTMLElement): string | null {
  return (
    element.getAttribute('data-widget-id') ||
    element.getAttribute('data-tresta-widget')
  );
}

export function parseWidgetConfig(element: HTMLElement): Partial<WidgetConfig> {
  const widgetId = getWidgetId(element);
  const apiKey = element.getAttribute('data-api-key');
  const version = element.getAttribute('data-version');
  const apiUrl = element.getAttribute('data-api-url');
  const nonce = element.getAttribute('nonce');

  const config: Partial<WidgetConfig> = {
    debug: element.getAttribute('data-debug') === 'true',
    telemetry: element.getAttribute('data-telemetry') !== 'false',
  };

  if (widgetId) {
    config.widgetId = widgetId;
  }

  if (apiKey) {
    config.apiKey = apiKey;
  }

  if (version) {
    config.version = version;
  } else {
    config.version = '1.0.0';
  }

  if (apiUrl) {
    config.apiUrl = apiUrl;
  }

  if (nonce) {
    config.nonce = nonce;
  }

  // Parse theme configuration from data attributes
  const themeConfig = ThemeManager.parseThemeFromElement(element);
  if (Object.keys(themeConfig).length > 0) {
    config.theme = themeConfig as ThemeConfig;
  }

  return config;
}

export function validateConfig(config: Partial<WidgetConfig>): config is WidgetConfig {
  if (!config.widgetId) {
    throw new Error('[TrestaWidget] widgetId is required');
  }
  if (!config.apiKey) {
    throw new Error('[TrestaWidget] apiKey is required');
  }
  return true;
}
