# Tresta Widget Integration Guide

## Quick Start

### 1. Basic Embed

Copy this code into your HTML where you want the widget to appear:

```html
<!-- Tresta Testimonial Widget -->
<div id="tresta-widget-YOUR_WIDGET_ID" data-widget-id="YOUR_WIDGET_ID"></div>
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js" 
        data-widget-id="YOUR_WIDGET_ID"></script>
```

Replace `YOUR_WIDGET_ID` with your actual widget ID from the admin panel.

### 2. Configure Your Widget

The widget automatically initializes with the configuration from your admin panel. No additional JavaScript required!

## Advanced Integration

### Programmatic API

For dynamic widget management:

```javascript
// Mount a widget
const widget = await TrestaWidget.mount('#container', {
  widgetId: 'YOUR_WIDGET_ID',
  debug: false,
  telemetry: true
});

// Refresh widget data
await widget.refresh();

// Unmount widget
TrestaWidget.unmount('#container');
```

### Multiple Widgets

You can have multiple widgets on the same page:

```html
<!-- Widget 1 -->
<div id="tresta-widget-123" data-widget-id="123"></div>
<script async src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js" 
        data-widget-id="123"></script>

<!-- Widget 2 -->
<div id="tresta-widget-456" data-widget-id="456"></div>
<script async src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js" 
        data-widget-id="456"></script>
```

### Debug Mode

Enable debug mode for troubleshooting:

```html
<div id="tresta-widget-123" data-widget-id="123" data-debug="true"></div>
```

This will log detailed information to the browser console.

## Content Security Policy (CSP)

If your site uses CSP, add these directives:

```
Content-Security-Policy:
  script-src 'self' https://cdn.tresta.com;
  connect-src https://api.tresta.com;
  img-src https://cdn.tresta.com https://api.tresta.com data:;
  style-src 'self' https://cdn.tresta.com;
```

For detailed CSP configuration, see [CSP_COMPLIANCE.md](./CSP_COMPLIANCE.md).

### CSP with Subresource Integrity (SRI)

For maximum security:

```html
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js"
        integrity="sha384-[HASH]"
        crossorigin="anonymous"
        data-widget-id="YOUR_WIDGET_ID"></script>
```

Get the integrity hash from your admin panel or the release manifest.

### CSP with Nonce

For nonce-based CSP:

```html
<script async 
        src="https://cdn.tresta.com/widget/v1.0.0/tresta-widget.iife.js"
        nonce="{{YOUR_NONCE}}"
        data-widget-id="YOUR_WIDGET_ID"></script>
```

## Version Pinning

### Exact Version (Recommended for Production)

```html
<script src="https://cdn.tresta.com/widget/v1.2.3/tresta-widget.iife.js"></script>
```

### Major Version (Auto-updates)

```html
<script src="https://cdn.tresta.com/widget/v1/tresta-widget.iife.js"></script>
```

This automatically gets the latest v1.x.x version.

### Latest (Not Recommended)

```html
<script src="https://cdn.tresta.com/widget/latest/tresta-widget.iife.js"></script>
```

## Configuration Options

### Data Attributes

Configure the widget using data attributes:

```html
<div id="tresta-widget-123" 
     data-widget-id="123"
     data-debug="true"
     data-telemetry="false"
     data-lang="en"></div>
```

### Programmatic Configuration

```javascript
TrestaWidget.mount('#container', {
  widgetId: '123',
  debug: true,
  telemetry: false,
  lang: 'en',
  errorMessage: 'Custom error message',
  emptyMessage: 'No testimonials available'
});
```

## Styling

The widget uses Shadow DOM for style isolation. To customize:

1. Configure theme in the admin panel (recommended)
2. Use CSS custom properties (if exposed)
3. Contact support for advanced customization

## Browser Support

- Chrome 90+ (latest + last 2 versions)
- Firefox 88+ (latest + last 2 versions)
- Safari 14+
- Edge 90+ (latest + last 2 versions)

Older browsers will see a graceful fallback (simple list layout).

## Performance

The widget is optimized for performance:

- **Bundle size**: ≤50KB gzipped
- **Async loading**: Non-blocking
- **Lazy loading**: Images load on demand
- **Caching**: 24-hour client-side cache
- **CDN**: Global edge delivery

## Troubleshooting

### Widget doesn't appear

1. Check browser console for errors
2. Verify widget ID is correct
3. Enable debug mode: `data-debug="true"`
4. Check CSP configuration

### Testimonials don't load

1. Check network tab for API errors
2. Verify widget is published in admin panel
3. Check if testimonials are approved
4. Enable debug mode for detailed logs

### Styling issues

1. Check for CSS conflicts (use browser DevTools)
2. Verify Shadow DOM is supported
3. Check theme configuration in admin panel

### CSP violations

1. Review required CSP directives
2. Check browser console for violation reports
3. See [CSP_COMPLIANCE.md](./CSP_COMPLIANCE.md) for solutions

## Support

For additional help:

1. Check the [CSP Compliance Guide](./CSP_COMPLIANCE.md)
2. Review browser console errors (with debug mode enabled)
3. Contact support with:
   - Widget ID
   - Browser and version
   - Console errors
   - Steps to reproduce

## Examples

### React

```jsx
import { useEffect, useRef } from 'react';

function TestimonialWidget({ widgetId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.TrestaWidget) {
      window.TrestaWidget.mount(containerRef.current, { widgetId });
    }

    return () => {
      if (containerRef.current) {
        window.TrestaWidget.unmount(containerRef.current);
      }
    };
  }, [widgetId]);

  return <div ref={containerRef} />;
}
```

### Vue

```vue
<template>
  <div ref="widgetContainer"></div>
</template>

<script>
export default {
  props: ['widgetId'],
  mounted() {
    if (window.TrestaWidget) {
      window.TrestaWidget.mount(this.$refs.widgetContainer, {
        widgetId: this.widgetId
      });
    }
  },
  beforeUnmount() {
    if (window.TrestaWidget) {
      window.TrestaWidget.unmount(this.$refs.widgetContainer);
    }
  }
}
</script>
```

### Angular

```typescript
import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-testimonial-widget',
  template: '<div #widgetContainer></div>'
})
export class TestimonialWidgetComponent implements OnInit, OnDestroy {
  @Input() widgetId: string;
  @ViewChild('widgetContainer') container: ElementRef;

  ngOnInit() {
    if ((window as any).TrestaWidget) {
      (window as any).TrestaWidget.mount(this.container.nativeElement, {
        widgetId: this.widgetId
      });
    }
  }

  ngOnDestroy() {
    if ((window as any).TrestaWidget) {
      (window as any).TrestaWidget.unmount(this.container.nativeElement);
    }
  }
}
```

## Best Practices

1. **Use exact version pinning** in production for stability
2. **Enable SRI** for additional security
3. **Test CSP configuration** in staging before production
4. **Monitor performance** with browser DevTools
5. **Keep widget updated** to get latest features and fixes
6. **Use debug mode** only in development
7. **Disable telemetry** if privacy is a concern

## Migration Guide

When upgrading to a new major version:

1. Review the changelog for breaking changes
2. Test in a staging environment
3. Update CSP directives if needed
4. Update embed code version number
5. Monitor for errors after deployment

See version-specific migration guides in the documentation.
