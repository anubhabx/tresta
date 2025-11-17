/**
 * TestimonialCard Component
 * 
 * Renders a single testimonial card with configurable display options.
 * Supports star ratings, OAuth verification badges, lazy-loaded avatars,
 * and date formatting.
 */

import type { Testimonial, DisplayOptions, ThemeConfig } from '../types';

export interface TestimonialCardConfig {
  testimonial: Testimonial;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

export class TestimonialCard {
  private testimonial: Testimonial;
  private displayOptions: DisplayOptions;
  private theme: ThemeConfig;

  constructor(config: TestimonialCardConfig) {
    this.testimonial = config.testimonial;
    this.displayOptions = config.displayOptions;
    this.theme = config.theme;
  }

  /**
   * Renders the testimonial card as an HTML element
   */
  render(): HTMLElement {
    const card = document.createElement('article');
    card.className = 'tresta-testimonial-card';
    card.setAttribute('data-testimonial-id', this.testimonial.id);
    card.style.setProperty('--primary-color', this.theme.primaryColor);
    card.style.setProperty('--secondary-color', this.theme.secondaryColor);

    // Apply card style class
    card.classList.add(`card-style-${this.theme.cardStyle}`);

    // Build card content
    const content: string[] = [];

    // Header section (avatar, name, role, company, verification)
    content.push(this.renderHeader());

    // Rating section
    if (this.displayOptions.showRating && this.testimonial.rating > 0) {
      content.push(this.renderRating());
    }

    // Testimonial content
    content.push(this.renderContent());

    // Date section
    if (this.displayOptions.showDate) {
      content.push(this.renderDate());
    }

    card.innerHTML = content.join('');

    return card;
  }

  /**
   * Renders the card header with avatar, author info, and verification badge
   */
  private renderHeader(): string {
    const parts: string[] = ['<div class="tresta-card-header">'];

    // Avatar
    if (this.displayOptions.showAvatar && this.testimonial.author.avatar) {
      parts.push(this.renderAvatar());
    }

    // Author info container
    parts.push('<div class="tresta-author-info">');

    // Author name with verification badge
    parts.push('<div class="tresta-author-name-row">');
    parts.push(`<span class="tresta-author-name">${this.escapeHtml(this.testimonial.author.name)}</span>`);
    
    if (this.testimonial.isOAuthVerified && this.testimonial.oauthProvider) {
      parts.push(this.renderVerificationBadge());
    }
    
    parts.push('</div>');

    // Author role
    if (this.displayOptions.showAuthorRole && this.testimonial.author.role) {
      parts.push(`<div class="tresta-author-role">${this.escapeHtml(this.testimonial.author.role)}</div>`);
    }

    // Author company
    if (this.displayOptions.showAuthorCompany && this.testimonial.author.company) {
      parts.push(`<div class="tresta-author-company">${this.escapeHtml(this.testimonial.author.company)}</div>`);
    }

    parts.push('</div>'); // Close author-info
    parts.push('</div>'); // Close header

    return parts.join('');
  }

  /**
   * Renders the avatar image with lazy loading
   */
  private renderAvatar(): string {
    const avatarUrl = this.testimonial.author.avatar!;
    const authorName = this.escapeHtml(this.testimonial.author.name);
    
    return `
      <div class="tresta-avatar-container">
        <img 
          class="tresta-avatar" 
          src="${this.escapeHtml(avatarUrl)}" 
          alt="${authorName}"
          loading="lazy"
        />
      </div>
    `;
  }

  /**
   * Renders the OAuth verification badge
   */
  private renderVerificationBadge(): string {
    const provider = this.escapeHtml(this.testimonial.oauthProvider!);
    
    return `
      <span 
        class="tresta-verification-badge" 
        role="img" 
        aria-label="Verified via ${provider}"
        title="Verified via ${provider}"
      >
        <svg 
          class="tresta-verification-icon" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="8" cy="8" r="8" fill="currentColor"/>
          <path 
            d="M11.5 5.5L6.5 10.5L4 8" 
            stroke="white" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      </span>
    `;
  }

  /**
   * Renders the star rating with ARIA labels
   */
  private renderRating(): string {
    const rating = Math.max(0, Math.min(5, this.testimonial.rating));
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars: string[] = [];

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(this.renderStar('full'));
    }

    // Half star
    if (hasHalfStar) {
      stars.push(this.renderStar('half'));
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(this.renderStar('empty'));
    }

    return `
      <div class="tresta-rating" role="img" aria-label="${rating} out of 5 stars">
        ${stars.join('')}
      </div>
    `;
  }

  /**
   * Renders a single star icon
   */
  private renderStar(type: 'full' | 'half' | 'empty'): string {
    const fillClass = `tresta-star-${type}`;
    
    if (type === 'half') {
      return `
        <svg class="tresta-star ${fillClass}" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="half-fill-${this.testimonial.id}">
              <stop offset="50%" stop-color="currentColor"/>
              <stop offset="50%" stop-color="transparent"/>
            </linearGradient>
          </defs>
          <path 
            d="M10 1L12.5 7.5L19 8.5L14.5 13L15.5 19L10 16L4.5 19L5.5 13L1 8.5L7.5 7.5L10 1Z" 
            fill="url(#half-fill-${this.testimonial.id})"
            stroke="currentColor"
            stroke-width="1"
          />
        </svg>
      `;
    }

    return `
      <svg class="tresta-star ${fillClass}" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path 
          d="M10 1L12.5 7.5L19 8.5L14.5 13L15.5 19L10 16L4.5 19L5.5 13L1 8.5L7.5 7.5L10 1Z" 
          fill="${type === 'full' ? 'currentColor' : 'transparent'}"
          stroke="currentColor"
          stroke-width="1"
        />
      </svg>
    `;
  }

  /**
   * Renders the testimonial content
   */
  private renderContent(): string {
    return `
      <div class="tresta-testimonial-content">
        ${this.escapeHtml(this.testimonial.content)}
      </div>
    `;
  }

  /**
   * Renders the formatted date
   */
  private renderDate(): string {
    const formattedDate = this.formatDate(this.testimonial.createdAt);
    
    return `
      <div class="tresta-testimonial-date">
        <time datetime="${this.testimonial.createdAt}">${formattedDate}</time>
      </div>
    `;
  }

  /**
   * Formats a date string into a human-readable format
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }

      // Format as "Month Day, Year" (e.g., "November 17, 2025")
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      // Fallback to original string if formatting fails
      return dateString;
    }
  }

  /**
   * Escapes HTML to prevent XSS
   * Note: This is a basic escape for text content. 
   * Full HTML sanitization is handled by the ContentSanitizer for rich content.
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
