/**
 * Tresta Widget - Main Class
 * Self-contained testimonial widget for CDN embedding
 */

import type {
  WidgetConfig,
  WidgetData,
  ApiResponse,
  Testimonial,
  Widget,
  WidgetSettings,
} from "./types.ts";
import {
  generateStyles,
  injectStyles,
  removeStyles,
  DEFAULT_THEME,
} from "./styles.ts";
import {
  renderWidget,
  renderLoading,
  renderError,
  renderBranding,
} from "./renderer.ts";
import { Carousel } from "./carousel.ts";

export class TrestaWidget {
  // Static methods for global widget management (implemented in index.ts)
  static init: (
    widgetId: string,
    config?: Partial<WidgetConfig>,
  ) => TrestaWidget = () => {
    throw new Error('TrestaWidget.init not initialized. Make sure the widget script is loaded.');
  };
  static destroy: (widgetId: string) => void = () => {
    throw new Error('TrestaWidget.destroy not initialized. Make sure the widget script is loaded.');
  };
  static refresh: (widgetId: string) => Promise<void> = async () => {
    throw new Error('TrestaWidget.refresh not initialized. Make sure the widget script is loaded.');
  };
  static refreshAll: () => Promise<void> = async () => {
    throw new Error('TrestaWidget.refreshAll not initialized. Make sure the widget script is loaded.');
  };
  static get: (widgetId: string) => TrestaWidget | null = () => {
    throw new Error('TrestaWidget.get not initialized. Make sure the widget script is loaded.');
  };
  static getAll: () => TrestaWidget[] = () => {
    throw new Error('TrestaWidget.getAll not initialized. Make sure the widget script is loaded.');
  };
  private config: WidgetConfig;
  private container: HTMLElement | null = null;
  private widget: Widget | null = null;
  private testimonials: Testimonial[] = [];
  private carouselInterval: number | null = null;
  private currentSlide: number = 0;
  private effectiveLayout: string | null = null; // Store the effective layout being used

  constructor(config: WidgetConfig) {
    this.config = {
      apiUrl: "http://localhost:8000",
      ...config,
    };

    this.init();
  }

