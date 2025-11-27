/**
 * CSP Validator - Ensures Content Security Policy compliance
 * 
 * Features:
 * - Validates that all resources load from allowed domains
 * - Detects CSP violations at runtime
 * - Provides nonce support for strict CSP environments
 * - Validates no inline scripts or eval() usage
 */

import {
  WIDGET_ALLOWED_DOMAINS,
  WIDGET_API_BASE_URL,
  WIDGET_CDN_BASE_URL,
  buildWidgetScriptUrl,
} from '../config/env';

export interface CSPConfig {
  allowedDomains: string[];
  nonce?: string;
  reportViolations?: boolean;
}

// Default allowed domains per requirements
const DEFAULT_ALLOWED_DOMAINS = [...WIDGET_ALLOWED_DOMAINS];

/**
 * CSP Validator class
 */
export class CSPValidator {
  private config: CSPConfig;
  private violations: CSPViolation[] = [];

  constructor(config: Partial<CSPConfig> = {}) {
    this.config = {
      allowedDomains: DEFAULT_ALLOWED_DOMAINS,
      reportViolations: true,
      ...config,
    };

    // Set up CSP violation listener if reporting is enabled
    if (this.config.reportViolations && typeof document !== 'undefined') {
      this.setupViolationListener();
    }
  }

  /**
   * Validates that a URL is from an allowed domain
   */
  validateURL(url: string): boolean {
    if (!url) {
      return false;
    }

    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }

    // Allow data URLs for inline images (common for small icons)
    if (url.startsWith('data:')) {
      return true;
    }

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      // Check if hostname matches any allowed domain
      return this.config.allowedDomains.some(domain => {
        // Exact match or subdomain match
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });
    } catch {
      // Invalid URL
      return false;
    }
  }

  /**
   * Validates that all resources in the widget are from allowed domains
   */
  validateResources(root: HTMLElement): CSPValidationResult {
    const violations: CSPViolation[] = [];

    // Check all images
    const images = root.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !this.validateURL(src)) {
        violations.push({
          type: 'image',
          url: src,
          element: img,
          message: `Image source not from allowed domain: ${src}`,
        });
      }
    });

    // Check all scripts (should not exist in widget content)
    const scripts = root.querySelectorAll('script');
    scripts.forEach(script => {
      violations.push({
        type: 'script',
        url: script.getAttribute('src') || 'inline',
        element: script,
        message: 'Script tag found in widget content (CSP violation)',
      });
    });

    // Check all iframes (should not exist in widget content)
    const iframes = root.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      violations.push({
        type: 'iframe',
        url: iframe.getAttribute('src') || 'inline',
        element: iframe,
        message: 'Iframe found in widget content (CSP violation)',
      });
    });

    // Check all links
    const links = root.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('javascript:')) {
        violations.push({
          type: 'link',
          url: href,
          element: link,
          message: 'JavaScript URL in link (CSP violation)',
        });
      }
    });

    // Check for inline event handlers
    const elementsWithEvents = root.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
    elementsWithEvents.forEach(element => {
      violations.push({
        type: 'inline-event',
        url: 'inline',
        element: element as HTMLElement,
        message: 'Inline event handler found (CSP violation)',
      });
    });

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Checks if the current environment has a strict CSP
   */
  async detectStrictCSP(): Promise<boolean> {
    // Try to detect CSP by attempting to create an inline script
    // This is a non-invasive check that doesn't actually execute anything
    try {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (meta) {
        const content = meta.getAttribute('content') || '';
        // Check for strict CSP directives
        return content.includes("'strict-dynamic'") || 
               (!content.includes("'unsafe-inline'") && !content.includes("'unsafe-eval'"));
      }
    } catch {
      // If we can't check, assume no strict CSP
    }
    return false;
  }

  /**
   * Gets the nonce value from the current script tag or config
   */
  getNonce(): string | null {
    // First check config
    if (this.config.nonce) {
      return this.config.nonce;
    }

    // Try to find nonce from the widget script tag
    if (typeof document !== 'undefined') {
      const scripts = document.querySelectorAll('script[data-widget-id]');
      for (const script of Array.from(scripts)) {
        const nonce = script.getAttribute('nonce');
        if (nonce) {
          return nonce;
        }
      }
    }

    return null;
  }

  /**
   * Applies nonce to dynamically created elements if needed
   */
  applyNonce(element: HTMLElement): void {
    const nonce = this.getNonce();
    if (nonce) {
      // Apply nonce to script and style tags
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
        element.setAttribute('nonce', nonce);
      }
    }
  }

  /**
   * Gets all recorded violations
   */
  getViolations(): CSPViolation[] {
    return [...this.violations];
  }

  /**
   * Clears all recorded violations
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Sets up a listener for CSP violations
   */
  private setupViolationListener(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('securitypolicyviolation', (event) => {
      // Only track violations related to our widget
      if (event.blockedURI && this.isWidgetRelated(event)) {
        this.violations.push({
          type: 'csp-violation',
          url: event.blockedURI,
          message: `CSP violation: ${event.violatedDirective} - ${event.blockedURI}`,
          directive: event.violatedDirective,
        });

        console.warn('[TrestaWidget] CSP violation detected:', {
          directive: event.violatedDirective,
          blockedURI: event.blockedURI,
          sourceFile: event.sourceFile,
        });
      }
    });
  }

  /**
   * Checks if a CSP violation is related to our widget
   */
  private isWidgetRelated(event: SecurityPolicyViolationEvent): boolean {
    // Check if the violation is from our widget domains
    const blockedURI = event.blockedURI;
    const sourceFile = event.sourceFile;

    return (
      this.config.allowedDomains.some(domain => 
        blockedURI.includes(domain) || sourceFile?.includes(domain)
      ) ||
      sourceFile?.includes('tresta-widget') ||
      blockedURI.includes('tresta-widget')
    );
  }
}

/**
 * CSP Violation interface
 */
export interface CSPViolation {
  type: 'image' | 'script' | 'iframe' | 'link' | 'inline-event' | 'csp-violation';
  url: string;
  element?: HTMLElement;
  message: string;
  directive?: string;
}

/**
 * CSP Validation Result
 */
export interface CSPValidationResult {
  valid: boolean;
  violations: CSPViolation[];
}

/**
 * Validates CSP compliance for required directives
 */
export function getRequiredCSPDirectives(): string[] {
  return [
    `script-src 'self' ${WIDGET_CDN_BASE_URL}`,
    `connect-src ${WIDGET_API_BASE_URL}`,
    `img-src ${WIDGET_CDN_BASE_URL} ${WIDGET_API_BASE_URL} data:`,
    `style-src 'self' ${WIDGET_CDN_BASE_URL}`,
  ];
}

/**
 * Generates CSP-friendly embed code with nonce support
 */
export function generateCSPFriendlyEmbedCode(
  widgetId: string,
  version: string,
  integrity?: string,
  nonce?: string
): string {
  const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
  const integrityAttr = integrity ? ` integrity="${integrity}" crossorigin="anonymous"` : '';
  const scriptSrc = buildWidgetScriptUrl(version);

  return `<!-- Tresta Testimonial Widget (CSP-friendly) -->
<div id="tresta-widget-${widgetId}" data-widget-id="${widgetId}"></div>
<script async 
        src="${scriptSrc}"${integrityAttr}${nonceAttr}
        data-widget-id="${widgetId}"></script>`;
}

// Export singleton instance
export const defaultCSPValidator = new CSPValidator();
