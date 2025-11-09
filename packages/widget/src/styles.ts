/**
 * Tresta Widget Styles
 * Generates dynamic CSS styles for the widget based on theme configuration
 */

import type { WidgetTheme, WidgetLayout } from "./types.ts";

/**
 * Default theme values - Modern, clean aesthetic
 * These are fallback values used when properties aren't provided.
 * Only primaryColor and secondaryColor are customizable via the UI.
 * Other properties are reserved for future expansion.
 */
export const DEFAULT_THEME: WidgetTheme = {
  primaryColor: "#3b82f6",
  secondaryColor: "#3b82f6", // Falls back to primaryColor if not set
  backgroundColor: "transparent",
  textColor: "#1f2937",
  cardBackgroundColor: "#ffffff",
  borderRadius: 12,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  starColor: "#fbbf24", // Warm gold for stars
};

/**
 * Get theme-specific colors based on theme mode
 */
function getThemeColors(
  themeMode: "light" | "dark" | "auto" | undefined,
  customTheme: WidgetTheme,
) {
  // Determine effective theme mode
  let effectiveMode: "light" | "dark" = "light";

  if (themeMode === "dark") {
    effectiveMode = "dark";
  } else if (themeMode === "auto") {
    // Auto mode: detect system preference
    effectiveMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Base theme colors based on mode
  const baseColors =
    effectiveMode === "dark"
      ? {
          backgroundColor: "transparent",
          textColor: "#e5e7eb",
          cardBackgroundColor: "#1f2937",
          borderColor: "rgba(255, 255, 255, 0)",
          mutedTextColor: "#9ca3af",
          hoverShadow: "rgba(255, 255, 255, 0.1)",
        }
      : {
          backgroundColor: "transparent",
          textColor: "#1f2937",
          cardBackgroundColor: "#ffffff",
          borderColor: "rgba(0, 0, 0, 0.08)",
          mutedTextColor: "#6b7280",
          hoverShadow: "rgba(0, 0, 0, 0.08)",
        };

  // Return theme colors based on mode
  // Don't merge with customTheme for backgroundColor, textColor, cardBackgroundColor
  // as these should be determined by the theme mode, not overridden
  return baseColors;
}

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
  const themeColors = getThemeColors(settings?.theme, theme);
  const prefix = `.tresta-widget-${widgetId}`;
  const gap = settings?.gap || 24;
  const columns = settings?.columns || 2;
  const cardStyle = settings?.cardStyle || "default";
  const animation = settings?.animation || "fade";

  // Use secondaryColor if provided, otherwise derive from primaryColor
  const secondaryColor =
    settings?.secondaryColor || theme.secondaryColor || t.primaryColor;

  return `
    /* Base Widget Container */
    ${prefix} {
      font-family: ${t.fontFamily};
      color: ${themeColors.textColor};
      background-color: ${themeColors.backgroundColor};
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
      border: 3px solid ${themeColors.cardBackgroundColor};
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
      color: ${themeColors.mutedTextColor};
    }

    /* Testimonial Card - Base */
    ${prefix} .tresta-testimonial {
      background-color: ${themeColors.cardBackgroundColor};
      border: 1px solid ${themeColors.borderColor};
      border-radius: ${t.borderRadius}px;
      padding: 28px;
      margin-bottom: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
    }

    ${prefix} .tresta-testimonial:hover {
      box-shadow: 0 10px 25px -5px ${themeColors.hoverShadow}, 0 8px 10px -6px ${themeColors.hoverShadow};
      border-color: ${t.primaryColor}40;
      transform: translateY(-2px);
    }

    ${prefix}.tresta-layout-grid .tresta-testimonial {
      margin-bottom: 0;
    }

    /* Card Style: Minimal */
    ${prefix}.tresta-card-style-minimal .tresta-testimonial {
      box-shadow: none;
      border: 1px solid ${themeColors.borderColor};
      background-color: transparent;
    }

    ${prefix}.tresta-card-style-minimal .tresta-testimonial:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      background-color: ${themeColors.cardBackgroundColor};
    }

    /* Card Style: Bordered */
    ${prefix}.tresta-card-style-bordered .tresta-testimonial {
      border: 2px solid ${t.primaryColor}20;
      box-shadow: none;
    }

    ${prefix}.tresta-card-style-bordered .tresta-testimonial:hover {
      border-color: ${t.primaryColor};
      box-shadow: 0 4px 12px ${t.primaryColor}15;
    }

    /* Rating Stars */
    ${prefix} .tresta-rating {
      display: flex;
      gap: 3px;
      margin-bottom: 18px;
      line-height: 1;
    }

    ${prefix} .tresta-star {
      display: inline-block;
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
      max-width: 18px;
      max-height: 18px;
      color: ${t.starColor};
      fill: ${t.starColor};
      flex-shrink: 0;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
    }

    ${prefix} .tresta-star-empty {
      color: #e5e7eb;
      fill: #e5e7eb;
      filter: none;
    }

    /* Testimonial Content */
    ${prefix} .tresta-content {
      font-size: 15px;
      line-height: 1.7;
      color: ${themeColors.textColor};
      margin-bottom: 20px;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
      opacity: 0.95;
    }

    /* Author Section */
    ${prefix} .tresta-author {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid ${themeColors.borderColor};
    }

    ${prefix} .tresta-author-image {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background-color: ${t.primaryColor};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 17px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
      font-size: 15px;
      color: ${themeColors.textColor};
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    ${prefix} .tresta-verified-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: ${secondaryColor};
      border-radius: 50%;
      width: 18px;
      height: 18px;
      padding: 0;
    }

    ${prefix} .tresta-verified-badge svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 1px 2px ${secondaryColor}33);
    }

    ${prefix} .tresta-author-role {
      font-size: 13px;
      color: ${themeColors.mutedTextColor};
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ${prefix} .tresta-author-company {
      font-size: 12px;
      color: ${themeColors.mutedTextColor};
    }

    /* Date */
    ${prefix} .tresta-date {
      font-size: 12px;
      color: ${themeColors.mutedTextColor};
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
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
      column-gap: ${gap}px;
    }

    ${prefix}.tresta-layout-masonry .tresta-testimonial {
      break-inside: avoid;
      margin-bottom: ${gap}px;
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

    /* Layout: Carousel - Enhanced Flexbox Layout */
    ${prefix}.tresta-layout-carousel .tresta-carousel {
      position: relative;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
    }

    ${prefix} .tresta-carousel-container {
      width: 100%;
    }

    ${prefix} .tresta-carousel-wrapper {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
    }

    /* Hide navigation buttons on mobile (touch enabled) */
    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-wrapper {
        gap: 0;
      }
      
      ${prefix} .tresta-carousel-nav-button {
        display: none !important;
      }
    }

    ${prefix} .tresta-carousel-card {
      background-color: ${themeColors.cardBackgroundColor};
      border: 1px solid ${themeColors.borderColor};
      border-radius: ${t.borderRadius}px;
      padding: 48px 60px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: opacity 0.3s ease-in-out;
      min-height: 400px;
      display: flex;
      align-items: stretch;
      flex: 1;
      width: 100%;
    }

    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-card {
        padding: 32px 24px;
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
      gap: 4px;
      justify-content: flex-start;
      flex-shrink: 0;
    }

    ${prefix} .tresta-carousel-star-filled {
      color: ${t.starColor};
    }

    ${prefix} .tresta-carousel-star-empty {
      color: #e5e7eb;
    }

    ${prefix} .tresta-carousel-quote-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    ${prefix} .tresta-carousel-quote {
      font-size: 20px;
      line-height: 1.7;
      color: ${themeColors.textColor};
      font-style: normal;
      margin: 0;
      font-weight: 400;
      overflow-y: auto;
      flex: 1;
    }

    @media (max-width: 768px) {
      ${prefix} .tresta-carousel-quote {
        font-size: 17px;
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
      font-size: 15px;
      color: ${themeColors.textColor};
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    ${prefix} .tresta-carousel-author-role {
      font-size: 13px;
      color: ${themeColors.mutedTextColor};
      margin: 0;
    }

    ${prefix} .tresta-carousel-date {
      font-size: 12px;
      color: ${themeColors.mutedTextColor};
      margin-top: 12px;
      text-align: left;
    }

    /* Carousel Navigation Buttons - Flexbox Layout */
    ${prefix} .tresta-carousel-nav-button {
      background-color: ${themeColors.cardBackgroundColor};
      color: ${themeColors.textColor};
      border: 1px solid ${themeColors.borderColor};
      border-radius: 50%;
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    ${prefix} .tresta-carousel-nav-button:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      background-color: ${t.primaryColor};
      color: white;
      border-color: ${t.primaryColor};
    }

    ${prefix} .tresta-carousel-nav-button:focus {
      outline: none;
      box-shadow: 0 0 0 3px ${t.primaryColor}40;
    }

    ${prefix} .tresta-carousel-nav-button:active {
      transform: scale(0.95);
    }

    /* Carousel Indicators */
    ${prefix} .tresta-carousel-indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
    }

    ${prefix} .tresta-carousel-indicator {
      width: 32px;
      height: 4px;
      border-radius: 2px;
      background-color: ${t.primaryColor}50;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    ${prefix} .tresta-carousel-indicator:hover {
      background-color: ${secondaryColor}80;
    }

    ${prefix} .tresta-carousel-indicator-active {
      width: 48px;
      background-color: ${secondaryColor};
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
      color: ${themeColors.mutedTextColor};
      font-size: 14px;
      cursor: pointer;
      padding: 8px 16px;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    ${prefix} .tresta-carousel-autoplay-toggle:hover {
      color: ${themeColors.textColor};
    }

    /* Carousel Empty State */
    ${prefix} .tresta-carousel-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: ${themeColors.mutedTextColor};
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

    /* Animations */
    ${
      animation === "fade"
        ? `
    ${prefix} .tresta-animate {
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
    `
        : ""
    }

    ${
      animation === "slide"
        ? `
    ${prefix} .tresta-animate {
      animation: tresta-slideIn 0.5s ease;
    }

    @keyframes tresta-slideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    `
        : ""
    }

    ${
      animation === "none"
        ? `
    ${prefix} .tresta-animate {
      animation: none;
    }
    `
        : ""
    }

    /* Legacy fade-in class for backwards compatibility */
    ${prefix} .tresta-fade-in {
      animation: ${animation === "fade" ? "tresta-fadeIn 0.5s ease" : animation === "slide" ? "tresta-slideIn 0.5s ease" : "none"};
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
      color: ${secondaryColor};
      text-decoration: none;
      font-weight: 500;
    }

    ${prefix} .tresta-branding a:hover {
      text-decoration: underline;
      color: ${t.primaryColor};
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