  /**
   * Initialize the widget
   */
  private async init(): Promise<void> {
    try {
      // Find or create container
      this.container = this.findContainer();
      if (!this.container) {
        throw new Error("Widget container not found");
      }

      // Show loading state
      this.render(renderLoading());

      // Fetch widget data
      await this.fetchWidgetData();

      // Inject styles
      this.injectWidgetStyles();

      // Render widget
      this.renderWidget();

      // Initialize carousel if needed (check config first, then widget.layout)
      const layout = this.config.settings?.layout || this.widget?.layout;
      if (layout === "carousel") {
        this.initCarousel();
      }

      // Call onLoad callback
      if (this.config.onLoad && this.widget) {
        this.config.onLoad(this.widget);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Find the container element
   */
  private findContainer(): HTMLElement | null {
    if (!this.config.container) {
      // Auto-detect container from script tag
      const scripts = document.querySelectorAll("script[data-tresta-widget]");
      const currentScript = Array.from(scripts).find(
        (script) =>
          script.getAttribute("data-tresta-widget") === this.config.widgetId,
      );

      if (currentScript) {
        const containerId = currentScript.getAttribute("data-container");
        if (containerId) {
          return document.getElementById(containerId);
        }

        // Create container after script tag
        const container = document.createElement("div");
        container.id = `tresta-widget-${this.config.widgetId}`;
        container.className = `tresta-widget-${this.config.widgetId}`;
        currentScript.parentNode?.insertBefore(
          container,
          currentScript.nextSibling,
        );
        return container;
      }

      // Fallback: create container in body
      const container = document.createElement("div");
      container.id = `tresta-widget-${this.config.widgetId}`;
      container.className = `tresta-widget-${this.config.widgetId}`;
      document.body.appendChild(container);
      return container;
    }

    if (typeof this.config.container === "string") {
      return document.querySelector(this.config.container);
    }

    return this.config.container;
  }

  /**
   * Fetch widget data from API
   */
  private async fetchWidgetData(): Promise<void> {
    const url = `${this.config.apiUrl}/api/widgets/${this.config.widgetId}/public`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch widget data: ${response.status} ${response.statusText}`,
      );
    }

    const result: ApiResponse<WidgetData> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to load widget data");
    }

    this.widget = result.data.widget;
    this.testimonials = result.data.testimonials || [];

    // Debug logging
    console.log('API Response:', {
      widget: this.widget,
      testimonials: this.testimonials,
    });
  }

  /**
   * Inject widget styles
   */
  private injectWidgetStyles(): void {
    if (!this.widget) return;

    const theme = {
      ...DEFAULT_THEME,
      ...this.widget.theme,
      ...this.config.theme,
    };

    const settings = {
      ...this.widget.settings,
      ...this.config.settings,
    };

    // Allow config to override layout
    const layout = this.config.settings?.layout || this.widget.layout;

    const css = generateStyles(theme, layout, this.config.widgetId, settings);
    injectStyles(css, this.config.widgetId);
  }

  /**
   * Render the widget content
   */
  private renderWidget(): void {
    if (!this.widget || !this.container) return;

    const settings: WidgetSettings = {
      ...this.widget.settings,
      ...this.config.settings,
    };

    // Allow config to override layout from database (useful for testing)
    const layout = this.config.settings?.layout || this.widget.layout;
    
    // Store effective layout for use in render()
    this.effectiveLayout = layout;

    // Debug logging
    console.log('Widget Settings:', {
      fromAPI: this.widget.settings,
      fromConfig: this.config.settings,
      merged: settings,
      layout: layout,
    });

    const widgetHtml = renderWidget(
      this.testimonials,
      layout,
      settings,
      this.config.widgetId,
    );

    // Check if branding should be shown (default true, can be disabled in premium)
    const showBranding = true; // Always show branding for now
    const brandingHtml = renderBranding(showBranding);

    const fullHtml = `
      <div class="tresta-widget-inner">
        ${widgetHtml}
        ${brandingHtml}
      </div>
    `;

    this.render(fullHtml);
  }

  /**
   * Initialize carousel functionality
   */
  private initCarousel(): void {
    if (!this.container || !this.widget) return;

    // Allow config to override layout
    const layout = this.config.settings?.layout || this.widget.layout;
    
    // Only initialize carousel if the layout is actually carousel
    if (layout !== 'carousel') return;

    const settings = this.widget.settings;

    // Find carousel container
    const carouselContainer = this.container.querySelector(
      ".tresta-carousel",
    ) as HTMLElement;

    if (!carouselContainer) return;

    // Map testimonials to carousel format
    const carouselTestimonials = this.testimonials.map(t => ({
      id: t.id,
      name: t.authorName || 'Anonymous',
      role: t.authorRole || '',
      company: t.authorCompany,
      content: t.content,
      avatar: t.authorAvatar,
      rating: t.rating,
    }));

    // Use enhanced Carousel class
    const carousel = new Carousel({
      container: carouselContainer,
      testimonials: carouselTestimonials,
      autoplay: settings.autoRotate ?? false,
      autoplaySpeed: settings.rotateInterval ?? 5000,
      showRating: settings.showRating ?? true,
      showCompany: settings.showAuthorCompany ?? true,
      onSlideChange: (index) => {
        this.currentSlide = index;
      },
    });

    // Store carousel instance for cleanup
    (this as any).carouselInstance = carousel;
  }



  /**
   * Render HTML content to container
   */
  private render(html: string): void {
    if (!this.container) return;

    this.container.innerHTML = html;

    // Add layout class to container - use effective layout if available
    if (this.widget) {
      const layoutClass = this.effectiveLayout || this.widget.layout;
      this.container.className = `tresta-widget-${this.config.widgetId} tresta-layout-${layoutClass}`;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error("Tresta Widget Error:", error);

    if (this.container) {
      this.render(renderError(error.message));
    }

    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  /**
   * Destroy the widget and clean up
   */
  public destroy(): void {
    // Destroy carousel instance if it exists
    if ((this as any).carouselInstance) {
      (this as any).carouselInstance.destroy();
      (this as any).carouselInstance = null;
    }

    removeStyles(this.config.widgetId);

    if (this.container) {
      this.container.innerHTML = "";
    }

    this.widget = null;
    this.testimonials = [];
    this.container = null;
  }

  /**
   * Refresh widget data
   */
  public async refresh(): Promise<void> {
    try {
      await this.fetchWidgetData();
      this.renderWidget();

      if (this.widget?.layout === "carousel") {
        this.initCarousel();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Get current widget data
   */
  public getWidget(): Widget | null {
    return this.widget;
  }

  /**
   * Get current testimonials
   */
  public getTestimonials(): Testimonial[] {
    return this.testimonials;
  }
}
