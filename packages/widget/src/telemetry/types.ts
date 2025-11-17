/**
 * Telemetry type definitions
 */

export interface TelemetryEvent {
  widgetId: string;
  version: string;
  eventType: 'load' | 'error' | 'interaction';
  loadTime?: number;
  errorCode?: string;
  layoutType?: string;
  timestamp: number;
}

export interface TelemetryConfig {
  enabled: boolean;
  samplingRate: number;
  endpoint?: string;
}

export interface TelemetryData {
  widgetId: string;
  version: string;
  loadTime: number;
  layoutType?: string;
  errorCounts: Record<string, number>;
}
