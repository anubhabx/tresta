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
  settings: WidgetSettings
): string {
  const {
    showRating,
    showDate,
    showAvatar, // This is the actual field name from database
    showAuthorRole,
    showAuthorCompany
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
    authorMetaHtml = `<p class="tresta-author-role">${escapeHtml(testimonial.authorRole)}${
      showAuthorCompany && testimonial.authorCompany
        ? ` <span class="tresta-author-company">at ${escapeHtml(testimonial.authorCompany)}</span>`
        : ""
    }</p>`;
  } else if (showAuthorCompany && testimonial.authorCompany) {
    authorMetaHtml = `<p class="tresta-author-role"><span class="tresta-author-company">${escapeHtml(testimonial.authorCompany)}</span></p>`;
  }

  // Generate verified badge
  const verifiedBadgeHtml = testimonial.isOAuthVerified
    ? `<span class="tresta-verified-badge" title="Verified via ${testimonial.oauthProvider || "OAuth"}">
      <svg width="64px" height="64px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)matrix(1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.78133 3.89027C10.3452 3.40974 10.6271 3.16948 10.9219 3.02859C11.6037 2.70271 12.3963 2.70271 13.0781 3.02859C13.3729 3.16948 13.6548 3.40974 14.2187 3.89027C14.4431 4.08152 14.5553 4.17715 14.6752 4.25747C14.9499 4.4416 15.2584 4.56939 15.5828 4.63344C15.7244 4.66139 15.8713 4.67312 16.1653 4.69657C16.9038 4.7555 17.273 4.78497 17.5811 4.89378C18.2936 5.14546 18.8541 5.70591 19.1058 6.41844C19.2146 6.72651 19.244 7.09576 19.303 7.83426C19.3264 8.12819 19.3381 8.27515 19.3661 8.41669C19.4301 8.74114 19.5579 9.04965 19.7421 9.32437C19.8224 9.44421 19.918 9.55642 20.1093 9.78084C20.5898 10.3447 20.8301 10.6267 20.971 10.9214C21.2968 11.6032 21.2968 12.3958 20.971 13.0776C20.8301 13.3724 20.5898 13.6543 20.1093 14.2182C19.918 14.4426 19.8224 14.5548 19.7421 14.6747C19.5579 14.9494 19.4301 15.2579 19.3661 15.5824C19.3381 15.7239 19.3264 15.8709 19.303 16.1648C19.244 16.9033 19.2146 17.2725 19.1058 17.5806C18.8541 18.2931 18.2936 18.8536 17.5811 19.1053C17.273 19.2141 16.9038 19.2435 16.1653 19.3025C15.8713 19.3259 15.7244 19.3377 15.5828 19.3656C15.2584 19.4297 14.9499 19.5574 14.6752 19.7416C14.5553 19.8219 14.4431 19.9175 14.2187 20.1088C13.6548 20.5893 13.3729 20.8296 13.0781 20.9705C12.3963 21.2963 11.6037 21.2963 10.9219 20.9705C10.6271 20.8296 10.3452 20.5893 9.78133 20.1088C9.55691 19.9175 9.44469 19.8219 9.32485 19.7416C9.05014 19.5574 8.74163 19.4297 8.41718 19.3656C8.27564 19.3377 8.12868 19.3259 7.83475 19.3025C7.09625 19.2435 6.72699 19.2141 6.41893 19.1053C5.7064 18.8536 5.14594 18.2931 4.89427 17.5806C4.78546 17.2725 4.75599 16.9033 4.69706 16.1648C4.6736 15.8709 4.66188 15.7239 4.63393 15.5824C4.56988 15.2579 4.44209 14.9494 4.25796 14.6747C4.17764 14.5548 4.08201 14.4426 3.89076 14.2182C3.41023 13.6543 3.16997 13.3724 3.02907 13.0776C2.7032 12.3958 2.7032 11.6032 3.02907 10.9214C3.16997 10.6266 3.41023 10.3447 3.89076 9.78084C4.08201 9.55642 4.17764 9.44421 4.25796 9.32437C4.44209 9.04965 4.56988 8.74114 4.63393 8.41669C4.66188 8.27515 4.6736 8.12819 4.69706 7.83426C4.75599 7.09576 4.78546 6.72651 4.89427 6.41844C5.14594 5.70591 5.7064 5.14546 6.41893 4.89378C6.72699 4.78497 7.09625 4.7555 7.83475 4.69657C8.12868 4.67312 8.27564 4.66139 8.41718 4.63344C8.74163 4.56939 9.05014 4.4416 9.32485 4.25747C9.4447 4.17715 9.55691 4.08152 9.78133 3.89027Z" stroke="#1C274C" stroke-width="1.44"></path> <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#1C274C" stroke-width="1.44" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </span>`
    : "";

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
          <p class="tresta-author-name">
            ${escapeHtml(testimonial.authorName)}
            ${verifiedBadgeHtml}
          </p>
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
  settings: WidgetSettings
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
  settings: WidgetSettings
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
  settings: WidgetSettings
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
  widgetId: string
): string {
  // Return an empty container that the Carousel class will populate
  return `<div class="tresta-carousel" data-widget-id="${widgetId}"></div>`;
}

/**
 * Renders testimonials in wall layout (minimal cards)
 */
export function renderWallLayout(
  testimonials: Testimonial[],
  settings: WidgetSettings
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
  widgetId: string
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
 * Formats a date string to a relative time format (e.g., "2 days ago")
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) {
      return "just now";
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
    } else if (diffWeek < 4) {
      return `${diffWeek} ${diffWeek === 1 ? "week" : "weeks"} ago`;
    } else if (diffMonth < 12) {
      return `${diffMonth} ${diffMonth === 1 ? "month" : "months"} ago`;
    } else {
      return `${diffYear} ${diffYear === 1 ? "year" : "years"} ago`;
    }
  } catch {
    return dateString;
  }
}
