/**
 * Telemetry tracker - collects anonymous usage and performance metrics
 * 
 * Privacy-first design:
 * - No PII collected
 * - Respects DNT (Do Not Track)
 * - 1% sampling by default
 * - Opt-out via data-telemetry="false"
 */

import type { TelemetryEvent, TelemetryConfig, TelemetryData } from './types.js';
import { TelemetrySampler } from './sampler.js';
import { WIDGET_TELEMETRY_ENDPOINT } from '../config/env.js';

export class TelemetryTracker {
  private config: TelemetryConfig;
  private sampler: TelemetrySampler;
  private errorCounts: Map<string, number> = new Map();
  private loadStartTime: number = 0;
  private widgetId: string;
  private version: string;
  private layoutType?: string;

  constructor(
    widgetId: string,
    version: string,
    config: Partial<TelemetryConfig> = {}
  ) {
    this.widgetId = widgetId;
    this.version = version;

    // Check if telemetry is disabled
    const telemetryDisabled = config.enabled === false;
    const dntEnabled = this.isDNTEnabled();

    this.config = {
      enabled: !telemetryDisabled && !dntEnabled,
      samplingRate: config.samplingRate ?? 0.01, // Default 1%
      endpoint: config.endpoint ?? WIDGET_TELEMETRY_ENDPOINT,
    };

    this.sampler = new TelemetrySampler(this.config.samplingRate);
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDNTEnabled(): boolean {
    // Check navigator.doNotTrack
    if (typeof navigator !== 'undefined') {
      const dnt = (navigator as any).doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;

      // DNT can be "1", "yes", or true
      if (dnt === '1' || dnt === 'yes' || dnt === true) {
        return true;
      }
    }

    return false;
  }

  /**
   * Start tracking widget load time
   */
  startLoadTracking(): void {
    if (!this.config.enabled) return;
    this.loadStartTime = performance.now();
  }

  /**
   * Track successful widget load
   */
  trackLoad(layoutType?: string): void {
    if (!this.config.enabled) return;
    if (!this.sampler.shouldSample()) return;

    this.layoutType = layoutType || 'unknown';
    const loadTime = this.loadStartTime > 0 ? performance.now() - this.loadStartTime : 0;

    const event: TelemetryEvent = {
      widgetId: this.widgetId,
      version: this.version,
      eventType: 'load',
      loadTime: Math.round(loadTime),
      layoutType: layoutType || 'unknown',
      timestamp: Date.now(),
    };

    this.send(event);
  }

  /**
   * Track an error
   */
  trackError(errorCode: string): void {
    if (!this.config.enabled) return;

    // Always track error counts locally (not sampled)
    const currentCount = this.errorCounts.get(errorCode) || 0;
    this.errorCounts.set(errorCode, currentCount + 1);

    // Only send error events if sampled
    if (!this.sampler.shouldSample()) return;

    const event: TelemetryEvent = {
      widgetId: this.widgetId,
      version: this.version,
      eventType: 'error',
      errorCode,
      timestamp: Date.now(),
    };

    this.send(event);
  }

  /**
   * Track an interaction
   */
  trackInteraction(layoutType?: string): void {
    if (!this.config.enabled) return;
    if (!this.sampler.shouldSample()) return;

    const event: TelemetryEvent = {
      widgetId: this.widgetId,
      version: this.version,
      eventType: 'interaction',
      layoutType: layoutType || this.layoutType || 'unknown',
      timestamp: Date.now(),
    };

    this.send(event);
  }

  /**
   * Get telemetry data summary (for debugging)
   */
  getTelemetryData(): TelemetryData {
    const loadTime = this.loadStartTime > 0 ? performance.now() - this.loadStartTime : 0;

    const errorCounts: Record<string, number> = {};
    this.errorCounts.forEach((count, code) => {
      errorCounts[code] = count;
    });

    return {
      widgetId: this.widgetId,
      version: this.version,
      loadTime: Math.round(loadTime),
      layoutType: this.layoutType || 'unknown',
      errorCounts,
    };
  }

  /**
   * Send telemetry event to server (non-blocking)
   */
  private send(event: TelemetryEvent): void {
    if (!this.config.enabled || !this.config.endpoint) return;

    // Use sendBeacon if available (non-blocking, survives page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
        navigator.sendBeacon(this.config.endpoint, blob);
      } catch (error) {
        // Silently fail - telemetry should never break the widget
        console.debug('[TrestaWidget] Telemetry sendBeacon failed:', error);
      }
    } else {
      // Fallback to fetch with keepalive
      try {
        fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          keepalive: true,
          // No credentials - this is anonymous telemetry
          credentials: 'omit',
        }).catch(() => {
          // Silently fail - telemetry should never break the widget
        });
      } catch (error) {
        // Silently fail - telemetry should never break the widget
        console.debug('[TrestaWidget] Telemetry fetch failed:', error);
      }
    }
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update sampling rate (for per-account settings)
   */
  setSamplingRate(rate: number): void {
    this.config.samplingRate = rate;
    this.sampler.setSamplingRate(rate);
  }

  /**
   * Disable telemetry
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Enable telemetry (respects DNT)
   */
  enable(): void {
    if (!this.isDNTEnabled()) {
      this.config.enabled = true;
    }
  }
}
