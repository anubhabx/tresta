# Tresta Widget - Embeddable Testimonial Widget

A lightweight, self-contained JavaScript widget for embedding Tresta testimonials on any website.

## Features

- 🎨 **Multiple Layouts**: Carousel, Grid, Masonry, Wall, List
- 🎯 **Zero Dependencies**: Pure vanilla JavaScript
- 🚀 **CDN Ready**: Optimized for fast loading
- 📱 **Responsive**: Works on all devices
- 🎭 **Customizable**: Theme and settings overrides
- ♿ **Accessible**: ARIA labels and keyboard navigation
- 🔒 **Secure**: XSS protection built-in

## Quick Start

### Simple Embed (Auto-Initialize)

Add this script tag to your HTML:

```html
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
></script>
```

That's it! The widget will automatically render testimonials below the script tag.

### Custom Container

```html
<div id="my-testimonials"></div>

<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
  data-container="#my-testimonials"
></script>
```

## Customization

### Theme Customization

```html
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
  data-primary-color="#10b981"
  data-background-color="#ffffff"
  data-text-color="#1f2937"
  data-card-background-color="#f9fafb"
  data-border-radius="12"
  data-font-family="Inter, sans-serif"
></script>
```

### Settings Customization

```html
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
  data-show-rating="true"
  data-show-date="false"
  data-show-author-image="true"
  data-show-author-role="true"
  data-autoplay="true"
  data-autoplay-speed="5000"
  data-max-items="10"
></script>
```

### Custom API URL

For self-hosted or development environments:

```html
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
  data-api-url="https://your-api.com"
></script>
```

## Programmatic Usage

### Initialize Manually

```html
<div id="testimonials"></div>

<script src="https://cdn.tresta.io/widget.js"></script>
<script>
  const widget = TrestaWidget.init('YOUR_WIDGET_ID', {
    container: '#testimonials',
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
    },
    settings: {
      showRating: true,
      autoplay: true,
    },
    onLoad: (widget) => {
      console.log('Widget loaded:', widget);
    },
    onError: (error) => {
      console.error('Widget error:', error);
    },
  });
</script>
```

### Widget Methods

```javascript
// Refresh widget data
await TrestaWidget.refresh('YOUR_WIDGET_ID');

// Refresh all widgets on the page
await TrestaWidget.refreshAll();

// Get widget instance
const widget = TrestaWidget.get('YOUR_WIDGET_ID');

// Get all widget instances
const widgets = TrestaWidget.getAll();

// Destroy widget
TrestaWidget.destroy('YOUR_WIDGET_ID');
```

### Instance Methods

```javascript
const widget = TrestaWidget.get('YOUR_WIDGET_ID');

// Refresh data
await widget.refresh();

// Get current widget data
const data = widget.getWidget();

// Get testimonials
const testimonials = widget.getTestimonials();

// Destroy widget
widget.destroy();
```

## Available Attributes

### Required

| Attribute | Description |
|-----------|-------------|
| `data-tresta-widget` | Your widget ID (required) |

### Optional

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-api-url` | string | Auto-detected | API base URL |
| `data-container` | string | Auto-generated | CSS selector or element ID |

### Theme Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-primary-color` | color | `#3b82f6` | Primary brand color |
| `data-background-color` | color | `#ffffff` | Widget background |
| `data-text-color` | color | `#1f2937` | Text color |
| `data-card-background-color` | color | `#f9fafb` | Card background |
| `data-border-radius` | number | `8` | Border radius in pixels |
| `data-font-family` | string | System fonts | Font family |

### Settings Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-show-rating` | boolean | `true` | Show star ratings |
| `data-show-date` | boolean | `false` | Show testimonial date |
| `data-show-author-image` | boolean | `true` | Show author image/initials |
| `data-show-author-role` | boolean | `true` | Show author role/title |
| `data-show-author-company` | boolean | `true` | Show author company |
| `data-autoplay` | boolean | `false` | Enable carousel autoplay |
| `data-autoplay-speed` | number | `5000` | Autoplay speed (ms) |
| `data-max-items` | number | `null` | Max testimonials to show |

## Layouts

The widget layout is configured in the Tresta dashboard. Available layouts:

- **Carousel**: Scrollable slides with navigation
- **Grid**: Responsive grid of cards
- **Masonry**: Pinterest-style masonry layout
- **Wall**: Compact minimal cards
- **List**: Vertical list of testimonials

## Examples

### WordPress

```html
<!-- In your theme or page -->
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="<?php echo esc_attr(get_option('tresta_widget_id')); ?>"
></script>
```

### React

```jsx
import { useEffect } from 'react';

function TestimonialsWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.tresta.io/widget.js';
    script.setAttribute('data-tresta-widget', 'YOUR_WIDGET_ID');
    document.body.appendChild(script);

    return () => {
      TrestaWidget.destroy('YOUR_WIDGET_ID');
      document.body.removeChild(script);
    };
  }, []);

  return <div id="testimonials-container" />;
}
```

### Vue

```vue
<template>
  <div id="testimonials-container"></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.tresta.io/widget.js';
    script.setAttribute('data-tresta-widget', 'YOUR_WIDGET_ID');
    script.setAttribute('data-container', '#testimonials-container');
    document.body.appendChild(script);
  },
  beforeUnmount() {
    if (window.TrestaWidget) {
      window.TrestaWidget.destroy('YOUR_WIDGET_ID');
    }
  },
};
</script>
```

### Next.js

```jsx
'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Testimonials() {
  return (
    <>
      <div id="testimonials" />
      <Script
        src="https://cdn.tresta.io/widget.js"
        strategy="lazyOnload"
        data-tresta-widget="YOUR_WIDGET_ID"
        data-container="#testimonials"
      />
    </>
  );
}
```

## Performance

- **Minified**: ~12KB gzipped
- **No dependencies**: Zero external libraries
- **Lazy loading**: Widget loads only when needed
- **Cached API calls**: Server-side caching reduces load
- **Responsive images**: Optimized for all screen sizes

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

## Security

- XSS protection via HTML escaping
- No credential handling in public endpoints
- CORS-enabled for cross-origin embedding
- Read-only API access (no mutations)
- Server-side validation of testimonial visibility

## CDN Deployment

### Production CDN

```
https://cdn.tresta.io/widget.js        # Latest version
https://cdn.tresta.io/widget.min.js    # Minified
https://cdn.tresta.io/v1/widget.js     # Version 1.x
```

### Development

```
http://localhost:8000/widget/widget.js
```

## Troubleshooting

### Widget Not Showing

1. Check that `data-tresta-widget` matches your widget ID
2. Verify the project is set to PUBLIC in the dashboard
3. Ensure testimonials are APPROVED
4. Check browser console for errors
5. Verify API URL is correct

### CORS Errors

The Tresta API is configured to allow all origins for widget embeds. If you see CORS errors:

1. Check that you're using the public widget endpoint
2. Verify your API server is running
3. Check firewall/network restrictions

### Styling Conflicts

If the widget styles conflict with your site:

1. Use theme customization attributes
2. Wrap widget in an isolated container
3. Use custom CSS with higher specificity

### Need Help?

- Documentation: https://docs.tresta.io
- Support: support@tresta.io
- Issues: https://github.com/tresta/widget/issues

## License

MIT License - See LICENSE file for details

## Development

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Development mode (watch)
pnpm dev

# Type checking
pnpm type-check
```

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

---

Made with ❤️ by [Tresta](https://tresta.io)