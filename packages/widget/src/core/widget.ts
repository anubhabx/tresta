/**
 * Main Widget class - orchestrates all widget functionality
 */

import type { WidgetConfig, WidgetInstance, WidgetState } from '../types';

// Track all widget instances for proper cleanup and isolation
const widgetInstances = new WeakMap<HTMLElement, Widget>();

export class Widget implements WidgetInstance {
  private config: WidgetConfig;
  private state: WidgetState;
  private container: HTMLElement | null = null;
  private root: HTMLElement | null = null;
  private eventListeners: Array<{ element: HTMLElement; event: string; handler: EventListener }> = [];

  constructor(config: WidgetConfig) {
    this.config = config;
    this.state = {
      mounted: false,
      loading: false,
      error: null,
      data: null,
    };

    if (this.config.debug) {
      console.log(`[TrestaWidget v${this.config.version || '1.0.0'}] Initialized with config:`, config);
    }
  }

  async mount(container: HTMLElement): Promise<void> {
    try {
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
      
      // Placeholder content for now
      this.root.innerHTML = `
        <div style="padding: 20px; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #64748b;">Tresta Widget (widgetId: ${this.config.widgetId})</p>
          <p style="margin: 8px 0 0; font-size: 14px; color: #94a3b8;">Loading testimonials...</p>
        </div>
      `;

      container.appendChild(this.root);

      // Register this instance
      widgetInstances.set(container, this);

      this.state.loading = false;

      if (this.config.debug) {
        console.log(`[TrestaWidget] Mounted successfully to container`, container);
      }
    } catch (error) {
      this.state.loading = false;
      this.state.error = error as Error;
      console.error('[TrestaWidget] Mount failed:', error);
      throw error;
    }
  }

  unmount(): void {
    try {
      // Remove all event listeners
      this.cleanupEventListeners();

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
      
      if (this.config.debug) {
        console.log(`[TrestaWidget] Unmounted successfully`);
      }
    } catch (error) {
      console.error('[TrestaWidget] Unmount failed:', error);
    }
  }

  async refresh(): Promise<void> {
    if (this.config.debug) {
      console.log(`[TrestaWidget] Refresh requested`);
    }
    // TODO: Implement refresh logic in future tasks
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
}
