/**
 * Configuration parser and validator
 */

import type { WidgetConfig } from '../types';

export function parseWidgetConfig(element: HTMLElement): Partial<WidgetConfig> {
  const widgetId = element.getAttribute('data-widget-id');
  const version = element.getAttribute('data-version');
  
  const config: Partial<WidgetConfig> = {
    debug: element.getAttribute('data-debug') === 'true',
    telemetry: element.getAttribute('data-telemetry') !== 'false',
  };

  if (widgetId) {
    config.widgetId = widgetId;
  }

  if (version) {
    config.version = version;
  } else {
    config.version = '1.0.0';
  }

  return config;
}

export function validateConfig(config: Partial<WidgetConfig>): config is WidgetConfig {
  if (!config.widgetId) {
    throw new Error('[TrestaWidget] widgetId is required');
  }
  return true;
}
