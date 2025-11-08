var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const DEFAULT_THEME = {
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  cardBackgroundColor: "#ffffff",
  borderRadius: 8,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  starColor: "#000000"
};
function generateStyles(theme, _layout, widgetId, settings) {
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
      display: flex;
      align-items: center;
      gap: 4px;
    }

    ${prefix} .tresta-verified-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #10b981;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      padding: 2px;
    }

    ${prefix} .tresta-verified-badge svg {
      width: 100%;
      height: 100%;
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
      display: flex;
      align-items: center;
      gap: 6px;
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
function injectStyles(css, widgetId) {
  const styleId = `tresta-widget-styles-${widgetId}`;
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}
function removeStyles(widgetId) {
  const styleId = `tresta-widget-styles-${widgetId}`;
  const style = document.getElementById(styleId);
  if (style) {
    style.remove();
  }
}
function renderTestimonial(testimonial, settings) {
  const {
    showRating,
    showDate,
    showAvatar,
    // This is the actual field name from database
    showAuthorRole,
    showAuthorCompany
  } = settings;
  const ratingHtml = showRating ? `<div class="tresta-rating">
         ${Array.from({ length: 5 }).map(
    (_, i) => i < (testimonial.rating || 5) ? '<svg class="tresta-star" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>' : '<svg class="tresta-star tresta-star-empty" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
  ).join("")}
       </div>` : "";
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
  let authorMetaHtml = "";
  if (showAuthorRole && testimonial.authorRole) {
    authorMetaHtml = `<p class="tresta-author-role">${escapeHtml(testimonial.authorRole)}${showAuthorCompany && testimonial.authorCompany ? ` <span class="tresta-author-company">at ${escapeHtml(testimonial.authorCompany)}</span>` : ""}</p>`;
  } else if (showAuthorCompany && testimonial.authorCompany) {
    authorMetaHtml = `<p class="tresta-author-role"><span class="tresta-author-company">${escapeHtml(testimonial.authorCompany)}</span></p>`;
  }
  const verifiedBadgeHtml = testimonial.isOAuthVerified ? `<span class="tresta-verified-badge" title="Verified via ${testimonial.oauthProvider || "OAuth"}">
      <svg width="64px" height="64px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)matrix(1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.78133 3.89027C10.3452 3.40974 10.6271 3.16948 10.9219 3.02859C11.6037 2.70271 12.3963 2.70271 13.0781 3.02859C13.3729 3.16948 13.6548 3.40974 14.2187 3.89027C14.4431 4.08152 14.5553 4.17715 14.6752 4.25747C14.9499 4.4416 15.2584 4.56939 15.5828 4.63344C15.7244 4.66139 15.8713 4.67312 16.1653 4.69657C16.9038 4.7555 17.273 4.78497 17.5811 4.89378C18.2936 5.14546 18.8541 5.70591 19.1058 6.41844C19.2146 6.72651 19.244 7.09576 19.303 7.83426C19.3264 8.12819 19.3381 8.27515 19.3661 8.41669C19.4301 8.74114 19.5579 9.04965 19.7421 9.32437C19.8224 9.44421 19.918 9.55642 20.1093 9.78084C20.5898 10.3447 20.8301 10.6267 20.971 10.9214C21.2968 11.6032 21.2968 12.3958 20.971 13.0776C20.8301 13.3724 20.5898 13.6543 20.1093 14.2182C19.918 14.4426 19.8224 14.5548 19.7421 14.6747C19.5579 14.9494 19.4301 15.2579 19.3661 15.5824C19.3381 15.7239 19.3264 15.8709 19.303 16.1648C19.244 16.9033 19.2146 17.2725 19.1058 17.5806C18.8541 18.2931 18.2936 18.8536 17.5811 19.1053C17.273 19.2141 16.9038 19.2435 16.1653 19.3025C15.8713 19.3259 15.7244 19.3377 15.5828 19.3656C15.2584 19.4297 14.9499 19.5574 14.6752 19.7416C14.5553 19.8219 14.4431 19.9175 14.2187 20.1088C13.6548 20.5893 13.3729 20.8296 13.0781 20.9705C12.3963 21.2963 11.6037 21.2963 10.9219 20.9705C10.6271 20.8296 10.3452 20.5893 9.78133 20.1088C9.55691 19.9175 9.44469 19.8219 9.32485 19.7416C9.05014 19.5574 8.74163 19.4297 8.41718 19.3656C8.27564 19.3377 8.12868 19.3259 7.83475 19.3025C7.09625 19.2435 6.72699 19.2141 6.41893 19.1053C5.7064 18.8536 5.14594 18.2931 4.89427 17.5806C4.78546 17.2725 4.75599 16.9033 4.69706 16.1648C4.6736 15.8709 4.66188 15.7239 4.63393 15.5824C4.56988 15.2579 4.44209 14.9494 4.25796 14.6747C4.17764 14.5548 4.08201 14.4426 3.89076 14.2182C3.41023 13.6543 3.16997 13.3724 3.02907 13.0776C2.7032 12.3958 2.7032 11.6032 3.02907 10.9214C3.16997 10.6266 3.41023 10.3447 3.89076 9.78084C4.08201 9.55642 4.17764 9.44421 4.25796 9.32437C4.44209 9.04965 4.56988 8.74114 4.63393 8.41669C4.66188 8.27515 4.6736 8.12819 4.69706 7.83426C4.75599 7.09576 4.78546 6.72651 4.89427 6.41844C5.14594 5.70591 5.7064 5.14546 6.41893 4.89378C6.72699 4.78497 7.09625 4.7555 7.83475 4.69657C8.12868 4.67312 8.27564 4.66139 8.41718 4.63344C8.74163 4.56939 9.05014 4.4416 9.32485 4.25747C9.4447 4.17715 9.55691 4.08152 9.78133 3.89027Z" stroke="#1C274C" stroke-width="1.44"></path> <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#1C274C" stroke-width="1.44" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
      </span>` : "";
  const dateHtml = showDate ? `<div class="tresta-date">${formatDate(testimonial.createdAt)}</div>` : "";
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
function renderListLayout(testimonials, settings) {
  const items = testimonials.map((t) => renderTestimonial(t, settings)).join("");
  return `<div class="tresta-testimonials">${items}</div>`;
}
function renderGridLayout(testimonials, settings) {
  const items = testimonials.map((t) => renderTestimonial(t, settings)).join("");
  return `<div class="tresta-testimonials">${items}</div>`;
}
function renderMasonryLayout(testimonials, settings) {
  const items = testimonials.map((t) => renderTestimonial(t, settings)).join("");
  return `<div class="tresta-testimonials">${items}</div>`;
}
function renderCarouselLayout(testimonials, settings, widgetId) {
  return `<div class="tresta-carousel" data-widget-id="${widgetId}"></div>`;
}
function renderWallLayout(testimonials, settings) {
  const items = testimonials.map((t) => renderTestimonial(t, settings)).join("");
  return `<div class="tresta-testimonials">${items}</div>`;
}
function renderWidget(testimonials, layout, settings, widgetId) {
  if (!testimonials || testimonials.length === 0) {
    return '<div class="tresta-empty">No testimonials yet.</div>';
  }
  const limitedTestimonials = settings.maxTestimonials ? testimonials.slice(0, settings.maxTestimonials) : testimonials;
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
function renderLoading() {
  return `
    <div class="tresta-loading">
      <div class="tresta-spinner"></div>
    </div>
  `;
}
function renderError(message) {
  return `
    <div class="tresta-error">
      <p><strong>Unable to load testimonials</strong></p>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}
function renderBranding(showBranding) {
  return `
    <div class="tresta-branding">
      Powered by <a href="https://tresta.io" target="_blank" rel="noopener">Tresta</a>
    </div>
  `;
}
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() ?? "";
  }
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts[parts.length - 1]?.charAt(0) ?? "";
  return (first + last).toUpperCase();
}
function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1e3);
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
class Carousel {
  constructor(options) {
    __publicField(this, "container");
    __publicField(this, "testimonials");
    __publicField(this, "currentIndex", 0);
    __publicField(this, "autoplayInterval", null);
    __publicField(this, "autoplay");
    __publicField(this, "autoplaySpeed");
    __publicField(this, "showRating");
    __publicField(this, "showCompany");
    __publicField(this, "showAvatar");
    __publicField(this, "showDate");
    __publicField(this, "onSlideChange");
    __publicField(this, "isAutoPlayActive");
    // Touch support
    __publicField(this, "touchStartX", 0);
    __publicField(this, "touchEndX", 0);
    __publicField(this, "isDragging", false);
    // DOM elements
    __publicField(this, "carouselCard", null);
    __publicField(this, "contentContainer", null);
    __publicField(this, "prevButton", null);
    __publicField(this, "nextButton", null);
    __publicField(this, "indicatorsContainer", null);
    __publicField(this, "autoplayToggle", null);
    this.container = options.container;
    this.testimonials = options.testimonials;
    this.autoplay = options.autoplay ?? true;
    this.autoplaySpeed = options.autoplaySpeed ?? 5e3;
    this.showRating = options.showRating ?? true;
    this.showCompany = options.showCompany ?? true;
    this.showAvatar = options.showAvatar ?? true;
    this.showDate = options.showDate ?? true;
    this.onSlideChange = options.onSlideChange;
    this.isAutoPlayActive = this.autoplay;
    this.init();
  }
  init() {
    if (!this.testimonials.length) {
      this.renderEmptyState();
      return;
    }
    this.render();
    this.setupControls();
    this.setupTouchSupport();
    this.setupKeyboardNavigation();
    if (this.autoplay) {
      this.startAutoplay();
      this.setupAutoplayPause();
    }
  }
  renderEmptyState() {
    this.container.innerHTML = `
            <div class="tresta-carousel-empty">
                No testimonials available
            </div>
        `;
  }
  render() {
    this.container.innerHTML = "";
    this.container.className = "tresta-carousel-container";
    const wrapper = document.createElement("div");
    wrapper.className = "tresta-carousel-wrapper";
    this.carouselCard = document.createElement("div");
    this.carouselCard.className = "tresta-carousel-card";
    this.contentContainer = document.createElement("div");
    this.contentContainer.className = "tresta-carousel-content";
    this.carouselCard.appendChild(this.contentContainer);
    wrapper.appendChild(this.carouselCard);
    this.prevButton = this.createNavigationButton("prev", "Previous testimonial");
    this.nextButton = this.createNavigationButton("next", "Next testimonial");
    wrapper.appendChild(this.prevButton);
    wrapper.appendChild(this.nextButton);
    this.container.appendChild(wrapper);
    this.indicatorsContainer = document.createElement("div");
    this.indicatorsContainer.className = "tresta-carousel-indicators";
    this.container.appendChild(this.indicatorsContainer);
    const autoplayContainer = document.createElement("div");
    autoplayContainer.className = "tresta-carousel-autoplay-container";
    this.autoplayToggle = document.createElement("button");
    this.autoplayToggle.className = "tresta-carousel-autoplay-toggle";
    autoplayContainer.appendChild(this.autoplayToggle);
    this.container.appendChild(autoplayContainer);
    this.renderIndicators();
    this.renderTestimonial();
  }
  createNavigationButton(direction, label) {
    const button = document.createElement("button");
    button.setAttribute("data-action", direction);
    button.setAttribute("aria-label", label);
    button.className = `tresta-carousel-nav-button tresta-carousel-nav-${direction}`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (direction === "prev") {
      path.setAttribute("d", "M15 18l-6-6 6-6");
    } else {
      path.setAttribute("d", "M9 18l6-6-6-6");
    }
    svg.appendChild(path);
    button.appendChild(svg);
    return button;
  }
  renderIndicators() {
    if (!this.indicatorsContainer) return;
    this.indicatorsContainer.innerHTML = "";
    this.testimonials.forEach((_, index) => {
      const indicator = document.createElement("button");
      indicator.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      indicator.setAttribute("data-index", String(index));
      indicator.className = index === this.currentIndex ? "tresta-carousel-indicator tresta-carousel-indicator-active" : "tresta-carousel-indicator";
      if (index === this.currentIndex) {
        indicator.setAttribute("aria-current", "true");
      }
      if (this.indicatorsContainer) {
        this.indicatorsContainer.appendChild(indicator);
      }
    });
  }
  renderTestimonial() {
    if (!this.contentContainer) return;
    const testimonial = this.testimonials[this.currentIndex];
    if (!testimonial) return;
    this.contentContainer.innerHTML = "";
    if (this.showRating && testimonial.rating) {
      const ratingContainer = document.createElement("div");
      ratingContainer.className = "tresta-carousel-rating";
      for (let i = 0; i < 5; i++) {
        const star = this.createStarIcon(i < testimonial.rating);
        ratingContainer.appendChild(star);
      }
      this.contentContainer.appendChild(ratingContainer);
    }
    const quoteContainer = document.createElement("div");
    quoteContainer.className = "tresta-carousel-quote-container";
    const blockquote = document.createElement("blockquote");
    blockquote.className = "tresta-carousel-quote";
    blockquote.textContent = `"${testimonial.content}"`;
    quoteContainer.appendChild(blockquote);
    this.contentContainer.appendChild(quoteContainer);
    const authorContainer = document.createElement("div");
    authorContainer.className = "tresta-carousel-author";
    if (this.showAvatar) {
      let avatarElement;
      if (testimonial.avatar) {
        avatarElement = document.createElement("img");
        avatarElement.className = "tresta-carousel-avatar";
        avatarElement.src = testimonial.avatar;
        avatarElement.alt = testimonial.name;
      } else {
        avatarElement = document.createElement("div");
        avatarElement.className = "tresta-carousel-avatar tresta-carousel-avatar-initials";
        const initials = this.getInitials(testimonial.name);
        const backgroundColor = this.getColorFromName(testimonial.name);
        avatarElement.style.backgroundColor = backgroundColor;
        avatarElement.style.color = "white";
        avatarElement.style.display = "flex";
        avatarElement.style.alignItems = "center";
        avatarElement.style.justifyContent = "center";
        avatarElement.style.fontWeight = "600";
        avatarElement.style.fontSize = "18px";
        avatarElement.textContent = initials;
      }
      authorContainer.appendChild(avatarElement);
    }
    const authorInfo = document.createElement("div");
    authorInfo.className = "tresta-carousel-author-info";
    const nameContainer = document.createElement("p");
    nameContainer.className = "tresta-carousel-author-name";
    nameContainer.textContent = testimonial.name;
    if (testimonial.isOAuthVerified) {
      const badge = document.createElement("span");
      badge.className = "tresta-verified-badge";
      badge.title = `Verified via ${testimonial.oauthProvider || "OAuth"}`;
      badge.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`;
      nameContainer.appendChild(badge);
    }
    authorInfo.appendChild(nameContainer);
    const role = document.createElement("p");
    role.className = "tresta-carousel-author-role";
    let roleText = testimonial.role;
    if (this.showCompany && testimonial.company) {
      roleText += ` at ${testimonial.company}`;
    }
    role.textContent = roleText;
    authorInfo.appendChild(role);
    authorContainer.appendChild(authorInfo);
    this.contentContainer.appendChild(authorContainer);
    if (this.showDate) {
      const dateElement = document.createElement("div");
      dateElement.className = "tresta-carousel-date";
      dateElement.textContent = this.formatRelativeDate(testimonial.createdAt);
      this.contentContainer.appendChild(dateElement);
    }
    this.updateAutoplayToggle();
  }
  createStarIcon(filled) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", filled ? "currentColor" : "none");
    svg.setAttribute("stroke", filled ? "currentColor" : "currentColor");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", filled ? "tresta-carousel-star-filled" : "tresta-carousel-star-empty");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
    svg.appendChild(path);
    return svg;
  }
  updateAutoplayToggle() {
    if (!this.autoplayToggle) return;
    this.autoplayToggle.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("stroke", "none");
    svg.style.marginRight = "6px";
    if (this.isAutoPlayActive) {
      const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect1.setAttribute("x", "6");
      rect1.setAttribute("y", "4");
      rect1.setAttribute("width", "4");
      rect1.setAttribute("height", "16");
      rect1.setAttribute("rx", "1");
      const rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect2.setAttribute("x", "14");
      rect2.setAttribute("y", "4");
      rect2.setAttribute("width", "4");
      rect2.setAttribute("height", "16");
      rect2.setAttribute("rx", "1");
      svg.appendChild(rect1);
      svg.appendChild(rect2);
    } else {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M8 5v14l11-7z");
      svg.appendChild(path);
    }
    this.autoplayToggle.appendChild(svg);
    const text = document.createTextNode(this.isAutoPlayActive ? "Pause" : "Play");
    this.autoplayToggle.appendChild(text);
  }
  setupControls() {
    this.prevButton?.addEventListener("click", () => this.prev());
    this.nextButton?.addEventListener("click", () => this.next());
    if (this.indicatorsContainer) {
      this.indicatorsContainer.addEventListener("click", (e) => {
        const target = e.target;
        const index = target.getAttribute("data-index");
        if (index !== null) {
          this.goToSlide(parseInt(index, 10));
        }
      });
    }
    this.autoplayToggle?.addEventListener("click", () => {
      this.isAutoPlayActive = !this.isAutoPlayActive;
      if (this.isAutoPlayActive) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
      this.updateAutoplayToggle();
    });
  }
  setupTouchSupport() {
    if (!this.carouselCard) return;
    this.carouselCard.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      if (touch) {
        this.touchStartX = touch.clientX;
        this.isDragging = true;
      }
    }, { passive: true });
    this.carouselCard.addEventListener("touchmove", (e) => {
      if (!this.isDragging) return;
      const touch = e.touches[0];
      if (touch) {
        this.touchEndX = touch.clientX;
      }
    }, { passive: true });
    this.carouselCard.addEventListener("touchend", () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const diff = this.touchStartX - this.touchEndX;
      const threshold = 50;
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
    let mouseStartX = 0;
    let isMouseDragging = false;
    this.carouselCard.addEventListener("mousedown", (e) => {
      mouseStartX = e.clientX;
      isMouseDragging = true;
      if (this.carouselCard) {
        this.carouselCard.style.cursor = "grabbing";
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (!isMouseDragging || !this.carouselCard) return;
    });
    document.addEventListener("mouseup", (e) => {
      if (!isMouseDragging || !this.carouselCard) return;
      isMouseDragging = false;
      if (this.carouselCard) {
        this.carouselCard.style.cursor = "grab";
      }
      const diff = mouseStartX - e.clientX;
      const threshold = 50;
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
  setupKeyboardNavigation() {
    this.container.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.next();
      }
    });
    this.container.setAttribute("tabindex", "0");
  }
  setupAutoplayPause() {
    if (!this.carouselCard) return;
    this.carouselCard.addEventListener("mouseenter", () => {
      if (this.isAutoPlayActive) {
        this.stopAutoplay();
      }
    });
    this.carouselCard.addEventListener("mouseleave", () => {
      if (this.isAutoPlayActive) {
        this.startAutoplay();
      }
    });
    this.container.addEventListener("focus", () => {
      if (this.isAutoPlayActive) {
        this.stopAutoplay();
      }
    });
    this.container.addEventListener("blur", () => {
      if (this.isAutoPlayActive) {
        this.startAutoplay();
      }
    });
  }
  goToSlide(index) {
    if (index < 0) {
      index = this.testimonials.length - 1;
    } else if (index >= this.testimonials.length) {
      index = 0;
    }
    this.currentIndex = index;
    if (this.contentContainer) {
      this.contentContainer.style.opacity = "0";
      this.contentContainer.style.transition = "opacity 0.3s ease-in-out";
      setTimeout(() => {
        this.renderTestimonial();
        this.renderIndicators();
        if (this.contentContainer) {
          this.contentContainer.style.opacity = "1";
        }
      }, 150);
    }
    if (this.onSlideChange) {
      this.onSlideChange(index);
    }
  }
  next() {
    this.goToSlide(this.currentIndex + 1);
    if (this.isAutoPlayActive) {
      this.stopAutoplay();
      setTimeout(() => {
        if (this.isAutoPlayActive) {
          this.startAutoplay();
        }
      }, 1e4);
    }
  }
  prev() {
    this.goToSlide(this.currentIndex - 1);
    if (this.isAutoPlayActive) {
      this.stopAutoplay();
      setTimeout(() => {
        if (this.isAutoPlayActive) {
          this.startAutoplay();
        }
      }, 1e4);
    }
  }
  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = window.setInterval(() => {
      this.next();
    }, this.autoplaySpeed);
  }
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  destroy() {
    this.stopAutoplay();
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  getTotalTestimonials() {
    return this.testimonials.length;
  }
  getTestimonials() {
    return this.testimonials;
  }
  setTestimonials(testimonials) {
    this.testimonials = testimonials;
    this.currentIndex = 0;
    this.init();
  }
  /**
   * Get initials from name for avatar fallback
   */
  getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0]?.charAt(0).toUpperCase() ?? "";
    }
    const first = parts[0]?.charAt(0) ?? "";
    const last = parts[parts.length - 1]?.charAt(0) ?? "";
    return (first + last).toUpperCase();
  }
  /**
   * Generate a consistent color based on name for avatar background
   */
  getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 50%)`;
  }
  /**
   * Format date to relative time (e.g., "2 days ago")
   */
  formatRelativeDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1e3);
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
}
class TrestaWidget {
  // Store the effective layout being used
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "container", null);
    __publicField(this, "widget", null);
    __publicField(this, "testimonials", []);
    __publicField(this, "carouselInterval", null);
    __publicField(this, "currentSlide", 0);
    __publicField(this, "effectiveLayout", null);
    this.config = {
      apiUrl: "http://localhost:8000",
      ...config
    };
    this.init();
  }
  /**
   * Initialize the widget
   */
  async init() {
    try {
      this.container = this.findContainer();
      if (!this.container) {
        throw new Error("Widget container not found");
      }
      this.render(renderLoading());
      await this.fetchWidgetData();
      this.injectWidgetStyles();
      this.renderWidget();
      const layout = this.config.settings?.layout || this.widget?.layout;
      if (layout === "carousel") {
        this.initCarousel();
      }
      if (this.config.onLoad && this.widget) {
        this.config.onLoad(this.widget);
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * Find the container element
   */
  findContainer() {
    if (!this.config.container) {
      const scripts = document.querySelectorAll("script[data-tresta-widget]");
      const currentScript = Array.from(scripts).find(
        (script) => script.getAttribute("data-tresta-widget") === this.config.widgetId
      );
      if (currentScript) {
        const containerId = currentScript.getAttribute("data-container");
        if (containerId) {
          return document.getElementById(containerId);
        }
        const container2 = document.createElement("div");
        container2.id = `tresta-widget-${this.config.widgetId}`;
        container2.className = `tresta-widget-${this.config.widgetId}`;
        currentScript.parentNode?.insertBefore(
          container2,
          currentScript.nextSibling
        );
        return container2;
      }
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
  async fetchWidgetData() {
    const url = `${this.config.apiUrl}/api/widgets/${this.config.widgetId}/public`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch widget data: ${response.status} ${response.statusText}`
      );
    }
    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to load widget data");
    }
    this.widget = result.data.widget;
    this.testimonials = result.data.testimonials || [];
    console.log("API Response:", {
      widget: this.widget,
      testimonials: this.testimonials
    });
  }
  /**
   * Inject widget styles
   */
  injectWidgetStyles() {
    if (!this.widget) return;
    const theme = {
      ...DEFAULT_THEME,
      ...this.widget.theme,
      ...this.config.theme
    };
    const settings = {
      ...this.widget.settings,
      ...this.config.settings
    };
    const layout = this.config.settings?.layout || this.widget.layout;
    const css = generateStyles(theme, layout, this.config.widgetId, settings);
    injectStyles(css, this.config.widgetId);
  }
  /**
   * Render the widget content
   */
  renderWidget() {
    if (!this.widget || !this.container) return;
    const settings = {
      ...this.widget.settings,
      ...this.config.settings
    };
    const layout = this.config.settings?.layout || this.widget.layout;
    this.effectiveLayout = layout;
    console.log("Widget Settings:", {
      fromAPI: this.widget.settings,
      fromConfig: this.config.settings,
      merged: settings,
      layout
    });
    const widgetHtml = renderWidget(
      this.testimonials,
      layout,
      settings,
      this.config.widgetId
    );
    const brandingHtml = renderBranding();
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
  initCarousel() {
    if (!this.container || !this.widget) return;
    const layout = this.config.settings?.layout || this.widget.layout;
    if (layout !== "carousel") return;
    const settings = this.widget.settings;
    const carouselContainer = this.container.querySelector(
      ".tresta-carousel"
    );
    if (!carouselContainer) return;
    const carouselTestimonials = this.testimonials.map((t) => ({
      id: t.id,
      name: t.authorName || "Anonymous",
      role: t.authorRole || "",
      company: t.authorCompany,
      content: t.content,
      avatar: t.authorAvatar,
      rating: t.rating,
      createdAt: t.createdAt,
      isOAuthVerified: t.isOAuthVerified,
      oauthProvider: t.oauthProvider
    }));
    const carousel = new Carousel({
      container: carouselContainer,
      testimonials: carouselTestimonials,
      autoplay: settings.autoRotate ?? false,
      autoplaySpeed: settings.rotateInterval ?? 5e3,
      showRating: settings.showRating ?? true,
      showCompany: settings.showAuthorCompany ?? true,
      showAvatar: settings.showAvatar ?? true,
      showDate: settings.showDate ?? true,
      onSlideChange: (index) => {
        this.currentSlide = index;
      }
    });
    this.carouselInstance = carousel;
  }
  /**
   * Render HTML content to container
   */
  render(html) {
    if (!this.container) return;
    this.container.innerHTML = html;
    if (this.widget) {
      const layoutClass = this.effectiveLayout || this.widget.layout;
      this.container.className = `tresta-widget-${this.config.widgetId} tresta-layout-${layoutClass}`;
    }
  }
  /**
   * Handle errors
   */
  handleError(error) {
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
  destroy() {
    if (this.carouselInstance) {
      this.carouselInstance.destroy();
      this.carouselInstance = null;
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
  async refresh() {
    try {
      await this.fetchWidgetData();
      this.renderWidget();
      if (this.widget?.layout === "carousel") {
        this.initCarousel();
      }
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * Get current widget data
   */
  getWidget() {
    return this.widget;
  }
  /**
   * Get current testimonials
   */
  getTestimonials() {
    return this.testimonials;
  }
}
// Static methods for global widget management (implemented in index.ts)
__publicField(TrestaWidget, "init", () => {
  throw new Error("TrestaWidget.init not initialized. Make sure the widget script is loaded.");
});
__publicField(TrestaWidget, "destroy", () => {
  throw new Error("TrestaWidget.destroy not initialized. Make sure the widget script is loaded.");
});
__publicField(TrestaWidget, "refresh", async () => {
  throw new Error("TrestaWidget.refresh not initialized. Make sure the widget script is loaded.");
});
__publicField(TrestaWidget, "refreshAll", async () => {
  throw new Error("TrestaWidget.refreshAll not initialized. Make sure the widget script is loaded.");
});
__publicField(TrestaWidget, "get", () => {
  throw new Error("TrestaWidget.get not initialized. Make sure the widget script is loaded.");
});
__publicField(TrestaWidget, "getAll", () => {
  throw new Error("TrestaWidget.getAll not initialized. Make sure the widget script is loaded.");
});
window.TrestaWidget = TrestaWidget;
window.trestaWidgets = window.trestaWidgets || /* @__PURE__ */ new Map();
function autoInitialize() {
  const scripts = document.querySelectorAll("script[data-tresta-widget]");
  scripts.forEach((script) => {
    const widgetId = script.getAttribute("data-tresta-widget");
    if (!widgetId) return;
    if (window.trestaWidgets.has(widgetId)) return;
    const config = {
      widgetId,
      apiUrl: script.getAttribute("data-api-url") || void 0,
      container: script.getAttribute("data-container") || void 0
    };
    const primaryColor = script.getAttribute("data-primary-color");
    const backgroundColor = script.getAttribute("data-background-color");
    const textColor = script.getAttribute("data-text-color");
    const cardBackgroundColor = script.getAttribute(
      "data-card-background-color"
    );
    const borderRadius = script.getAttribute("data-border-radius");
    const fontFamily = script.getAttribute("data-font-family");
    if (primaryColor || backgroundColor || textColor || cardBackgroundColor || borderRadius || fontFamily) {
      config.theme = {
        ...primaryColor && { primaryColor },
        ...backgroundColor && { backgroundColor },
        ...textColor && { textColor },
        ...cardBackgroundColor && { cardBackgroundColor },
        ...borderRadius && { borderRadius: parseInt(borderRadius, 10) },
        ...fontFamily && { fontFamily }
      };
    }
    const showRating = script.getAttribute("data-show-rating");
    const showDate = script.getAttribute("data-show-date");
    const showAuthorImage = script.getAttribute("data-show-author-image");
    const showAuthorRole = script.getAttribute("data-show-author-role");
    const showAuthorCompany = script.getAttribute("data-show-author-company");
    const autoplay = script.getAttribute("data-autoplay");
    const autoplaySpeed = script.getAttribute("data-autoplay-speed");
    const maxItems = script.getAttribute("data-max-items");
    if (showRating || showDate || showAuthorImage || showAuthorRole || showAuthorCompany || autoplay || autoplaySpeed || maxItems) {
      config.settings = {
        ...showRating && { showRating: showRating === "true" },
        ...showDate && { showDate: showDate === "true" },
        ...showAuthorImage && { showAuthorImage: showAuthorImage === "true" },
        ...showAuthorRole && { showAuthorRole: showAuthorRole === "true" },
        ...showAuthorCompany && {
          showAuthorCompany: showAuthorCompany === "true"
        },
        ...autoplay && { autoplay: autoplay === "true" },
        ...autoplaySpeed && { autoplaySpeed: parseInt(autoplaySpeed, 10) },
        ...maxItems && { maxItems: parseInt(maxItems, 10) }
      };
    }
    try {
      const widget = new TrestaWidget(config);
      window.trestaWidgets.set(widgetId, widget);
    } catch (error) {
      console.error(`Failed to initialize Tresta widget ${widgetId}:`, error);
    }
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInitialize);
} else {
  autoInitialize();
}
TrestaWidget.init = (widgetId, config) => {
  const fullConfig = {
    widgetId,
    ...config
  };
  const widget = new TrestaWidget(fullConfig);
  window.trestaWidgets.set(widgetId, widget);
  return widget;
};
TrestaWidget.destroy = (widgetId) => {
  const widget = window.trestaWidgets.get(widgetId);
  if (widget) {
    widget.destroy();
    window.trestaWidgets.delete(widgetId);
  }
};
TrestaWidget.refresh = async (widgetId) => {
  const widget = window.trestaWidgets.get(widgetId);
  if (widget) {
    await widget.refresh();
  }
};
TrestaWidget.refreshAll = async () => {
  const promises = Array.from(window.trestaWidgets.values()).map(
    (widget) => widget.refresh()
  );
  await Promise.all(promises);
};
TrestaWidget.get = (widgetId) => {
  return window.trestaWidgets.get(widgetId) || null;
};
TrestaWidget.getAll = () => {
  return Array.from(window.trestaWidgets.values());
};
if (typeof window !== "undefined") {
  window.TrestaWidget = TrestaWidget;
}
export {
  TrestaWidget
};
