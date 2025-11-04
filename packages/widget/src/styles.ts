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
  cardBackgroundColor: "#ffffff",
  borderRadius: 8,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  starColor: "#000000",
};

/**
 * Generates CSS string for widget styles
 */
export function generateStyles(
  theme: WidgetTheme,
  _layout: WidgetLayout,
  widgetId: string,
  settings?: any,
): string {
  const t = { ...DEFAULT_THEME, ...theme };
  const prefix = `.tresta-widget-${widgetId}`;
  const gap = settings?.gap || 24;
  const columns = settings?.columns || 2;

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
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
      transition: all 0.2s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    ${prefix} .tresta-testimonial:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-color: ${t.primaryColor}80;
    }

    ${prefix}.tresta-layout-grid .tresta-testimonial {
      margin-bottom: 0;
    }

    /* Rating Stars */
    ${prefix} .tresta-rating {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      line-height: 1;
    }

    ${prefix} .tresta-star {
      display: inline-block;
      width: 16px;
      height: 16px;
      min-width: 16px;
      min-height: 16px;
      max-width: 16px;
      max-height: 16px;
      color: ${t.starColor};
      fill: ${t.starColor};
      flex-shrink: 0;
    }

    ${prefix} .tresta-star-empty {
      color: #d1d5db;
      fill: #d1d5db;
    }

    /* Testimonial Content */
    ${prefix} .tresta-content {
      font-size: 14px;
      line-height: 1.625;
      color: ${t.textColor};
      margin-bottom: 16px;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Author Section */
    ${prefix} .tresta-author {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    ${prefix} .tresta-author-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background-color: ${t.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }

    ${prefix} .tresta-author-image.tresta-author-initials {
      /* Initials fallback - background color is set inline for unique colors */
      color: white;
      text-transform: uppercase;
    }

    ${prefix} .tresta-author-info {
      flex: 1;
      min-width: 0;
    }

    ${prefix} .tresta-author-name {
      font-weight: 600;
      font-size: 14px;
      color: ${t.textColor};
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ${prefix} .tresta-author-role {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ${prefix} .tresta-author-company {
      font-size: 12px;
      color: #9ca3af;
    }

    /* Date */
    ${prefix} .tresta-date {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 12px;
      text-align: left;
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
      gap: ${gap}px;
      align-items: stretch;
    }

    ${prefix}.tresta-layout-grid .tresta-testimonial {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    @media (min-width: 768px) {
      ${prefix}.tresta-layout-grid .tresta-testimonials {
        grid-template-columns: repeat(${Math.min(columns, 2)}, 1fr);
      }
    }

    @media (min-width: 1024px) {
      ${prefix}.tresta-layout-grid .tresta-testimonials {
        grid-template-columns: repeat(${columns}, 1fr);
      }
    }

    @media (max-width: 767px) {
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

    /* Layout: Carousel - New Enhanced Styles */
    ${prefix}.tresta-layout-carousel .tresta-carousel {
      position: relative;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }

    ${prefix} .tresta-carousel-container {
      width: 100%;
    }

    ${prefix} .tresta-carousel-wrapper {
      position: relative;
      padding: 0 70px;
    }

    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-wrapper {
        padding: 0 50px;
      }
    }

    ${prefix} .tresta-carousel-card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 60px 80px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: opacity 0.3s ease-in-out;
      min-height: 400px;
      display: flex;
      align-items: stretch;
    }

    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-card {
        padding: 40px 32px;
        min-height: 350px;
      }
    }

    ${prefix} .tresta-carousel-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
      flex: 1;
      min-height: 0;
    }

    ${prefix} .tresta-carousel-rating {
      display: flex;
      gap: 6px;
      justify-content: flex-start;
      flex-shrink: 0;
    }

    ${prefix} .tresta-carousel-star-filled {
      color: #000000;
    }

    ${prefix} .tresta-carousel-star-empty {
      color: #d1d5db;
    }

    ${prefix} .tresta-carousel-quote-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    ${prefix} .tresta-carousel-quote {
      font-size: 22px;
      line-height: 1.7;
      color: #1f2937;
      font-style: normal;
      margin: 0;
      font-weight: 400;
      overflow-y: auto;
      flex: 1;
    }

    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-quote {
        font-size: 18px;
      }
    }

    ${prefix} .tresta-carousel-author {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 8px;
      flex-shrink: 0;
    }

    ${prefix} .tresta-carousel-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background-color: #e5e7eb;
    }

    ${prefix} .tresta-carousel-avatar-initials {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
      color: white;
      text-transform: uppercase;
    }

    ${prefix} .tresta-carousel-author-info {
      flex: 1;
      min-width: 0;
    }

    ${prefix} .tresta-carousel-author-name {
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    ${prefix} .tresta-carousel-author-role {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    ${prefix} .tresta-carousel-date {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 12px;
      text-align: left;
    }

    /* Carousel Navigation Buttons */
    ${prefix} .tresta-carousel-nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: #1f2937;
      color: white;
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    ${prefix} .tresta-carousel-nav-button:hover {
      background-color: #374151;
      transform: translateY(-50%) scale(1.05);
    }

    ${prefix} .tresta-carousel-nav-button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.2);
    }

    ${prefix} .tresta-carousel-nav-prev {
      left: 16px;
    }

    ${prefix} .tresta-carousel-nav-next {
      right: 16px;
    }

    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-nav-button {
        width: 40px;
        height: 40px;
      }
    }

    /* Carousel Indicators */
    ${prefix} .tresta-carousel-indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 32px;
    }

    ${prefix} .tresta-carousel-indicator {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background-color: #d1d5db;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    ${prefix} .tresta-carousel-indicator:hover {
      background-color: #9ca3af;
    }

    ${prefix} .tresta-carousel-indicator-active {
      width: 48px;
      background-color: #1f2937;
    }

    /* Carousel Autoplay Toggle */
    ${prefix} .tresta-carousel-autoplay-container {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }

    ${prefix} .tresta-carousel-autoplay-toggle {
      background: none;
      border: none;
      color: #6b7280;
      font-size: 14px;
      cursor: pointer;
      padding: 8px 16px;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    ${prefix} .tresta-carousel-autoplay-toggle:hover {
      color: #1f2937;
    }

    /* Carousel Empty State */
    ${prefix} .tresta-carousel-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: #6b7280;
      text-align: center;
    }

    /* Layout: Wall (Minimal) */
    ${prefix}.tresta-layout-wall .tresta-testimonials {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
      width: 100%;
    }

    ${prefix}.tresta-layout-wall .tresta-testimonial {
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
