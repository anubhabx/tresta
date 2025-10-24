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
    showAuthorImage,
    showAuthorRole,
    showAuthorCompany,
  } = settings;

  // Generate rating stars
  const ratingHtml =
    showRating && testimonial.rating
      ? `<div class="tresta-rating">
         ${Array.from({ length: testimonial.rating })
           .map(() => '<span class="tresta-star">★</span>')
           .join("")}
       </div>`
      : "";

  // Generate author image or initials
  let authorImageHtml = "";
  if (showAuthorImage) {
    if (testimonial.authorImage) {
      authorImageHtml = `<img src="${escapeHtml(testimonial.authorImage)}" alt="${escapeHtml(testimonial.authorName)}" class="tresta-author-image" />`;
    } else {
      const initials = getInitials(testimonial.authorName);
      authorImageHtml = `<div class="tresta-author-image">${initials}</div>`;
    }
  }

  // Generate author role/company
  let authorMetaHtml = "";
  if (showAuthorRole && testimonial.authorRole) {
    authorMetaHtml = `<p class="tresta-author-role">${escapeHtml(testimonial.authorRole)}${
      showAuthorCompany && testimonial.authorCompany
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
 */
export function renderCarouselLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings,
  widgetId: string,
): string {
  const items = testimonials
    .map((t) => renderTestimonial(t, settings))
    .join("");

  const itemsPerPage = settings.itemsPerPage || 1;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  // Generate dots
  const dots = Array.from({ length: totalPages })
    .map(
      (_, i) =>
        `<button class="tresta-carousel-dot ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`,
    )
    .join("");

  return `
    <div class="tresta-carousel" data-widget-id="${widgetId}">
      <div class="tresta-carousel-track" data-current-index="0">
        ${items}
      </div>
      <div class="tresta-carousel-controls">
        <button class="tresta-carousel-button" data-action="prev" aria-label="Previous" ${testimonials.length <= itemsPerPage ? "disabled" : ""}>
          ‹
        </button>
        <div class="tresta-carousel-dots">
          ${dots}
        </div>
        <button class="tresta-carousel-button" data-action="next" aria-label="Next" ${testimonials.length <= itemsPerPage ? "disabled" : ""}>
          ›
        </button>
      </div>
    </div>
  `;
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

  // Apply maxItems setting
  const limitedTestimonials = settings.maxItems
    ? testimonials.slice(0, settings.maxItems)
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
