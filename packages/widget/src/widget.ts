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

      // Initialize carousel if needed
      if (this.widget?.layout === "carousel") {
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

    const css = generateStyles(theme, this.widget.layout, this.config.widgetId);
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

    const widgetHtml = renderWidget(
      this.testimonials,
      this.widget.layout,
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

    const settings = this.widget.settings;
    const itemsPerPage = settings.itemsPerPage || 1;

    // Find carousel elements
    const track = this.container.querySelector(
      ".tresta-carousel-track",
    ) as HTMLElement;
    const prevButton = this.container.querySelector(
      '[data-action="prev"]',
    ) as HTMLButtonElement;
    const nextButton = this.container.querySelector(
      '[data-action="next"]',
    ) as HTMLButtonElement;
    const dots = this.container.querySelectorAll(".tresta-carousel-dot");

    if (!track) return;

    const totalSlides = Math.ceil(this.testimonials.length / itemsPerPage);

    // Previous button handler
    prevButton?.addEventListener("click", () => {
      this.goToSlide(Math.max(0, this.currentSlide - 1));
    });

    // Next button handler
    nextButton?.addEventListener("click", () => {
      this.goToSlide(Math.min(totalSlides - 1, this.currentSlide + 1));
    });

    // Dot handlers
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.goToSlide(index);
      });
    });

    // Autoplay
    if (settings.autoplay) {
      const speed = settings.autoplaySpeed || 5000;
      this.startAutoplay(speed, totalSlides);

      // Pause on hover
      track.addEventListener("mouseenter", () => this.stopAutoplay());
      track.addEventListener("mouseleave", () =>
        this.startAutoplay(speed, totalSlides),
      );
    }
  }

  /**
   * Go to specific carousel slide
   */
  private goToSlide(index: number): void {
    if (!this.container) return;

    this.currentSlide = index;

    const track = this.container.querySelector(
      ".tresta-carousel-track",
    ) as HTMLElement;
    const dots = this.container.querySelectorAll(".tresta-carousel-dot");
    const prevButton = this.container.querySelector(
      '[data-action="prev"]',
    ) as HTMLButtonElement;
    const nextButton = this.container.querySelector(
      '[data-action="next"]',
    ) as HTMLButtonElement;

    if (!track) return;

    const itemsPerPage = this.widget?.settings.itemsPerPage || 1;
    const totalSlides = Math.ceil(this.testimonials.length / itemsPerPage);

    // Update track position
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
    track.setAttribute("data-current-index", String(index));

    // Update dots
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // Update button states
    if (prevButton) {
      prevButton.disabled = index === 0;
    }
    if (nextButton) {
      nextButton.disabled = index === totalSlides - 1;
    }
  }

  /**
   * Start carousel autoplay
   */
  private startAutoplay(speed: number, totalSlides: number): void {
    this.stopAutoplay(); // Clear any existing interval

    this.carouselInterval = window.setInterval(() => {
      const nextSlide = (this.currentSlide + 1) % totalSlides;
      this.goToSlide(nextSlide);
    }, speed);
  }

  /**
   * Stop carousel autoplay
   */
  private stopAutoplay(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  /**
   * Render HTML content to container
   */
  private render(html: string): void {
    if (!this.container) return;

    this.container.innerHTML = html;

    // Add layout class to container
    if (this.widget) {
      this.container.className = `tresta-widget-${this.config.widgetId} tresta-layout-${this.widget.layout}`;
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
    this.stopAutoplay();
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
