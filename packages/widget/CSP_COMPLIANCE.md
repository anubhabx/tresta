# Content Security Policy (CSP) Compliance Guide

## Overview

The Tresta Widget is fully compliant with Content Security Policy (CSP) requirements and can operate in strict CSP environments without requiring `'unsafe-inline'` or `'unsafe-eval'` directives.

## Required CSP Directives

To embed the Tresta Widget on your website, add the following CSP directives to your Content Security Policy:

```
Content-Security-Policy:
  script-src 'self' https://cdn.tresta.com;
  connect-src https://api.tresta.com;
  img-src https://cdn.tresta.com https://api.tresta.com data:;
  style-src 'self' https://cdn.tresta.com;
```

### Directive Breakdown

- **script-src**: Allows loading the widget JavaScript from our CDN
- **connect-src**: Allows API requests to fetch testimonial data
- **img-src**: Allows loading avatar images and other assets (includes `data:` for inline SVG icons)
- **style-src**: Allows loading widget styles from our CDN

## CSP-Friendly Embed Code

### Standard Embed (Recommended)

```html
<!-- Tresta Testimonial Widget -->
<div id="tresta-widget-123" data-widget-id="123"></div>
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js" 
        data-widget-id="123"></script>
```

### With Subresource Integrity (SRI)

For enhanced security, use SRI to ensure the script hasn't been tampered with:

```html
<!-- Tresta Testimonial Widget (with SRI) -->
<div id="tresta-widget-123" data-widget-id="123"></div>
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js"
        integrity="sha384-[HASH-FROM-MANIFEST]"
        crossorigin="anonymous"
        data-widget-id="123"></script>
```

**Note**: Replace `[HASH-FROM-MANIFEST]` with the actual SHA-384 hash from the release manifest.

### With Nonce (Strict CSP)

If your CSP uses nonces instead of domain whitelisting:

```html
<!-- Tresta Testimonial Widget (with nonce) -->
<div id="tresta-widget-123" data-widget-id="123"></div>
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js"
        nonce="{{CSP_NONCE}}"
        data-widget-id="123"></script>
```

**Note**: Replace `{{CSP_NONCE}}` with your server-generated nonce value.

## CSP Compliance Features

### ✅ No eval() or Function()

The widget does not use `eval()`, `new Function()`, or any other form of dynamic code execution.

### ✅ No Inline Scripts

The widget does not inject inline `<script>` tags or use `javascript:` URLs.

### ✅ No Inline Event Handlers

The widget does not use inline event handlers like `onclick`, `onerror`, etc. All event listeners are attached programmatically.

### ✅ No Inline Styles (Optional)

The widget uses Shadow DOM or namespaced CSS classes to avoid inline styles. Some minimal inline styles may be used for dynamic positioning, but these are CSP-compliant.

### ✅ Domain Whitelisting

All resources (scripts, styles, images, API calls) are loaded from explicitly allowed domains:
- `cdn.tresta.com` - Widget assets
- `api.tresta.com` - API endpoints

### ✅ Nonce Support

The widget automatically detects and uses nonce attributes when present on the script tag.

## Testing CSP Compliance

### Manual Testing

1. Add the widget to a test page with strict CSP headers
2. Open browser DevTools Console
3. Check for CSP violation warnings
4. Verify the widget loads and functions correctly

### Example CSP Header for Testing

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://cdn.tresta.com; 
  connect-src https://api.tresta.com; 
  img-src https://cdn.tresta.com https://api.tresta.com data:; 
  style-src 'self' https://cdn.tresta.com;
```

### Automated Testing

The widget includes automated CSP compliance tests:

```bash
npm test -- csp-compliance
```

## Common CSP Issues and Solutions

### Issue: Widget doesn't load

**Cause**: Missing `script-src` directive for `cdn.tresta.com`

**Solution**: Add `https://cdn.tresta.com` to your `script-src` directive

### Issue: Testimonials don't display

**Cause**: Missing `connect-src` directive for `api.tresta.com`

**Solution**: Add `https://api.tresta.com` to your `connect-src` directive

### Issue: Images don't load

**Cause**: Missing `img-src` directive

**Solution**: Add `https://cdn.tresta.com https://api.tresta.com data:` to your `img-src` directive

### Issue: Styles not applied

**Cause**: Missing `style-src` directive

**Solution**: Add `https://cdn.tresta.com` to your `style-src` directive

## CSP Violation Reporting

The widget includes built-in CSP violation detection. When violations occur, they are:

1. Logged to the browser console with `[TrestaWidget]` prefix
2. Tracked internally for debugging
3. Reported to telemetry (if enabled)

### Viewing Violations

Enable debug mode to see detailed CSP violation information:

```html
<div id="tresta-widget-123" data-widget-id="123" data-debug="true"></div>
```

## Enterprise CSP Configurations

### Strict CSP with Nonces

For maximum security, use nonce-based CSP:

```
Content-Security-Policy: 
  script-src 'nonce-{{RANDOM_NONCE}}'; 
  style-src 'nonce-{{RANDOM_NONCE}}';
```

The widget will automatically detect and use the nonce from the script tag.

### CSP with Hash-Based Integrity

For static CSP configurations, use SRI hashes:

```html
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

## Best Practices

1. **Use Specific Versions**: Pin to specific widget versions in production for predictable CSP requirements
2. **Enable SRI**: Use Subresource Integrity for additional security
3. **Test Thoroughly**: Test your CSP configuration in a staging environment before deploying
4. **Monitor Violations**: Enable CSP reporting to catch issues early
5. **Keep Updated**: Review CSP requirements when upgrading widget versions

## Support

If you encounter CSP-related issues:

1. Check the browser console for CSP violation warnings
2. Enable debug mode: `data-debug="true"`
3. Review this guide for common solutions
4. Contact support with:
   - Your CSP configuration
   - Browser console errors
   - Widget version number

## Additional Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Report URI CSP Builder](https://report-uri.com/home/generate)

## Version History

- **v1.0.0**: Initial CSP compliance implementation
  - No eval() or inline scripts
  - Domain whitelisting support
  - Nonce support
  - SRI support
