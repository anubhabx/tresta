/**
 * Tresta Widget Styles
 * Generates dynamic CSS styles for the widget based on theme configuration
 */

import type { WidgetTheme, WidgetLayout } from "./types.ts";

/**
 * Default theme values
 */
export const DEFAULT_THEME: WidgetTheme = {
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  cardBackgroundColor: "#f9fafb",
  borderRadius: 8,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  starColor: "#fbbf24",
};

/**
 * Generates CSS string for widget styles
 */
export function generateStyles(
  theme: WidgetTheme,
  _layout: WidgetLayout,
  widgetId: string,
): string {
  const t = { ...DEFAULT_THEME, ...theme };
  const prefix = `.tresta-widget-${widgetId}`;

  return `
    /* Base Widget Container */
    ${prefix} {
      font-family: ${t.fontFamily};
      color: ${t.textColor};
      background-color: ${t.backgroundColor};
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

    ${prefix} * {
      box-sizing: border-box;
    }

    /* Widget Inner Container */
    ${prefix} .tresta-widget-inner {
      width: 100%;
      padding: 0;
      margin: 0;
    }

    /* Loading State */
    ${prefix} .tresta-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: ${t.primaryColor};
      font-size: 16px;
    }

    ${prefix} .tresta-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid ${t.cardBackgroundColor};
      border-top-color: ${t.primaryColor};
      border-radius: 50%;
      animation: tresta-spin 0.8s linear infinite;
    }

    @keyframes tresta-spin {
      to { transform: rotate(360deg); }
    }

    /* Error State */
    ${prefix} .tresta-error {
      padding: 20px;
      background-color: #fee2e2;
      color: #991b1b;
      border-radius: ${t.borderRadius}px;
      text-align: center;
    }

    /* Empty State */
    ${prefix} .tresta-empty {
      padding: 40px;
      text-align: center;
      color: #6b7280;
    }

    /* Testimonial Card - Base */
    ${prefix} .tresta-testimonial {
      background-color: ${t.cardBackgroundColor};
      border-radius: ${t.borderRadius}px;
      padding: 24px;
      margin-bottom: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    ${prefix} .tresta-testimonial:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Rating Stars */
    ${prefix} .tresta-rating {
      color: ${t.starColor};
      font-size: 18px;
      margin-bottom: 12px;
      line-height: 1;
    }

    ${prefix} .tresta-star {
      display: inline-block;
      margin-right: 2px;
    }

    /* Testimonial Content */
    ${prefix} .tresta-content {
      font-size: 16px;
      line-height: 1.6;
      color: ${t.textColor};
      margin-bottom: 16px;
      flex: 1;
      font-style: italic;
    }

    /* Author Section */
    ${prefix} .tresta-author {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: auto;
    }

    ${prefix} .tresta-author-image {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background-color: ${t.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
    }

    ${prefix} .tresta-author-info {
      flex: 1;
      min-width: 0;
    }

    ${prefix} .tresta-author-name {
      font-weight: 600;
      font-size: 15px;
      color: ${t.textColor};
      margin: 0 0 4px 0;
    }

    ${prefix} .tresta-author-role {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    ${prefix} .tresta-author-company {
      font-size: 13px;
      color: #9ca3af;
    }

    /* Date */
    ${prefix} .tresta-date {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }

    /* Layout: List */
    ${prefix}.tresta-layout-list .tresta-testimonials {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Layout: Grid */
    ${prefix}.tresta-layout-grid .tresta-testimonials {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    @media (max-width: 768px) {
      ${prefix}.tresta-layout-grid .tresta-testimonials {
        grid-template-columns: 1fr;
      }
    }

    /* Layout: Masonry */
    ${prefix}.tresta-layout-masonry .tresta-testimonials {
      column-count: 3;
      column-gap: 20px;
    }

    ${prefix}.tresta-layout-masonry .tresta-testimonial {
      break-inside: avoid;
      margin-bottom: 20px;
    }

    @media (max-width: 1024px) {
      ${prefix}.tresta-layout-masonry .tresta-testimonials {
        column-count: 2;
      }
    }

    @media (max-width: 640px) {
      ${prefix}.tresta-layout-masonry .tresta-testimonials {
        column-count: 1;
      }
    }

    /* Layout: Carousel */
    ${prefix}.tresta-layout-carousel .tresta-carousel {
      position: relative;
      overflow: hidden;
    }

    ${prefix}.tresta-layout-carousel .tresta-carousel-track {
      display: flex;
      transition: transform 0.5s ease;
      gap: 20px;
    }

    ${prefix}.tresta-layout-carousel .tresta-testimonial {
      flex: 0 0 100%;
      max-width: 100%;
      margin-bottom: 0;
    }

    @media (min-width: 768px) {
      ${prefix}.tresta-layout-carousel .tresta-testimonial {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }
    }

    @media (min-width: 1024px) {
      ${prefix}.tresta-layout-carousel .tresta-testimonial {
        flex: 0 0 calc(33.333% - 14px);
        max-width: calc(33.333% - 14px);
      }
    }

    /* Carousel Controls */
    ${prefix} .tresta-carousel-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 24px;
    }

    ${prefix} .tresta-carousel-button {
      background-color: ${t.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.2s ease;
      font-size: 20px;
      line-height: 1;
    }

    ${prefix} .tresta-carousel-button:hover:not(:disabled) {
      opacity: 0.9;
      transform: scale(1.05);
    }

    ${prefix} .tresta-carousel-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    ${prefix} .tresta-carousel-dots {
      display: flex;
      gap: 8px;
    }

    ${prefix} .tresta-carousel-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #d1d5db;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    ${prefix} .tresta-carousel-dot:hover {
      background-color: #9ca3af;
    }

    ${prefix} .tresta-carousel-dot.active {
      background-color: ${t.primaryColor};
      transform: scale(1.2);
    }

    /* Layout: Wall (Minimal) */
    ${prefix}.tresta-layout-wall .tresta-testimonials {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    ${prefix}.tresta-layout-wall .tresta-testimonial {
      flex: 0 0 auto;
      max-width: 400px;
      padding: 16px;
      margin-bottom: 0;
    }

    ${prefix}.tresta-layout-wall .tresta-content {
      font-size: 14px;
      margin-bottom: 12px;
    }

    ${prefix}.tresta-layout-wall .tresta-author {
      gap: 8px;
    }

    ${prefix}.tresta-layout-wall .tresta-author-image {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }

    ${prefix}.tresta-layout-wall .tresta-author-name {
      font-size: 14px;
    }

    ${prefix}.tresta-layout-wall .tresta-author-role {
      font-size: 12px;
    }

    /* Fade-in Animation */
    ${prefix} .tresta-fade-in {
      animation: tresta-fadeIn 0.5s ease;
    }

    @keyframes tresta-fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      ${prefix} .tresta-testimonial {
        padding: 20px;
      }

      ${prefix} .tresta-content {
        font-size: 15px;
      }

      ${prefix} .tresta-author {
        gap: 10px;
      }

      ${prefix} .tresta-author-image {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
    }

    /* Branding (Optional) */
    ${prefix} .tresta-branding {
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }

    ${prefix} .tresta-branding a {
      color: ${t.primaryColor};
      text-decoration: none;
      font-weight: 500;
    }

    ${prefix} .tresta-branding a:hover {
      text-decoration: underline;
    }
  `;
}

/**
 * Injects styles into the document head
 */
export function injectStyles(css: string, widgetId: string): void {
  const styleId = `tresta-widget-styles-${widgetId}`;

  // Remove existing styles for this widget
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new style element
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Removes widget styles from the document
 */
export function removeStyles(widgetId: string): void {
  const styleId = `tresta-widget-styles-${widgetId}`;
  const style = document.getElementById(styleId);
  if (style) {
    style.remove();
  }
}
