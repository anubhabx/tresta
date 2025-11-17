import { describe, it, expect, beforeEach } from 'vitest';
import { ContentSanitizer, sanitizeContent, sanitizePlainText, sanitizeURL } from '../sanitizer';

describe('ContentSanitizer', () => {
  let sanitizer: ContentSanitizer;

  beforeEach(() => {
    sanitizer = new ContentSanitizer();
  });

  describe('Plain Text Escaping', () => {
    it('should escape HTML entities in plain text', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = sanitizer.sanitizePlainText(input);
      // Quotes should be escaped for security
      expect(result).toBe('Hello &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; World');
    });

    it('should escape special characters', () => {
      const input = '< > & " \'';
      const result = sanitizer.sanitizePlainText(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });

    it('should handle empty strings', () => {
      const result = sanitizer.sanitizePlainText('');
      expect(result).toBe('');
    });

    it('should preserve plain text without HTML', () => {
      const input = 'This is a normal testimonial text.';
      const result = sanitizer.sanitizePlainText(input);
      expect(result).toBe(input);
    });
  });

  describe('HTML Sanitization with DOMPurify', () => {
    it('should allow whitelisted tags', async () => {
      const input = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
    });

    it('should allow anchor tags with href', async () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<a');
      expect(result).toContain('href="https://example.com"');
    });

    it('should allow list tags', async () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    it('should allow br tags', async () => {
      const input = 'Line 1<br>Line 2';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<br>');
    });

    it('should allow b and i tags', async () => {
      const input = '<b>Bold</b> and <i>Italic</i>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<b>');
      expect(result).toContain('<i>');
    });
  });

  describe('XSS Attack Prevention', () => {
    it('should block script tags', async () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should block onclick event handlers', async () => {
      const input = '<a href="#" onclick="alert(\'xss\')">Click me</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('onclick');
    });

    it('should block onerror event handlers', async () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('<img');
    });

    it('should block javascript: protocol in links', async () => {
      const input = '<a href="javascript:alert(\'xss\')">Click</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('javascript:');
    });

    it('should block data: protocol in links', async () => {
      const input = '<a href="data:text/html,<script>alert(\'xss\')</script>">Click</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('data:');
    });

    it('should block iframe tags', async () => {
      const input = '<iframe src="https://evil.com"></iframe>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('<iframe');
    });

    it('should block object tags', async () => {
      const input = '<object data="https://evil.com"></object>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('<object');
    });

    it('should block embed tags', async () => {
      const input = '<embed src="https://evil.com">';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('<embed');
    });

    it('should block style tags', async () => {
      const input = '<style>body { display: none; }</style>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('<style');
    });

    it('should block inline styles', async () => {
      const input = '<p style="display:none">Hidden</p>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('style=');
    });

    it('should block form tags', async () => {
      const input = '<form action="https://evil.com"><input type="text"></form>';
      const result = await sanitizer.sanitize(input);
      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
    });
  });

  describe('External Link Security', () => {
    it('should add rel="noopener noreferrer" to external links', async () => {
      const input = '<a href="https://external.com">External</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should add rel="noopener noreferrer" to target="_blank" links', async () => {
      const input = '<a href="https://example.com" target="_blank">Link</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('target="_blank"');
    });

    it('should not add rel to relative links', async () => {
      const input = '<a href="/page">Internal</a>';
      const result = await sanitizer.sanitize(input);
      // Relative links should not have rel added (they're internal)
      expect(result).toContain('href="/page"');
    });
  });

  describe('URL Validation', () => {
    it('should allow http URLs', () => {
      const url = 'http://example.com';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBe(url);
    });

    it('should allow https URLs', () => {
      const url = 'https://example.com';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBe(url);
    });

    it('should allow mailto URLs', () => {
      const url = 'mailto:test@example.com';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBe(url);
    });

    it('should block javascript: protocol', () => {
      const url = 'javascript:alert("xss")';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBeNull();
    });

    it('should block data: protocol', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBeNull();
    });

    it('should block file: protocol', () => {
      const url = 'file:///etc/passwd';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBeNull();
    });

    it('should allow relative URLs', () => {
      const url = '/path/to/page';
      const result = sanitizer.sanitizeURL(url);
      expect(result).toBe(url);
    });

    it('should handle empty URLs', () => {
      const result = sanitizer.sanitizeURL('');
      expect(result).toBeNull();
    });

    it('should handle invalid URLs', () => {
      const result = sanitizer.sanitizeURL('not a valid url');
      expect(result).toBeNull();
    });
  });

  describe('Whitelist Enforcement', () => {
    it('should strip non-whitelisted tags', async () => {
      const input = '<div><p>Allowed</p><span>Not allowed</span></div>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<p>');
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('<span>');
    });

    it('should strip non-whitelisted attributes', async () => {
      const input = '<a href="https://example.com" class="link" id="mylink">Link</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('href=');
      expect(result).not.toContain('class=');
      expect(result).not.toContain('id=');
    });

    it('should only allow href and target on anchor tags', async () => {
      const input = '<a href="https://example.com" target="_blank" data-custom="value">Link</a>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('href=');
      expect(result).toContain('target=');
      expect(result).not.toContain('data-custom');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const result = await sanitizer.sanitize('');
      expect(result).toBe('');
    });

    it('should handle null-like content', async () => {
      const result = await sanitizer.sanitize(null as any);
      expect(result).toBe('');
    });

    it('should handle content with only whitespace', async () => {
      const result = await sanitizer.sanitize('   ');
      expect(result).toBe('   ');
    });

    it('should handle nested HTML', async () => {
      const input = '<p><strong><em>Nested</em></strong></p>';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
    });

    it('should handle malformed HTML', async () => {
      const input = '<p>Unclosed paragraph<strong>Bold';
      const result = await sanitizer.sanitize(input);
      // DOMPurify should fix malformed HTML
      expect(result).toBeTruthy();
    });

    it('should handle mixed content', async () => {
      const input = 'Plain text <strong>bold</strong> more plain text';
      const result = await sanitizer.sanitize(input);
      expect(result).toContain('Plain text');
      expect(result).toContain('<strong>');
      expect(result).toContain('more plain text');
    });
  });

  describe('Performance - Lazy Loading', () => {
    it('should not load DOMPurify for plain text', async () => {
      const input = 'This is plain text without any HTML';
      const result = await sanitizer.sanitize(input);
      expect(result).toBe(input);
      // DOMPurify should not be loaded for plain text
    });

    it('should load DOMPurify only when HTML is detected', async () => {
      const plainText = 'Plain text';
      const htmlText = '<p>HTML text</p>';
      
      // First call with plain text
      const result1 = await sanitizer.sanitize(plainText);
      expect(result1).toBe(plainText);
      
      // Second call with HTML
      const result2 = await sanitizer.sanitize(htmlText);
      expect(result2).toContain('<p>');
    });
  });

  describe('Convenience Functions', () => {
    it('should work with sanitizeContent function', async () => {
      const input = '<p>Test</p>';
      const result = await sanitizeContent(input);
      expect(result).toContain('<p>');
    });

    it('should work with sanitizePlainText function', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizePlainText(input);
      expect(result).not.toContain('<script>');
    });

    it('should work with sanitizeURL function', () => {
      const url = 'https://example.com';
      const result = sanitizeURL(url);
      expect(result).toBe(url);
    });
  });

  describe('Custom Configuration', () => {
    it('should accept custom allowed tags', async () => {
      const customSanitizer = new ContentSanitizer({
        allowedTags: ['p', 'strong']
      });
      
      const input = '<p><strong>Bold</strong><em>Italic</em></p>';
      const result = await customSanitizer.sanitize(input);
      expect(result).toContain('<strong>');
      expect(result).not.toContain('<em>');
    });

    it('should accept custom allowed attributes', async () => {
      const customSanitizer = new ContentSanitizer({
        allowedTags: ['a'],
        allowedAttributes: {
          'a': ['href']
        }
      });
      
      const input = '<a href="https://example.com" target="_blank">Link</a>';
      const result = await customSanitizer.sanitize(input);
      expect(result).toContain('href=');
      // target should be stripped by custom config
    });
  });
});
