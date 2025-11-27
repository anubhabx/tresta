/**
 * CSP Validator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CSPValidator,
  getRequiredCSPDirectives,
  generateCSPFriendlyEmbedCode,
} from '../csp-validator';
import { WIDGET_API_BASE_URL, WIDGET_CDN_BASE_URL } from '../../config/env';

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const CDN_HOST = getHostname(WIDGET_CDN_BASE_URL);
const API_HOST = getHostname(WIDGET_API_BASE_URL);

describe('CSPValidator', () => {
  let validator: CSPValidator;

  beforeEach(() => {
    validator = new CSPValidator();
  });

  describe('validateURL', () => {
    it('allows CDN URLs', () => {
      expect(validator.validateURL(`https://${CDN_HOST}/widget/v1/script.js`)).toBe(true);
    });

    it('allows API URLs', () => {
      expect(validator.validateURL(`https://${API_HOST}/widget/123/data`)).toBe(true);
    });

    it('allows subdomains of allowed domains', () => {
      expect(validator.validateURL(`https://static.${CDN_HOST}/assets/image.png`)).toBe(true);
    });

    it('allows relative URLs', () => {
      expect(validator.validateURL('/assets/image.png')).toBe(true);
      expect(validator.validateURL('./image.png')).toBe(true);
      expect(validator.validateURL('../image.png')).toBe(true);
    });

    it('allows data URLs', () => {
      expect(validator.validateURL('data:image/png;base64,iVBORw0KGgoAAAANS')).toBe(true);
    });

    it('rejects non-allowed domains', () => {
      expect(validator.validateURL('https://evil.com/malicious.js')).toBe(false);
      expect(validator.validateURL('https://example.com/image.png')).toBe(false);
    });

    it('rejects invalid URLs', () => {
      expect(validator.validateURL('not a url')).toBe(false);
      expect(validator.validateURL('')).toBe(false);
    });

    it('rejects javascript URLs', () => {
      expect(validator.validateURL('javascript:alert(1)')).toBe(false);
    });
  });

  describe('validateResources', () => {
    it('passes validation for clean content', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <div class="testimonial">
          <p>Great product!</p>
          <img src="https://${CDN_HOST}/avatars/user.jpg" alt="User" />
        </div>
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('detects images from non-allowed domains', () => {
      const root = document.createElement('div');
      root.innerHTML = `<img src="https://evil.com/malicious.jpg" alt="Bad" />`;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('image');
      expect(result.violations[0].url).toBe('https://evil.com/malicious.jpg');
    });

    it('detects script tags', () => {
      const root = document.createElement('div');
      const script = document.createElement('script');
      script.textContent = 'alert(1)';
      root.appendChild(script);

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('script');
    });

    it('detects iframes', () => {
      const root = document.createElement('div');
      const iframe = document.createElement('iframe');
      iframe.src = 'https://evil.com';
      root.appendChild(iframe);

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('iframe');
    });

    it('detects javascript links', () => {
      const root = document.createElement('div');
      root.innerHTML = `<a href="javascript:alert(1)">Click me</a>`;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('link');
    });

    it('detects inline event handlers', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <button onclick="alert(1)">Click</button>
        <img src="test.jpg" onerror="alert(1)" />
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
      expect(result.violations.some((violation) => violation.type === 'inline-event')).toBe(true);
    });

    it('allows data URLs for images', () => {
      const root = document.createElement('div');
      root.innerHTML = `<img src="data:image/png;base64,iVBORw0KGgoAAAANS" alt="Icon" />`;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('getNonce', () => {
    it('returns nonce from config', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce-123' });
      expect(validatorWithNonce.getNonce()).toBe('test-nonce-123');
    });

    it('returns null when nonce is missing', () => {
      expect(validator.getNonce()).toBeNull();
    });

    it('reads nonce from script tags', () => {
      const script = document.createElement('script');
      script.setAttribute('data-widget-id', '123');
      script.setAttribute('nonce', 'script-nonce-456');
      document.body.appendChild(script);

      const result = validator.getNonce();

      document.body.removeChild(script);
      expect(result).toBe('script-nonce-456');
    });
  });

  describe('applyNonce', () => {
    it('applies nonce to script elements', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce' });
      const script = document.createElement('script');

      validatorWithNonce.applyNonce(script);
      expect(script.getAttribute('nonce')).toBe('test-nonce');
    });

    it('applies nonce to style elements', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce' });
      const style = document.createElement('style');

      validatorWithNonce.applyNonce(style);
      expect(style.getAttribute('nonce')).toBe('test-nonce');
    });

    it('skips nonce for other elements', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce' });
      const div = document.createElement('div');

      validatorWithNonce.applyNonce(div);
      expect(div.getAttribute('nonce')).toBeNull();
    });

    it('does nothing when nonce is not configured', () => {
      const script = document.createElement('script');
      validator.applyNonce(script);
      expect(script.getAttribute('nonce')).toBeNull();
    });
  });

  describe('getViolations and clearViolations', () => {
    it('returns violations from validateResources', () => {
      const root = document.createElement('div');
      root.innerHTML = `<script>alert(1)</script>`;

      const result = validator.validateResources(root);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('clears recorded violations', () => {
      validator.clearViolations();
      expect(validator.getViolations()).toHaveLength(0);
      validator.clearViolations();
      expect(validator.getViolations()).toHaveLength(0);
    });
  });

  describe('custom allowed domains', () => {
    it('respects custom allow-list', () => {
      const customValidator = new CSPValidator({
        allowedDomains: ['example.com', 'custom.com'],
      });

      expect(customValidator.validateURL('https://example.com/image.jpg')).toBe(true);
      expect(customValidator.validateURL('https://custom.com/script.js')).toBe(true);
      expect(customValidator.validateURL(`https://${CDN_HOST}/widget.js`)).toBe(false);
    });
  });
});

describe('getRequiredCSPDirectives', () => {
  it('returns required directives with env hosts', () => {
    const directives = getRequiredCSPDirectives();

    expect(directives).toContain(`script-src 'self' ${WIDGET_CDN_BASE_URL}`);
    expect(directives).toContain(`connect-src ${WIDGET_API_BASE_URL}`);
    expect(directives).toContain(`img-src ${WIDGET_CDN_BASE_URL} ${WIDGET_API_BASE_URL} data:`);
    expect(directives).toContain(`style-src 'self' ${WIDGET_CDN_BASE_URL}`);
  });
});

describe('generateCSPFriendlyEmbedCode', () => {
  it('generates basic embed code', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0');

    expect(code).toContain('data-widget-id="123"');
    expect(code).toContain('v1.0.0/tresta-widget.iife.js');
    expect(code).toContain('async');
  });

  it('includes integrity hash when provided', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0', 'sha384-abc123');

    expect(code).toContain('integrity="sha384-abc123"');
    expect(code).toContain('crossorigin="anonymous"');
  });

  it('includes nonce when provided', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0', undefined, 'nonce-xyz');

    expect(code).toContain('nonce="nonce-xyz"');
  });

  it('includes both integrity and nonce when provided', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0', 'sha384-abc123', 'nonce-xyz');

    expect(code).toContain('integrity="sha384-abc123"');
    expect(code).toContain('nonce="nonce-xyz"');
    expect(code).toContain('crossorigin="anonymous"');
  });
});
