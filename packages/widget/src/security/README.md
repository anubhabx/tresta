# Content Sanitizer

The ContentSanitizer module provides XSS protection for user-generated content in the Tresta Widget System.

## Features

- **Plain-text escaping**: Fast HTML entity escaping for content without HTML markup
- **Lazy loading**: DOMPurify is only loaded when HTML markup is detected, keeping bundle size minimal
- **Whitelist-based sanitization**: Only allows safe HTML tags and attributes
- **URL validation**: Restricts URLs to http, https, and mailto protocols
- **External link security**: Automatically adds `rel="noopener noreferrer"` to external links

## Usage

### Basic Usage

```typescript
import { sanitizeContent, sanitizePlainText, sanitizeURL } from './security';

// Sanitize content (async - may load DOMPurify)
const cleanHTML = await sanitizeContent('<p>User content</p>');

// Sanitize plain text (sync - no DOMPurify needed)
const cleanText = sanitizePlainText('Plain text content');

// Validate and sanitize URLs
const cleanURL = sanitizeURL('https://example.com');
```

### Using the ContentSanitizer Class

```typescript
import { ContentSanitizer } from './security';

const sanitizer = new ContentSanitizer();

// Async sanitization (loads DOMPurify if HTML detected)
const result = await sanitizer.sanitize('<p>Content</p>');

// Sync plain text sanitization
const text = sanitizer.sanitizePlainText('Plain text');

// URL validation
const url = sanitizer.sanitizeURL('https://example.com');
```

### Custom Configuration

```typescript
import { ContentSanitizer } from './security';

const customSanitizer = new ContentSanitizer({
  allowedTags: ['p', 'strong', 'em'],
  allowedAttributes: {
    'a': ['href']
  }
});

const result = await customSanitizer.sanitize('<p><strong>Bold</strong></p>');
```

## Default Configuration

### Allowed HTML Tags
- `a`, `b`, `i`, `strong`, `em`, `p`, `br`, `ul`, `li`

### Allowed Attributes
- `href` and `target` on `<a>` tags only

### Allowed URL Protocols
- `http:`, `https:`, `mailto:`
- Relative URLs (`/path`, `./path`, `../path`)

## Security Features

### XSS Protection

The sanitizer blocks all common XSS attack vectors:
- Script tags
- Event handlers (onclick, onerror, etc.)
- JavaScript protocol in URLs
- Data URLs
- Inline styles
- Form elements
- Iframes and embeds

### External Link Security

All external links automatically receive `rel="noopener noreferrer"` to prevent:
- Tabnapping attacks
- Referrer leakage

### Performance Optimization

DOMPurify is only loaded when HTML markup is detected in the content:
- Plain text content: Fast HTML entity escaping (no DOMPurify)
- HTML content: Lazy loads DOMPurify on first use
- Subsequent calls: Reuses loaded DOMPurify instance

## Testing

The sanitizer has 100% test coverage including:
- Plain text escaping
- HTML sanitization
- XSS attack prevention
- URL validation
- Whitelist enforcement
- Edge cases
- Performance (lazy loading)

Run tests:
```bash
npm test -- src/security/__tests__/sanitizer.test.ts
```

## Requirements Satisfied

This implementation satisfies the following requirements:
- 18.1: Sanitize all testimonial text content to prevent XSS injection
- 18.2: Validate and sanitize all URLs before rendering
- 18.3: Do not execute JavaScript code in testimonial content
- 18.4: Escape HTML entities in author names, roles, and company names
- 18.Sanitization.1: Use whitelist-based HTML sanitizer (DOMPurify)
- 18.Sanitization.2: Allow only safe HTML tags
- 18.Sanitization.3: Allow only safe attributes on allowed tags
- 18.Sanitization.4: Strip all other HTML tags, attributes, and inline styles
- 18.Sanitization.5: Add rel="noopener noreferrer" to all external links
