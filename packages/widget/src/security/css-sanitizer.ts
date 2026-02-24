/**
 * CSS Sanitizer — strips dangerous CSS constructs to prevent injection attacks.
 *
 * Blocked patterns:
 * - url()          — can exfiltrate data or load external resources
 * - @import        — can load external stylesheets with arbitrary content
 * - expression()   — legacy IE JS-in-CSS execution vector
 * - -moz-binding   — Firefox XBL binding vector (deprecated but still blocked)
 * - javascript:    — script execution via CSS values
 * - behavior       — legacy IE HTC behavior attachment
 * - -o-link        — Opera link behavior
 */

const DANGEROUS_CSS_PATTERNS: RegExp[] = [
  /url\s*\(/gi,
  /@import/gi,
  /expression\s*\(/gi,
  /-moz-binding\s*:/gi,
  /javascript\s*:/gi,
  /behavior\s*:/gi,
  /-o-link\s*:/gi,
  /<\/?script/gi,
  /<\/?style/gi,
];

/**
 * Sanitizes a CSS string by removing dangerous constructs.
 * Returns the sanitized CSS string, or an empty string if input is falsy.
 */
export function sanitizeCss(css: string): string {
  if (!css) return '';

  let sanitized = css;
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '/* [blocked] */');
  }

  return sanitized;
}
