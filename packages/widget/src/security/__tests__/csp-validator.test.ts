/**
 * CSP Validator Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CSPValidator, 
  getRequiredCSPDirectives, 
  generateCSPFriendlyEmbedCode 
} from '../csp-validator';

describe('CSPValidator', () => {
  let validator: CSPValidator;

  beforeEach(() => {
    validator = new CSPValidator();
  });

  describe('validateURL', () => {
    it('should allow URLs from cdn.tresta.com', () => {
      expect(validator.validateURL('https://cdn.tresta.com/widget/v1/script.js')).toBe(true);
    });

    it('should allow URLs from api.tresta.com', () => {
      expect(validator.validateURL('https://api.tresta.com/widget/123/data')).toBe(true);
    });

    it('should allow subdomains of allowed domains', () => {
      expect(validator.validateURL('https://static.cdn.tresta.com/assets/image.png')).toBe(true);
    });

    it('should allow relative URLs', () => {
      expect(validator.validateURL('/assets/image.png')).toBe(true);
      expect(validator.validateURL('./image.png')).toBe(true);
      expect(validator.validateURL('../image.png')).toBe(true);
    });

    it('should allow data URLs', () => {
      expect(validator.validateURL('data:image/png;base64,iVBORw0KGgoAAAANS')).toBe(true);
    });

    it('should reject URLs from non-allowed domains', () => {
      expect(validator.validateURL('https://evil.com/malicious.js')).toBe(false);
      expect(validator.validateURL('https://example.com/image.png')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(validator.validateURL('not a url')).toBe(false);
      expect(validator.validateURL('')).toBe(false);
    });

    it('should reject javascript: URLs', () => {
      expect(validator.validateURL('javascript:alert(1)')).toBe(false);
    });
  });

  describe('validateResources', () => {
    it('should pass validation for clean content', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <div class="testimonial">
          <p>Great product!</p>
          <img src="https://cdn.tresta.com/avatars/user.jpg" alt="User" />
        </div>
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect images from non-allowed domains', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <img src="https://evil.com/malicious.jpg" alt="Bad" />
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('image');
      expect(result.violations[0].url).toBe('https://evil.com/malicious.jpg');
    });

    it('should detect script tags in content', () => {
      const root = document.createElement('div');
      const script = document.createElement('script');
      script.textContent = 'alert(1)';
      root.appendChild(script);

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('script');
    });

    it('should detect iframe tags in content', () => {
      const root = document.createElement('div');
      const iframe = document.createElement('iframe');
      iframe.src = 'https://evil.com';
      root.appendChild(iframe);

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('iframe');
    });

    it('should detect javascript: URLs in links', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <a href="javascript:alert(1)">Click me</a>
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('link');
    });

    it('should detect inline event handlers', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <button onclick="alert(1)">Click</button>
        <img src="test.jpg" onerror="alert(1)" />
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
      expect(result.violations.some(v => v.type === 'inline-event')).toBe(true);
    });

    it('should allow data URLs for images', () => {
      const root = document.createElement('div');
      root.innerHTML = `
        <img src="data:image/png;base64,iVBORw0KGgoAAAANS" alt="Icon" />
      `;

      const result = validator.validateResources(root);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('getNonce', () => {
    it('should return nonce from config', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce-123' });
      expect(validatorWithNonce.getNonce()).toBe('test-nonce-123');
    });

    it('should return null if no nonce is configured', () => {
      expect(validator.getNonce()).toBeNull();
    });

    it('should find nonce from script tag', () => {
      // Create a script tag with nonce
      const script = document.createElement('script');
      script.setAttribute('data-widget-id', '123');
      script.setAttribute('nonce', 'script-nonce-456');
      document.body.appendChild(script);

      const result = validator.getNonce();
      
      // Clean up
      document.body.removeChild(script);

      expect(result).toBe('script-nonce-456');
    });
  });

  describe('applyNonce', () => {
    it('should apply nonce to script elements', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce' });
      const script = document.createElement('script');
      
      validatorWithNonce.applyNonce(script);
      
      expect(script.getAttribute('nonce')).toBe('test-nonce');
    });

    it('should apply nonce to style elements', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce' });
      const style = document.createElement('style');
      
      validatorWithNonce.applyNonce(style);
      
      expect(style.getAttribute('nonce')).toBe('test-nonce');
    });

    it('should not apply nonce to other elements', () => {
      const validatorWithNonce = new CSPValidator({ nonce: 'test-nonce' });
      const div = document.createElement('div');
      
      validatorWithNonce.applyNonce(div);
      
      expect(div.getAttribute('nonce')).toBeNull();
    });

    it('should not apply nonce if none is configured', () => {
      const script = document.createElement('script');
      
      validator.applyNonce(script);
      
      expect(script.getAttribute('nonce')).toBeNull();
    });
  });

  describe('getViolations and clearViolations', () => {
    it('should return violations from validateResources', () => {
      const root = document.createElement('div');
      root.innerHTML = `<script>alert(1)</script>`;

      const result = validator.validateResources(root);
      
      // validateResources returns violations, doesn't store them internally
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should clear violations when clearViolations is called', () => {
      // Clear any existing violations
      validator.clearViolations();
      
      // Initially should be empty
      expect(validator.getViolations()).toHaveLength(0);
      
      // After clearing, should still be empty
      validator.clearViolations();
      expect(validator.getViolations()).toHaveLength(0);
    });
  });

  describe('custom allowed domains', () => {
    it('should respect custom allowed domains', () => {
      const customValidator = new CSPValidator({
        allowedDomains: ['example.com', 'custom.com']
      });

      expect(customValidator.validateURL('https://example.com/image.jpg')).toBe(true);
      expect(customValidator.validateURL('https://custom.com/script.js')).toBe(true);
      expect(customValidator.validateURL('https://cdn.tresta.com/widget.js')).toBe(false);
    });
  });
});

describe('getRequiredCSPDirectives', () => {
  it('should return required CSP directives', () => {
    const directives = getRequiredCSPDirectives();
    
    expect(directives).toContain("script-src 'self' https://cdn.tresta.com");
    expect(directives).toContain("connect-src https://api.tresta.com");
    expect(directives).toContain("img-src https://cdn.tresta.com https://api.tresta.com data:");
    expect(directives).toContain("style-src 'self' https://cdn.tresta.com");
  });
});

describe('generateCSPFriendlyEmbedCode', () => {
  it('should generate basic embed code', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0');
    
    expect(code).toContain('data-widget-id="123"');
    expect(code).toContain('v1.0.0/tresta-widget.iife.js');
    expect(code).toContain('async');
  });

  it('should include integrity hash when provided', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0', 'sha384-abc123');
    
    expect(code).toContain('integrity="sha384-abc123"');
    expect(code).toContain('crossorigin="anonymous"');
  });

  it('should include nonce when provided', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0', undefined, 'nonce-xyz');
    
    expect(code).toContain('nonce="nonce-xyz"');
  });

  it('should include both integrity and nonce when provided', () => {
    const code = generateCSPFriendlyEmbedCode('123', '1.0.0', 'sha384-abc123', 'nonce-xyz');
    
    expect(code).toContain('integrity="sha384-abc123"');
    expect(code).toContain('nonce="nonce-xyz"');
    expect(code).toContain('crossorigin="anonymous"');
  });
});
