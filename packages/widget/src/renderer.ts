/**
 * Tresta Widget Renderer
 * Handles rendering of testimonials in different layouts
 */

import type { Testimonial, WidgetSettings, WidgetLayout } from "./types.ts";

/**
 * Renders a single testimonial card
 */
export function renderTestimonial(
  testimonial: Testimonial,
  settings: WidgetSettings,
): string {
  const {
    showRating,
    showDate,
    showAvatar, // This is the actual field name from database
    showAuthorRole,
    showAuthorCompany,
  } = settings;

  // Generate rating stars
  const ratingHtml = showRating
    ? `<div class="tresta-rating">
         ${Array.from({ length: 5 })
        .map((_, i) =>
          i < (testimonial.rating || 5)
            ? '<svg class="tresta-star" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
            : '<svg class="tresta-star tresta-star-empty" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
        )
        .join("")}
       </div>`
    : "";

  // Generate author image or initials
  let authorImageHtml = "";
  if (showAvatar) {
    if (testimonial.authorAvatar) {
      authorImageHtml = `<img src="${escapeHtml(testimonial.authorAvatar)}" alt="${escapeHtml(testimonial.authorName)}" class="tresta-author-image" />`;
    } else {
      const initials = getInitials(testimonial.authorName);
      const backgroundColor = getColorFromName(testimonial.authorName);
      authorImageHtml = `<div class="tresta-author-image tresta-author-initials" style="background-color: ${backgroundColor}">${initials}</div>`;
    }
  }

  // Generate author role/company
  let authorMetaHtml = "";
  if (showAuthorRole && testimonial.authorRole) {
    authorMetaHtml = `<p class="tresta-author-role">${escapeHtml(testimonial.authorRole)}${showAuthorCompany && testimonial.authorCompany
        ? ` <span class="tresta-author-company">at ${escapeHtml(testimonial.authorCompany)}</span>`
        : ""
      }</p>`;
  } else if (showAuthorCompany && testimonial.authorCompany) {
    authorMetaHtml = `<p class="tresta-author-role"><span class="tresta-author-company">${escapeHtml(testimonial.authorCompany)}</span></p>`;
  }

  // Generate date
  const dateHtml = showDate
    ? `<div class="tresta-date">${formatDate(testimonial.createdAt)}</div>`
    : "";

  return `
    <div class="tresta-testimonial tresta-fade-in" data-testimonial-id="${testimonial.id}">
      ${ratingHtml}
      <div class="tresta-content">"${escapeHtml(testimonial.content)}"</div>
      <div class="tresta-author">
        ${authorImageHtml}
        <div class="tresta-author-info">
          <p class="tresta-author-name">${escapeHtml(testimonial.authorName)}</p>
          ${authorMetaHtml}
        </div>
      </div>
      ${dateHtml}
    </div>
  `;
}

/**
 * Renders testimonials in list layout
 */
export function renderListLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings,
): string {
  const items = testimonials
    .map((t) => renderTestimonial(t, settings))
    .join("");

  return `<div class="tresta-testimonials">${items}</div>`;
}

/**
 * Renders testimonials in grid layout
 */
export function renderGridLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings,
): string {
  const items = testimonials
    .map((t) => renderTestimonial(t, settings))
    .join("");

  return `<div class="tresta-testimonials">${items}</div>`;
}

/**
 * Renders testimonials in masonry layout
 */
export function renderMasonryLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings,
): string {
  const items = testimonials
    .map((t) => renderTestimonial(t, settings))
    .join("");

  return `<div class="tresta-testimonials">${items}</div>`;
}

/**
 * Renders testimonials in carousel layout
 * Note: The actual carousel content is rendered by the Carousel class
 */
export function renderCarouselLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings,
  widgetId: string,
): string {
  // Return an empty container that the Carousel class will populate
  return `<div class="tresta-carousel" data-widget-id="${widgetId}"></div>`;
}

/**
 * Renders testimonials in wall layout (minimal cards)
 */
export function renderWallLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings,
): string {
  const items = testimonials
    .map((t) => renderTestimonial(t, settings))
    .join("");

  return `<div class="tresta-testimonials">${items}</div>`;
}

/**
 * Main renderer - delegates to layout-specific renderer
 */
export function renderWidget(
  testimonials: Testimonial[],
  layout: WidgetLayout,
  settings: WidgetSettings,
  widgetId: string,
): string {
  if (!testimonials || testimonials.length === 0) {
    return '<div class="tresta-empty">No testimonials yet.</div>';
  }

  // Apply maxTestimonials setting
  const limitedTestimonials = settings.maxTestimonials
    ? testimonials.slice(0, settings.maxTestimonials)
    : testimonials;

  switch (layout) {
    case "carousel":
      return renderCarouselLayout(limitedTestimonials, settings, widgetId);
    case "grid":
      return renderGridLayout(limitedTestimonials, settings);
    case "masonry":
      return renderMasonryLayout(limitedTestimonials, settings);
    case "wall":
      return renderWallLayout(limitedTestimonials, settings);
    case "list":
    default:
      return renderListLayout(limitedTestimonials, settings);
  }
}

/**
 * Renders loading state
 */
export function renderLoading(): string {
  return `
    <div class="tresta-loading">
      <div class="tresta-spinner"></div>
    </div>
  `;
}

/**
 * Renders error state
 */
export function renderError(message: string): string {
  return `
    <div class="tresta-error">
      <p><strong>Unable to load testimonials</strong></p>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Renders branding footer (can be removed in premium plans)
 */
export function renderBranding(showBranding: boolean): string {
  if (!showBranding) return "";

  return `
    <div class="tresta-branding">
      Powered by <a href="https://tresta.io" target="_blank" rel="noopener">Tresta</a>
    </div>
  `;
}

// ==================== Utility Functions ====================

/**
 * Escapes HTML to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Gets initials from a name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() ?? "";
  }
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts[parts.length - 1]?.charAt(0) ?? "";
  return (first + last).toUpperCase();
}

/**
 * Generate a consistent color based on name
 * Uses a simple hash function to generate a hue value
 */
function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  } catch {
    return dateString;
  }
}
