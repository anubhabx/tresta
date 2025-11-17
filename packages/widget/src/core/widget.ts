/**
 * Main Widget class - orchestrates all widget functionality
 */

import type { WidgetConfig, WidgetInstance, WidgetState, WidgetData } from '../types';
import { WidgetError, WidgetErrorCode } from '../types';
import { StyleManager } from '../styles/style-manager';
import { APIClient } from '../api/client';
import { StorageManager } from '../storage/cache-manager';
import { createErrorState, createEmptyState } from '../components/error-state';
import { TelemetryTracker } from '../telemetry';

// Track all widget instances for proper cleanup and isolation
const widgetInstances = new WeakMap<HTMLElement, Widget>();

export class Widget implements WidgetInstance {
  private config: WidgetConfig;
  private state: WidgetState;
  private container: HTMLElement | null = null;
  private root: HTMLElement | null = null;
  private styleManager: StyleManager | null = null;
  private contentRoot: HTMLElement | null = null;
  private eventListeners: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];
  private apiClient: APIClient;
  private storageManager: StorageManager;
  private telemetryTracker: TelemetryTracker;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.state = {
      mounted: false,
      loading: false,
      error: null,
      data: null,
    };

    // Initialize API client and storage manager
    this.apiClient = new APIClient();
    this.storageManager = new StorageManager();

    // Initialize telemetry tracker
    this.telemetryTracker = new TelemetryTracker(
      config.widgetId,
      config.version || '1.0.0',
      {
        enabled: config.telemetry !== false,
      }
    );

    if (this.config.debug) {
      console.log(`[TrestaWidget v${this.config.version || '1.0.0'}] Initialized with config:`, config);
      console.log(`[TrestaWidget v${this.config.version || '1.0.0'}] Telemetry enabled:`, this.telemetryTracker.isEnabled());
    }
  }

  async mount(container: HTMLElement): Promise<void> {
    try {
      // Start telemetry load tracking
      this.telemetryTracker.startLoadTracking();

      // Check if widget is already mounted in this container
      if (widgetInstances.has(container)) {
        const existingWidget = widgetInstances.get(container);
        if (existingWidget && existingWidget !== this) {
          console.warn(`[TrestaWidget] Container already has a widget instance. Unmounting existing widget.`);
          existingWidget.unmount();
        }
      }

      this.container = container;
      this.state.mounted = true;
      this.state.loading = true;

      // Create widget root
      this.root = document.createElement('div');
      this.root.setAttribute('data-tresta-widget', this.config.widgetId);
      this.root.setAttribute('data-version', this.config.version || '1.0.0');
      this.root.setAttribute('data-instance-id', this.generateInstanceId());

      // Initialize style manager and get content root
      this.styleManager = new StyleManager({
        debug: this.config.debug ?? false,
        theme: this.config.theme,
      });
      this.contentRoot = this.styleManager.initializeStyles(this.root);

      container.appendChild(this.root);

      // Register this instance
      widgetInstances.set(container, this);

      // Fetch and render widget data
      await this.fetchAndRender();

      if (this.config.debug) {
        console.log(`[TrestaWidget] Mounted successfully to container`, container);
      }
    } catch (error) {
      this.state.loading = false;
      this.state.error = error as Error;
      
      // Track error in telemetry
      if (error instanceof WidgetError) {
        this.telemetryTracker.trackError(error.code);
      } else {
        this.telemetryTracker.trackError('MOUNT_ERROR');
      }
      
      // Log error with widget ID and version
      this.logError('Mount failed', error);
      
      // Render error state - don't throw to prevent breaking host page
      this.renderErrorState(error);
    }
  }

  /**
   * Fetch widget data with cache fallback
   */
  private async fetchAndRender(): Promise<void> {
    try {
      this.state.loading = true;
      
      // Try to fetch from API
      const data = await this.fetchWithFallback();
      
      this.state.data = data;
      this.state.error = null;
      this.state.loading = false;
      
      // Render the widget content
      this.renderContent(data);
      
      // Track successful load with layout type
      this.telemetryTracker.trackLoad(data.config?.layout?.type);
      
    } catch (error) {
      this.state.loading = false;
      this.state.error = error as Error;
      
      // Track error in telemetry
      if (error instanceof WidgetError) {
        this.telemetryTracker.trackError(error.code);
      } else {
        this.telemetryTracker.trackError('FETCH_ERROR');
      }
      
      // Log error with widget ID and version
      this.logError('Failed to fetch widget data', error);
      
      // Render error state
      this.renderErrorState(error);
    }
  }

  /**
   * Fetch widget data with cache fallback on errors
   */
  private async fetchWithFallback(): Promise<WidgetData> {
    try {
      // Fetch from API
      const data = await this.apiClient.fetchWidgetData(this.config.widgetId);
      
      // Cache the successful response
      await this.storageManager.set(this.config.widgetId, data);
      
      if (this.config.debug) {
        console.log(`[TrestaWidget v${this.config.version || '1.0.0'}] Fetched widget data from API`);
      }
      
      return data;
    } catch (error) {
      // Try to use cached data as fallback
      const cached = await this.storageManager.get(this.config.widgetId);
      
      if (cached) {
        console.warn(`[TrestaWidget v${this.config.version || '1.0.0'}] Using cached data due to API error`);
        return cached;
      }
      
      // No cache available, re-throw the error
      throw error;
    }
  }

  /**
   * Render widget content
   */
  private renderContent(data: WidgetData): void {
    if (!this.contentRoot) return;

    // Clear existing content
    this.contentRoot.innerHTML = '';

    // Check if there are any testimonials
    if (!data.testimonials || data.testimonials.length === 0) {
      if (this.config.debug) {
        console.log(`[TrestaWidget v${this.config.version || '1.0.0'}] empty`);
      }
      this.renderEmptyState();
      return;
    }

    // Create content wrapper with proper attributes
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-tresta-widget', this.config.widgetId);
    wrapper.className = 'tresta-widget-content';
    
    // Placeholder content for now - will be replaced by layout engine in future tasks
    wrapper.innerHTML = `
      <div class="widget-container">
        <p style="margin: 0; color: var(--tresta-secondary-color);">Tresta Widget (widgetId: ${this.config.widgetId})</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: var(--tresta-secondary-color);">
          Loaded ${data.testimonials.length} testimonial(s)
        </p>
      </div>
    `;

    this.contentRoot.appendChild(wrapper);
  }

  /**
   * Render error state
   */
  private renderErrorState(error: unknown): void {
    if (!this.contentRoot) return;

    // Clear existing content
    this.contentRoot.innerHTML = '';

    // Determine error message
    let message = this.config.errorMessage;
    
    if (!message) {
      if (error instanceof WidgetError) {
        message = error.message;
      } else {
        message = 'Unable to load testimonials. Please try again later.';
      }
    }

    // Create and append error state
    const errorState = createErrorState({
      type: 'error',
      message,
      widgetId: this.config.widgetId,
      version: this.config.version,
    });

    this.contentRoot.appendChild(errorState);
  }

  /**
   * Render empty state
   */
  private renderEmptyState(): void {
    if (!this.contentRoot) return;

    // Clear existing content
    this.contentRoot.innerHTML = '';

    // Create and append empty state
    const emptyState = createEmptyState(this.config.emptyMessage);

    this.contentRoot.appendChild(emptyState);
  }

  /**
   * Log error with widget ID and version
   */
  private logError(context: string, error: unknown): void {
    const version = this.config.version || '1.0.0';
    const widgetId = this.config.widgetId;
    
    if (error instanceof WidgetError) {
      console.error(
        `[TrestaWidget v${version}] ${context} for widget ${widgetId}:`,
        `[${error.code}]`,
        error.message
      );
    } else if (error instanceof Error) {
      console.error(
        `[TrestaWidget v${version}] ${context} for widget ${widgetId}:`,
        error.message
      );
    } else {
      console.error(
        `[TrestaWidget v${version}] ${context} for widget ${widgetId}:`,
        error
      );
    }
  }

  unmount(): void {
    try {
      // Remove all event listeners
      this.cleanupEventListeners();

      // Clean up style manager
      if (this.styleManager) {
        this.styleManager.cleanup();
        this.styleManager = null;
      }

      // Remove widget root from DOM
      if (this.root && this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
        this.root = null;
      }

      // Unregister instance
      if (this.container) {
        widgetInstances.delete(this.container);
      }

      this.state.mounted = false;
      this.container = null;
      this.contentRoot = null;
      
      if (this.config.debug) {
        console.log(`[TrestaWidget] Unmounted successfully`);
      }
    } catch (error) {
      console.error('[TrestaWidget] Unmount failed:', error);
    }
  }

  async refresh(): Promise<void> {
    try {
      if (this.config.debug) {
        console.log(`[TrestaWidget v${this.config.version || '1.0.0'}] Refresh requested`);
      }
      
      if (!this.state.mounted) {
        console.warn(`[TrestaWidget v${this.config.version || '1.0.0'}] Cannot refresh: widget not mounted`);
        return;
      }
      
      // Fetch and render fresh data
      await this.fetchAndRender();
    } catch (error) {
      // Error is already handled in fetchAndRender
      // Just log for debugging
      if (this.config.debug) {
        this.logError('Refresh failed', error);
      }
    }
  }

  getState(): WidgetState {
    return { ...this.state };
  }

  /**
   * Clean up all event listeners
   */
  private cleanupEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  /**
   * Generate a unique instance ID for this widget
   */
  private generateInstanceId(): string {
    return `${this.config.widgetId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the widget instance for a container
   */
  static getInstance(container: HTMLElement): Widget | undefined {
    return widgetInstances.get(container);
  }

  /**
   * Get the style manager (for testing)
   */
  getStyleManager(): StyleManager | null {
    return this.styleManager;
  }

  /**
   * Get the content root element (for testing)
   */
  getContentRoot(): HTMLElement | null {
    return this.contentRoot;
  }

  /**
   * Get the telemetry tracker (for testing and debugging)
   */
  getTelemetryTracker(): TelemetryTracker {
    return this.telemetryTracker;
  }
}
