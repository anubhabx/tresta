/**
 * ContentSanitizer - Protects against XSS attacks by sanitizing user-generated content
 * 
 * Features:
 * - Plain-text escaping for content without HTML markup
 * - Dynamic import of DOMPurify only when HTML is detected
 * - Whitelist-based HTML sanitization
 * - URL validation (http, https, mailto only)
 * - Automatic addition of rel="noopener noreferrer" to external links
 */

interface SanitizerConfig {
  allowedTags: string[];
  allowedAttributes: Record<string, string[]>;
}

// Default configuration following requirements
const DEFAULT_CONFIG: SanitizerConfig = {
  allowedTags: ['a', 'b', 'i', 'strong', 'em', 'p', 'br', 'ul', 'li'],
  allowedAttributes: {
    'a': ['href', 'target']
  }
};

// Lazy-loaded DOMPurify instance
let domPurifyInstance: typeof import('dompurify').default | null = null;

/**
 * Detects if a string contains HTML markup
 */
function containsHTML(text: string): boolean {
  // Check for common HTML patterns
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Escapes HTML entities for plain text content
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validates URL protocols (only http, https, mailto allowed)
 */
function isValidURL(url: string): boolean {
  // Check for mailto first (before URL parsing)
  if (url.startsWith('mailto:')) {
    return true;
  }
  
  // Check for relative URLs (must start with /, ./, or ../)
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }
  
  // Check if it looks like an absolute URL (has protocol)
  if (url.includes('://') || url.startsWith('http:') || url.startsWith('https:')) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  
  // If it doesn't start with a valid relative path or protocol, it's invalid
  // This catches cases like "not a valid url" which would be treated as relative
  return false;
}

/**
 * Checks if a URL is external (different origin)
 */
function isExternalURL(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin !== window.location.origin;
  } catch {
    // If parsing fails, assume it's not external (relative URL)
    return false;
  }
}

/**
 * ContentSanitizer class for XSS protection
 */
export class ContentSanitizer {
  private config: SanitizerConfig;

  constructor(config: Partial<SanitizerConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }

  /**
   * Sanitizes content - uses plain-text escaping for non-HTML content,
   * lazy-loads DOMPurify for HTML content
   */
  async sanitize(content: string): Promise<string> {
    if (!content) {
      return '';
    }

    // Fast path: if no HTML detected, just escape and return
    if (!containsHTML(content)) {
      return escapeHTML(content);
    }

    // HTML detected - lazy load DOMPurify
    if (!domPurifyInstance) {
      const DOMPurify = await import('dompurify');
      domPurifyInstance = DOMPurify.default;
    }

    // Configure DOMPurify - first pass to get clean HTML
    const cleanHTML = domPurifyInstance.sanitize(content, {
      ALLOWED_TAGS: this.config.allowedTags,
      ALLOWED_ATTR: Object.values(this.config.allowedAttributes).flat(),
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      RETURN_DOM: true,
      RETURN_DOM_FRAGMENT: false
    }) as HTMLElement;

    // Post-process to add rel="noopener noreferrer" and validate URLs
    this.postProcessLinks(cleanHTML);
    return cleanHTML.innerHTML;
  }

  /**
   * Synchronous sanitization for plain text (no HTML)
   * Use this when you're certain the content is plain text
   */
  sanitizePlainText(text: string): string {
    return escapeHTML(text);
  }

  /**
   * Validates and sanitizes a URL
   */
  sanitizeURL(url: string): string | null {
    if (!url) {
      return null;
    }
    
    // Trim whitespace
    url = url.trim();
    
    if (!url || !isValidURL(url)) {
      return null;
    }
    
    return url;
  }

  /**
   * Post-processes anchor tags to add security attributes and validate URLs
   */
  private postProcessLinks(element: HTMLElement): void {
    const links = element.querySelectorAll('a');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Validate URL
      if (!href || !isValidURL(href)) {
        link.removeAttribute('href');
        return;
      }

      // Add rel="noopener noreferrer" to external links
      if (isExternalURL(href)) {
        link.setAttribute('rel', 'noopener noreferrer');
      }

      // Ensure target="_blank" links have proper rel attribute
      if (link.getAttribute('target') === '_blank') {
        const existingRel = link.getAttribute('rel') || '';
        const relValues = new Set(existingRel.split(' ').filter(Boolean));
        relValues.add('noopener');
        relValues.add('noreferrer');
        link.setAttribute('rel', Array.from(relValues).join(' '));
      }
    });
  }
}

// Export a singleton instance for convenience
export const defaultSanitizer = new ContentSanitizer();

/**
 * Convenience function for sanitizing content
 */
export async function sanitizeContent(content: string): Promise<string> {
  return defaultSanitizer.sanitize(content);
}

/**
 * Convenience function for sanitizing plain text
 */
export function sanitizePlainText(text: string): string {
  return defaultSanitizer.sanitizePlainText(text);
}

/**
 * Convenience function for sanitizing URLs
 */
export function sanitizeURL(url: string): string | null {
  return defaultSanitizer.sanitizeURL(url);
}
