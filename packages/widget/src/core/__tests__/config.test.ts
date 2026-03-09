import { describe, expect, it } from 'vitest';

import { parseWidgetConfig, validateConfig } from '../config.js';

describe('widget config parser', () => {
  it('normalizes data attributes into widget config with defaults', () => {
    const script = document.createElement('script');
    script.setAttribute('data-widget-id', 'widget_123');
    script.setAttribute('data-api-key', 'api_key_123');

    const config = parseWidgetConfig(script);

    expect(config.widgetId).toBe('widget_123');
    expect(config.apiKey).toBe('api_key_123');
    expect(config.version).toBe('1.0.0');
    expect(config.debug).toBe(false);
    expect(config.telemetry).toBe(true);
  });

  it('parses explicit version/debug/telemetry/apiUrl/nonce values', () => {
    const script = document.createElement('script');
    script.setAttribute('data-widget-id', 'widget_123');
    script.setAttribute('data-api-key', 'api_key_123');
    script.setAttribute('data-version', '2.0.1');
    script.setAttribute('data-debug', 'true');
    script.setAttribute('data-telemetry', 'false');
    script.setAttribute('data-api-url', 'https://api.custom.test');
    script.setAttribute('nonce', 'nonce_123');

    const config = parseWidgetConfig(script);

    expect(config.version).toBe('2.0.1');
    expect(config.debug).toBe(true);
    expect(config.telemetry).toBe(false);
    expect(config.apiUrl).toBe('https://api.custom.test');
    expect(config.nonce).toBe('nonce_123');
  });
});

describe('widget config validator', () => {
  it('throws when widgetId is missing', () => {
    expect(() => validateConfig({ apiKey: 'api_key_123', version: '1.0.0' })).toThrow(
      '[TrestaWidget] widgetId is required',
    );
  });

  it('throws when apiKey is missing', () => {
    expect(() => validateConfig({ widgetId: 'widget_123', version: '1.0.0' })).toThrow(
      '[TrestaWidget] apiKey is required',
    );
  });

  it('passes for valid config', () => {
    expect(
      validateConfig({
        widgetId: 'widget_123',
        apiKey: 'api_key_123',
        version: '1.0.0',
      }),
    ).toBe(true);
  });
});
