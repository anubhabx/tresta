/**
 * Security module - XSS protection, content sanitization, and CSP compliance
 */

export {
  ContentSanitizer,
  defaultSanitizer,
  sanitizeContent,
  sanitizePlainText,
  sanitizeURL
} from './sanitizer';

export { 
  CSPValidator, 
  defaultCSPValidator, 
  getRequiredCSPDirectives, 
  generateCSPFriendlyEmbedCode,
  type CSPConfig,
  type CSPViolation,
  type CSPValidationResult
} from './csp-validator';
