/**
 * Centralized logging utility with debug mode support
 * 
 * In production builds, console.debug calls are automatically removed by Terser
 * via the drop_console configuration in vite.config.ts
 */

const WIDGET_VERSION = '1.0.0';

export class Logger {
  private widgetId: string;
  private version: string;
  private debugEnabled: boolean;

  constructor(widgetId: string, version: string = WIDGET_VERSION, debugEnabled: boolean = false) {
    this.widgetId = widgetId;
    this.version = version;
    this.debugEnabled = debugEnabled;
  }

  /**
   * Log debug messages (only in debug mode, tree-shaken in production)
   */
  debug(message: string, ...args: any[]): void {
    if (this.debugEnabled) {
      console.debug(`[TrestaWidget v${this.version}]`, message, ...args);
    }
  }

  /**
   * Log info messages (always shown)
   */
  info(message: string, ...args: any[]): void {
    console.log(`[TrestaWidget v${this.version}]`, message, ...args);
  }

  /**
   * Log warning messages (always shown)
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[TrestaWidget v${this.version}]`, message, ...args);
  }

  /**
   * Log error messages (always shown)
   */
  error(message: string, ...args: any[]): void {
    console.error(`[TrestaWidget v${this.version}]`, message, ...args);
  }

  /**
   * Log empty state (special case for requirement 20.4)
   */
  logEmpty(): void {
    if (this.debugEnabled) {
      console.debug(`[TrestaWidget v${this.version}] empty`);
    }
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.debugEnabled;
  }

  /**
   * Get the widget ID
   */
  getWidgetId(): string {
    return this.widgetId;
  }

  /**
   * Get the version
   */
  getVersion(): string {
    return this.version;
  }
}

const PREFIX = '[TrestaWidget]';

/**
 * Module-level logger for infrastructure code (storage, cache, telemetry)
 * that doesn't have access to a widget-specific Logger instance.
 *
 * All methods are intentionally non-throwing so callers can use them
 * inside catch blocks without risk.
 */
export const widgetLog = {
  debug: (message: string, ...args: unknown[]) =>
    console.debug(PREFIX, message, ...args),
  warn: (message: string, ...args: unknown[]) =>
    console.warn(PREFIX, message, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error(PREFIX, message, ...args),
} as const;
