/**
 * Tresta Widget - Entry Point
 * Auto-initializes widgets from script tags with data-tresta-widget attribute
 */

import { TrestaWidget } from "./widget.ts";
import type { WidgetConfig } from "./types.ts";

// Export main class and types for programmatic usage
export { TrestaWidget };
export type * from "./types.ts";

// Global namespace for programmatic access
declare global {
  interface Window {
    TrestaWidget: typeof TrestaWidget;
    trestaWidgets: Map<string, TrestaWidget>;
  }
}

// Initialize global namespace
window.TrestaWidget = TrestaWidget;
window.trestaWidgets = window.trestaWidgets || new Map();

/**
 * Auto-initialize widgets from script tags
 */
function autoInitialize(): void {
  // Find all script tags with data-tresta-widget attribute
  const scripts = document.querySelectorAll("script[data-tresta-widget]");

  scripts.forEach((script) => {
    const widgetId = script.getAttribute("data-tresta-widget");
    if (!widgetId) return;

    // Skip if already initialized
    if (window.trestaWidgets.has(widgetId)) return;

    // Read configuration from data attributes
    const config: WidgetConfig = {
      widgetId,
      apiUrl: script.getAttribute("data-api-url") || undefined,
      container: script.getAttribute("data-container") || undefined,
    };

    // Parse theme overrides
    const primaryColor = script.getAttribute("data-primary-color");
    const backgroundColor = script.getAttribute("data-background-color");
    const textColor = script.getAttribute("data-text-color");
    const cardBackgroundColor = script.getAttribute(
      "data-card-background-color",
    );
    const borderRadius = script.getAttribute("data-border-radius");
    const fontFamily = script.getAttribute("data-font-family");

    if (
      primaryColor ||
      backgroundColor ||
      textColor ||
      cardBackgroundColor ||
      borderRadius ||
      fontFamily
    ) {
      config.theme = {
        ...(primaryColor && { primaryColor }),
        ...(backgroundColor && { backgroundColor }),
        ...(textColor && { textColor }),
        ...(cardBackgroundColor && { cardBackgroundColor }),
        ...(borderRadius && { borderRadius: parseInt(borderRadius, 10) }),
        ...(fontFamily && { fontFamily }),
      };
    }

    // Parse settings overrides
    const showRating = script.getAttribute("data-show-rating");
    const showDate = script.getAttribute("data-show-date");
    const showAuthorImage = script.getAttribute("data-show-author-image");
    const showAuthorRole = script.getAttribute("data-show-author-role");
    const showAuthorCompany = script.getAttribute("data-show-author-company");
    const autoplay = script.getAttribute("data-autoplay");
    const autoplaySpeed = script.getAttribute("data-autoplay-speed");
    const maxItems = script.getAttribute("data-max-items");

    if (
      showRating ||
      showDate ||
      showAuthorImage ||
      showAuthorRole ||
      showAuthorCompany ||
      autoplay ||
      autoplaySpeed ||
      maxItems
    ) {
      config.settings = {
        ...(showRating && { showRating: showRating === "true" }),
        ...(showDate && { showDate: showDate === "true" }),
        ...(showAuthorImage && { showAuthorImage: showAuthorImage === "true" }),
        ...(showAuthorRole && { showAuthorRole: showAuthorRole === "true" }),
        ...(showAuthorCompany && {
          showAuthorCompany: showAuthorCompany === "true",
        }),
        ...(autoplay && { autoplay: autoplay === "true" }),
        ...(autoplaySpeed && { autoplaySpeed: parseInt(autoplaySpeed, 10) }),
        ...(maxItems && { maxItems: parseInt(maxItems, 10) }),
      };
    }

    // Initialize widget
    try {
      const widget = new TrestaWidget(config);
      window.trestaWidgets.set(widgetId, widget);
    } catch (error) {
      console.error(`Failed to initialize Tresta widget ${widgetId}:`, error);
    }
  });
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInitialize);
} else {
  // DOM already loaded
  autoInitialize();
}

/**
 * Expose helper functions for manual widget management
 */
// Assign static methods to TrestaWidget class
TrestaWidget.init = (widgetId: string, config?: Partial<WidgetConfig>) => {
  const fullConfig: WidgetConfig = {
    widgetId,
    ...config,
  };

  const widget = new TrestaWidget(fullConfig);
  window.trestaWidgets.set(widgetId, widget);
  return widget;
};

TrestaWidget.destroy = (widgetId: string) => {
  const widget = window.trestaWidgets.get(widgetId);
  if (widget) {
    widget.destroy();
    window.trestaWidgets.delete(widgetId);
  }
};

TrestaWidget.refresh = async (widgetId: string) => {
  const widget = window.trestaWidgets.get(widgetId);
  if (widget) {
    await widget.refresh();
  }
};

TrestaWidget.refreshAll = async () => {
  const promises = Array.from(window.trestaWidgets.values()).map((widget) =>
    widget.refresh(),
  );
  await Promise.all(promises);
};

TrestaWidget.get = (widgetId: string) => {
  return window.trestaWidgets.get(widgetId) || null;
};

TrestaWidget.getAll = () => {
  return Array.from(window.trestaWidgets.values());
};
