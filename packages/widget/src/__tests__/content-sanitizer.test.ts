/**
 * Unit tests for Content Sanitizer (Task 21.4)
 * Tests Requirements: 24.2
 * 
 * Coverage:
 * - XSS attack vectors (script tags, event handlers, etc.)
 * - Whitelist enforcement
 * - URL validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentSanitizer, sanitizeContent, sanitizePlainText, sanitizeURL } from '../security/sanitizer';

describe('Content Sanitizer', () => {
  let sanitizer: ContentSanitizer;

  beforeEach(() => {
    sanitizer = new ContentSanitizer();
  });

  describe('Plain Text Escaping', () => {
    it('should escape HTML entities in plain text', async () => {
      const input = 'Hello <world>';
      const result = await sanitizer.sanitize(input);

      expect(result).toBe('Hello &lt;world&gt;');
    });

    it('should escape special characters', async () => {
      const input = 'Test & "quotes" and \'apostrophes\'';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
    });

    it('should handle empty string', async () => {
      const result = await sanitizer.sanitize('');
      expect(result).toBe('');
    });

    it('should use fast path for non-HTML content', async () => {
      const input = 'Just plain text without any HTML';
      const result = await sanitizer.sanitize(input);

      expect(result).toBe('Just plain text without any HTML');
    });

    it('should use synchronous sanitizePlainText for plain text', () => {
      const input = 'Hello <world>';
      const result = sanitizer.sanitizePlainText(input);

      expect(result).toBe('Hello &lt;world&gt;');
    });
  });

  describe('XSS Attack Vectors', () => {
    it('should block script tags', async () => {
      const input = '<script>alert("XSS")</script>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should block inline event handlers', async () => {
      const input = '<p onclick="alert(\'XSS\')">Click me</p>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should block javascript: URLs', async () => {
      const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });

    it('should block data: URLs', async () => {
      const input = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('data:');
    });

    it('should block onerror handlers', async () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should block onload handlers', async () => {
      const input = '<body onload="alert(\'XSS\')">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('should block style tags', async () => {
      const input = '<style>body { background: red; }</style>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<style>');
    });

    it('should block iframe tags', async () => {
      const input = '<iframe src="https://evil.com"></iframe>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<iframe>');
    });

    it('should block object tags', async () => {
      const input = '<object data="https://evil.com"></object>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<object>');
    });

    it('should block embed tags', async () => {
      const input = '<embed src="https://evil.com">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<embed>');
    });

    it('should block svg with script', async () => {
      const input = '<svg><script>alert("XSS")</script></svg>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<svg>');
      expect(result).not.toContain('<script>');
    });

    it('should block form tags', async () => {
      const input = '<form action="https://evil.com"><input type="submit"></form>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<form>');
    });

    it('should block meta tags', async () => {
      const input = '<meta http-equiv="refresh" content="0;url=https://evil.com">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<meta>');
    });

    it('should block link tags', async () => {
      const input = '<link rel="stylesheet" href="https://evil.com/style.css">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<link>');
    });
  });

  describe('Whitelist Enforcement', () => {
    it('should allow whitelisted tags: a, b, i, strong, em, p, br, ul, li', async () => {
      const input = '<p>This is <strong>bold</strong> and <em>italic</em> text with a <a href="https://example.com">link</a></p>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('<a');
    });

    it('should allow b and i tags', async () => {
      const input = '<p>This is <b>bold</b> and <i>italic</i></p>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('<b>');
      expect(result).toContain('<i>');
    });

    it('should allow br tags', async () => {
      const input = '<p>Line 1<br>Line 2</p>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('<br>');
    });

    it('should allow ul and li tags', async () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    it('should strip non-whitelisted tags', async () => {
      const input = '<div><span>Text</span></div>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<span>');
      expect(result).toContain('Text');
    });

    it('should allow only href and target attributes on anchor tags', async () => {
      const input = '<a href="https://example.com" target="_blank" class="link" id="mylink">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('href=');
      expect(result).toContain('target=');
      expect(result).not.toContain('class=');
      expect(result).not.toContain('id=');
    });

    it('should strip inline styles', async () => {
      const input = '<p style="color: red;">Styled text</p>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('style=');
      expect(result).toContain('Styled text');
    });

    it('should strip data attributes', async () => {
      const input = '<p data-id="123">Text</p>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('data-id');
      expect(result).toContain('Text');
    });
  });

  describe('URL Validation', () => {
    it('should allow http URLs', async () => {
      const input = '<a href="http://example.com">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('href="http://example.com"');
    });

    it('should allow https URLs', async () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('href="https://example.com"');
    });

    it('should allow mailto URLs', async () => {
      const input = '<a href="mailto:test@example.com">Email</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('href="mailto:test@example.com"');
    });

    it('should block javascript URLs', async () => {
      const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('javascript:');
    });

    it('should block data URLs', async () => {
      const input = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('data:');
    });

    it('should block vbscript URLs', async () => {
      const input = '<a href="vbscript:msgbox(\'XSS\')">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('vbscript:');
    });

    it('should validate URLs with sanitizeURL method', () => {
      expect(sanitizer.sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(sanitizer.sanitizeURL('http://example.com')).toBe('http://example.com');
      expect(sanitizer.sanitizeURL('mailto:test@example.com')).toBe('mailto:test@example.com');
      expect(sanitizer.sanitizeURL('javascript:alert("XSS")')).toBeNull();
      expect(sanitizer.sanitizeURL('data:text/html,<script>alert("XSS")</script>')).toBeNull();
      expect(sanitizer.sanitizeURL('')).toBeNull();
    });

    it('should handle relative URLs', () => {
      expect(sanitizer.sanitizeURL('/path/to/page')).toBe('/path/to/page');
      expect(sanitizer.sanitizeURL('./relative/path')).toBe('./relative/path');
      expect(sanitizer.sanitizeURL('../parent/path')).toBe('../parent/path');
    });

    it('should reject invalid URLs', () => {
      expect(sanitizer.sanitizeURL('not a valid url')).toBeNull();
      expect(sanitizer.sanitizeURL('ftp://example.com')).toBeNull();
    });
  });

  describe('External Link Security', () => {
    it('should add rel="noopener noreferrer" to external links', async () => {
      const input = '<a href="https://external.com" target="_blank">External</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should add rel="noopener noreferrer" to all target="_blank" links', async () => {
      const input = '<a href="https://example.com" target="_blank">Link</a>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should preserve existing rel attributes and add security attributes', async () => {
      const input = '<a href="https://example.com" target="_blank" rel="external">Link</a>';
      const result = await sanitizer.sanitize(input);

      // Should have noopener and noreferrer
      expect(result).toContain('noopener');
      expect(result).toContain('noreferrer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input', async () => {
      const result = await sanitizer.sanitize(null as any);
      expect(result).toBe('');
    });

    it('should handle undefined input', async () => {
      const result = await sanitizer.sanitize(undefined as any);
      expect(result).toBe('');
    });

    it('should handle nested HTML', async () => {
      const input = '<p><strong><em>Nested</em></strong></p>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('Nested');
    });

    it('should handle malformed HTML', async () => {
      const input = '<p>Unclosed paragraph';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('Unclosed paragraph');
    });

    it('should handle mixed content', async () => {
      const input = 'Plain text <strong>bold</strong> more text';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('Plain text');
      expect(result).toContain('<strong>');
      expect(result).toContain('more text');
    });

    it('should handle very long content', async () => {
      const input = '<p>' + 'x'.repeat(10000) + '</p>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('<p>');
      expect(result.length).toBeGreaterThan(10000);
    });

    it('should handle unicode characters', async () => {
      const input = '<p>Hello 世界 🌍</p>';
      const result = await sanitizer.sanitize(input);

      expect(result).toContain('世界');
      expect(result).toContain('🌍');
    });
  });

  describe('Custom Configuration', () => {
    it('should allow custom allowed tags', async () => {
      const customSanitizer = new ContentSanitizer({
        allowedTags: ['p', 'span'],
        allowedAttributes: {},
      });

      const input = '<p>Paragraph</p><span>Span</span><strong>Bold</strong>';
      const result = await customSanitizer.sanitize(input);

      expect(result).toContain('<p>');
      expect(result).toContain('<span>');
      expect(result).not.toContain('<strong>');
      expect(result).toContain('Bold'); // Content should remain
    });

    it('should allow custom allowed attributes', async () => {
      const customSanitizer = new ContentSanitizer({
        allowedTags: ['a', 'p'],
        allowedAttributes: {
          'a': ['href', 'title'],
        },
      });

      const input = '<a href="https://example.com" title="Example" target="_blank">Link</a>';
      const result = await customSanitizer.sanitize(input);

      expect(result).toContain('href=');
      expect(result).toContain('title=');
      expect(result).not.toContain('target=');
    });
  });

  describe('Convenience Functions', () => {
    it('should provide sanitizeContent convenience function', async () => {
      const input = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = await sanitizeContent(input);

      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>');
    });

    it('should provide sanitizePlainText convenience function', () => {
      const input = 'Hello <world>';
      const result = sanitizePlainText(input);

      expect(result).toBe('Hello &lt;world&gt;');
    });

    it('should provide sanitizeURL convenience function', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com');
      expect(sanitizeURL('javascript:alert("XSS")')).toBeNull();
    });
  });

  describe('DOMPurify Lazy Loading', () => {
    it('should lazy load DOMPurify only when HTML is detected', async () => {
      // Plain text should not load DOMPurify
      const plainText = 'Just plain text';
      const result1 = await sanitizer.sanitize(plainText);
      expect(result1).toBe(plainText);

      // HTML should load DOMPurify
      const htmlText = '<p>HTML content</p>';
      const result2 = await sanitizer.sanitize(htmlText);
      expect(result2).toContain('<p>');
    });

    it('should handle multiple sanitizations efficiently', async () => {
      // First call with HTML loads DOMPurify
      await sanitizer.sanitize('<p>First</p>');

      // Subsequent calls should reuse loaded DOMPurify
      const result = await sanitizer.sanitize('<p>Second</p>');
      expect(result).toContain('<p>');
      expect(result).toContain('Second');
    });
  });

  describe('Real-World XSS Vectors', () => {
    it('should block XSS via img src', async () => {
      const input = '<img src=x onerror="alert(\'XSS\')">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should block XSS via svg', async () => {
      const input = '<svg onload="alert(\'XSS\')">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert');
    });

    it('should block XSS via base tag', async () => {
      const input = '<base href="javascript:alert(\'XSS\')">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('<base');
      expect(result).not.toContain('javascript:');
    });

    it('should block XSS via input', async () => {
      const input = '<input type="text" value="x" onfocus="alert(\'XSS\')">';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onfocus');
      expect(result).not.toContain('alert');
    });

    it('should block XSS via details/summary', async () => {
      const input = '<details open ontoggle="alert(\'XSS\')"><summary>Click</summary></details>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('ontoggle');
      expect(result).not.toContain('alert');
    });

    it('should block XSS via marquee', async () => {
      const input = '<marquee onstart="alert(\'XSS\')">Text</marquee>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onstart');
      expect(result).not.toContain('alert');
    });

    it('should block XSS via video', async () => {
      const input = '<video src="x" onerror="alert(\'XSS\')"></video>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should block XSS via audio', async () => {
      const input = '<audio src="x" onerror="alert(\'XSS\')"></audio>';
      const result = await sanitizer.sanitize(input);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });
  });
});
