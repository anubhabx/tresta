/**
 * Main Widget class - orchestrates all widget functionality
 */

import type { WidgetConfig, WidgetInstance, WidgetState, WidgetData } from '../types';
import { WidgetError } from '../types';
import { StyleManager } from '../styles/style-manager';
import { APIClient } from '../api/client';
import { StorageManager } from '../storage/cache-manager';
import { createErrorState, createEmptyState } from '../components/error-state';
import { TelemetryTracker } from '../telemetry';
import { LayoutEngine } from '../layouts';
import { limitTestimonials } from '../utils/testimonial-limiter';
import { Logger } from '../utils/logger';

// Track all widget instances for proper cleanup and isolation
const widgetInstances = new WeakMap<HTMLElement, Widget>();

export class Widget implements WidgetInstance {
  private config: WidgetConfig;
  private state: WidgetState;
  private container: HTMLElement | null = null;
  private root: HTMLElement | null = null;
  private styleManager: StyleManager | null = null;
  private contentRoot: HTMLElement | null = null;
  private liveRegion: HTMLElement | null = null;
  private eventListeners: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];
  private currentLayout: { destroy: () => void } | null = null;
  private apiClient: APIClient;
  private storageManager: StorageManager;
  private telemetryTracker: TelemetryTracker;
  private logger: Logger;

  constructor(config: WidgetConfig) {
    this.config = config;
    this.state = {
      mounted: false,
      loading: false,
      error: null,
      data: null,
    };

    // Initialize logger
    this.logger = new Logger(
      config.widgetId,
      config.version || '1.0.0',
      config.debug || false
    );

    // Initialize API client with API key and custom base URL if provided
    const apiClientConfig = config.apiUrl ? { baseURL: config.apiUrl } : {};
    this.apiClient = new APIClient(apiClientConfig, config.apiKey, this.logger);
    this.storageManager = new StorageManager();

    // Initialize telemetry tracker
    this.telemetryTracker = new TelemetryTracker(
      config.widgetId,
      config.version || '1.0.0',
      {
        enabled: config.telemetry !== false,
      }
    );

    this.logger.debug('Initialized with config:', {
      widgetId: config.widgetId,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 15)}...` : 'NOT PROVIDED',
      apiUrl: config.apiUrl || 'default (https://api.tresta.com)',
      debug: config.debug,
      telemetry: config.telemetry,
      version: config.version,
    });
    this.logger.debug('Telemetry enabled:', this.telemetryTracker.isEnabled());
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
      
      // Add lang attribute for localization support
      if (this.config.lang) {
        this.root.setAttribute('lang', this.config.lang);
      }
      
      // Add role for semantic structure
      this.root.setAttribute('role', 'region');
      this.root.setAttribute('aria-label', 'Testimonials widget');

      // Initialize style manager and get content root
      this.styleManager = new StyleManager({
        debug: this.config.debug ?? false,
        theme: this.config.theme,
        ...(this.config.useShadowDOM !== undefined && { useShadowDOM: this.config.useShadowDOM }),
      });
      this.contentRoot = this.styleManager.initializeStyles(this.root);
      
      // Create ARIA live region for dynamic content announcements
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'tresta-sr-only';
      this.contentRoot.appendChild(this.liveRegion);

      container.appendChild(this.root);

      // Register this instance
      widgetInstances.set(container, this);

      // Fetch and render widget data
      await this.fetchAndRender();

      this.logger.debug('Mounted successfully to container', container);
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
      this.logger.debug('Starting fetchAndRender');

      this.state.loading = true;
      
      // Announce loading state to screen readers
      this.announceToScreenReader('Loading testimonials');

      // Try to fetch from API
      const data = await this.fetchWithFallback();

      this.logger.debug('Data fetched successfully:', {
        widgetId: data.widgetId,
        testimonialCount: data.testimonials?.length || 0,
      });

      this.state.data = data;
      this.state.error = null;
      this.state.loading = false;

      // Render the widget content
      this.renderContent(data);

      // Track successful load with layout type
      this.telemetryTracker.trackLoad(data.config?.layout?.type);
      
      // Announce successful load to screen readers
      const count = data.testimonials?.length || 0;
      this.announceToScreenReader(`${count} testimonial${count !== 1 ? 's' : ''} loaded`);

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
      
      // Announce error to screen readers
      this.announceToScreenReader('Failed to load testimonials', 'assertive');
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

      this.logger.debug('Fetched widget data from API');

      return data;
    } catch (error) {
      // Try to use cached data as fallback
      const cached = await this.storageManager.get(this.config.widgetId);

      if (cached) {
        this.logger.warn('Using cached data due to API error');
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
    this.logger.debug('renderContent called', {
      hasContentRoot: !!this.contentRoot,
      testimonialCount: data.testimonials?.length || 0,
      widgetData: data,
    });

    if (!this.contentRoot) {
      this.logger.error('No content root available for rendering');
      return;
    }

    // Clear existing content
    this.contentRoot.innerHTML = '';

    // Check if there are any testimonials
    if (!data.testimonials || data.testimonials.length === 0) {
      this.logger.logEmpty();
      this.renderEmptyState();
      return;
    }

    // Apply maxTestimonials limit before rendering
    // Check both layoutConfig and displayOptions for maxTestimonials
    const maxTestimonials = data.config.layout.maxTestimonials ?? data.config.display.maxTestimonials;
    const limitedTestimonials = limitTestimonials(data.testimonials, maxTestimonials);

    this.logger.debug(`Rendering ${limitedTestimonials.length} testimonials (limited from ${data.testimonials.length}) with layout: ${data.config.layout.type}`);

    // Clean up previous layout if exists
    if (this.currentLayout) {
      this.currentLayout.destroy();
      this.currentLayout = null;
    }

    // Use LayoutEngine to render the limited testimonials
    const layout = LayoutEngine.create({
      testimonials: limitedTestimonials,
      layoutConfig: data.config.layout,
      displayOptions: data.config.display,
      theme: data.config.theme,
    });

    const layoutElement = layout.render();
    this.contentRoot.appendChild(layoutElement);

    // Track the current layout for cleanup
    this.currentLayout = layout;

    this.logger.debug(`Widget rendered successfully with ${data.config.layout.type} layout`);
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
      version: this.config.version || "N/A",
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
    if (error instanceof WidgetError) {
      this.logger.error(
        `${context} for widget ${this.config.widgetId}:`,
        `[${error.code}]`,
        error.message
      );
    } else if (error instanceof Error) {
      this.logger.error(
        `${context} for widget ${this.config.widgetId}:`,
        error.message
      );
    } else {
      this.logger.error(
        `${context} for widget ${this.config.widgetId}:`,
        error
      );
    }
  }

  unmount(): void {
    try {
      // Clean up current layout (timers, event listeners, etc.)
      if (this.currentLayout) {
        this.currentLayout.destroy();
        this.currentLayout = null;
      }

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

      this.logger.debug('Unmounted successfully');
    } catch (error) {
      console.error('[TrestaWidget] Unmount failed:', error);
    }
  }

  async refresh(): Promise<void> {
    try {
      this.logger.debug('Refresh requested');

      if (!this.state.mounted) {
        this.logger.warn('Cannot refresh: widget not mounted');
        return;
      }

      // Fetch and render fresh data
      await this.fetchAndRender();
    } catch (error) {
      // Error is already handled in fetchAndRender
      // Just log for debugging
      this.logError('Refresh failed', error);
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
    return `${this.config.widgetId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Announces a message to screen readers via ARIA live region
   */
  private announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    if (!this.liveRegion) return;

    // Update the priority if needed
    this.liveRegion.setAttribute('aria-live', priority);

    // Update the message
    this.liveRegion.textContent = message;

    // Clear the message after a delay to allow for repeated announcements
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
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
