# Theme System Documentation

## Overview

The Tresta Widget theme system provides comprehensive customization options for widget appearance, including color schemes, typography, card styles, and responsive behavior. The system is built on CSS custom properties for maximum flexibility and performance.

## Features

- **Theme Modes**: Light, dark, and auto (system preference detection)
- **Custom Colors**: Primary and secondary color customization
- **Typography**: Custom font family support with fallbacks
- **Card Styles**: Three distinct card style variations
- **Responsive Design**: Optimized for screens from 320px to 4K (2560px+)
- **CSS Isolation**: Works with both Shadow DOM and namespaced CSS

## Configuration

### Data Attributes

Configure the theme using HTML data attributes on the widget container:

```html
<div id="my-widget"
     data-widget-id="123"
     data-theme-mode="dark"
     data-primary-color="#9333ea"
     data-secondary-color="#ec4899"
     data-font-family="Georgia, serif"
     data-card-style="bordered">
</div>
```

### Programmatic API

Configure the theme programmatically when mounting the widget:

```javascript
TrestaWidget.mount(container, {
  widgetId: '123',
  theme: {
    mode: 'dark',
    primaryColor: '#9333ea',
    secondaryColor: '#ec4899',
    fontFamily: 'Georgia, serif',
    cardStyle: 'bordered'
  }
});
```

## Theme Options

### Theme Mode

Controls the overall color scheme of the widget.

**Options:**
- `light` - Light theme (default)
- `dark` - Dark theme
- `auto` - Automatically detects system preference using `prefers-color-scheme`

**Example:**
```html
<div data-widget-id="123" data-theme-mode="dark"></div>
```

**CSS Variables Applied:**
- Light mode: White backgrounds, dark text
- Dark mode: Dark backgrounds, light text

### Primary Color

The primary color is used for interactive elements, accents, and verification badges.

**Default:** `#3b82f6` (blue)

**Example:**
```html
<div data-widget-id="123" data-primary-color="#9333ea"></div>
```

**Applied to:**
- Links and buttons
- Verification badges
- Bordered card style borders
- Interactive element hover states

### Secondary Color

The secondary color is used for supporting visual elements and secondary text.

**Default:** `#64748b` (slate gray)

**Example:**
```html
<div data-widget-id="123" data-secondary-color="#ec4899"></div>
```

**Applied to:**
- Secondary text
- Metadata (dates, roles)
- Supporting UI elements

### Font Family

Custom font family with automatic fallback to system fonts.

**Default:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...`)

**Example:**
```html
<div data-widget-id="123" data-font-family="Georgia, serif"></div>
```

**Fallback Chain:**
The system automatically adds fallback fonts:
```
[Your Font], -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

### Card Style

Three distinct card style variations for different design aesthetics.

**Options:**
- `default` - Standard card with shadow and border
- `minimal` - Clean, borderless design
- `bordered` - Prominent border using primary color

**Examples:**

**Default Style:**
```html
<div data-widget-id="123" data-card-style="default"></div>
```
- Background color
- Subtle border
- Box shadow
- Padding

**Minimal Style:**
```html
<div data-widget-id="123" data-card-style="minimal"></div>
```
- Transparent background
- No border
- No shadow
- Padding only

**Bordered Style:**
```html
<div data-widget-id="123" data-card-style="bordered"></div>
```
- Background color
- 2px border in primary color
- No shadow
- Padding

## Responsive Behavior

The theme system includes responsive breakpoints that adjust spacing and typography for optimal display across all screen sizes.

### Breakpoints

| Breakpoint | Screen Size | Adjustments |
|------------|-------------|-------------|
| Mobile | 320px+ | Base spacing (16px), base font size (16px) |
| Small Tablet | 576px+ | Increased spacing (20px) |
| Tablet | 768px+ | Increased spacing (24px) |
| Desktop | 1024px+ | Increased spacing (32px), larger padding (28px) |
| Large Desktop | 1440px+ | Maximum spacing (32px), larger padding (32px) |
| 4K Display | 2560px+ | Larger font size (18px), maximum spacing (40px) |

### CSS Custom Properties

The following CSS custom properties are automatically adjusted at each breakpoint:

- `--tresta-spacing`: General spacing between elements
- `--tresta-card-padding`: Internal card padding
- Font size on the root element

## CSS Custom Properties Reference

### Color Variables

```css
--tresta-primary-color: #3b82f6;
--tresta-secondary-color: #64748b;
--tresta-text-color: #1e293b;
--tresta-bg-color: #ffffff;
--tresta-border-color: #e2e8f0;
```

### Theme-Specific Colors

**Light Theme:**
```css
--tresta-theme-bg: #ffffff;
--tresta-theme-text: #1e293b;
--tresta-theme-border: #e2e8f0;
--tresta-theme-shadow: rgba(0, 0, 0, 0.1);
```

**Dark Theme:**
```css
--tresta-theme-bg: #1e293b;
--tresta-theme-text: #f1f5f9;
--tresta-theme-border: #334155;
--tresta-theme-shadow: rgba(0, 0, 0, 0.3);
```

### Card Variables

```css
--tresta-card-bg: #ffffff;
--tresta-card-border: #e2e8f0;
--tresta-card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--tresta-card-padding: 16px;
```

### Layout Variables

```css
--tresta-border-radius: 8px;
--tresta-spacing: 16px;
--tresta-font-family: [system font stack];
```

## Complete Examples

### Example 1: Dark Theme with Custom Colors

```html
<div id="widget-dark-custom"
     data-widget-id="123"
     data-theme-mode="dark"
     data-primary-color="#8b5cf6"
     data-secondary-color="#a78bfa"
     data-card-style="bordered">
</div>
```

### Example 2: Light Theme with Custom Font

```html
<div id="widget-light-font"
     data-widget-id="123"
     data-theme-mode="light"
     data-font-family="'Trebuchet MS', sans-serif"
     data-card-style="minimal">
</div>
```

### Example 3: Auto Theme with Brand Colors

```html
<div id="widget-auto-brand"
     data-widget-id="123"
     data-theme-mode="auto"
     data-primary-color="#10b981"
     data-secondary-color="#14b8a6"
     data-card-style="default">
</div>
```

### Example 4: Programmatic Configuration

```javascript
const container = document.getElementById('my-widget');

TrestaWidget.mount(container, {
  widgetId: '123',
  theme: {
    mode: 'dark',
    primaryColor: '#9333ea',
    secondaryColor: '#ec4899',
    fontFamily: 'Georgia, serif',
    cardStyle: 'bordered'
  }
});
```

## Browser Compatibility

The theme system works across all modern browsers:

- **Chrome 90+** (full support)
- **Firefox 88+** (full support)
- **Safari 14+** (full support)
- **Edge 90+** (full support)

### Auto Theme Detection

The `auto` theme mode uses the `prefers-color-scheme` media query, which is supported in:
- Chrome 76+
- Firefox 67+
- Safari 12.1+
- Edge 79+

For older browsers, `auto` mode defaults to `light` theme.

## Testing

The theme system includes comprehensive unit tests covering:

- Theme initialization and configuration
- Color application via CSS custom properties
- Font family application with fallbacks
- Card style variations
- Theme mode detection (light/dark/auto)
- Data attribute parsing
- Theme updates

Run tests:
```bash
npm run test theme-manager.test.ts
```

## Performance

The theme system is designed for optimal performance:

- **Zero Runtime Overhead**: Theme is applied once during initialization
- **CSS Custom Properties**: Native browser feature, no JavaScript recalculation
- **No Re-renders**: Theme changes don't trigger component re-renders
- **Minimal Bundle Impact**: ~2KB gzipped

## Accessibility

The theme system maintains WCAG 2.1 AA compliance:

- **Color Contrast**: Default colors meet 4.5:1 contrast ratio
- **System Preference**: Auto mode respects user's system theme preference
- **Custom Colors**: Developers should verify contrast ratios when using custom colors

### Contrast Checking

When using custom colors, verify contrast ratios:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

Tools:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Calculator](https://contrast-ratio.com/)

## Advanced Usage

### Dynamic Theme Updates

Update the theme after initialization:

```javascript
const widget = TrestaWidget.getInstance(container);
const styleManager = widget.getStyleManager();
const themeManager = styleManager.getThemeManager();

themeManager.updateTheme({
  mode: 'dark',
  primaryColor: '#9333ea'
});

// Re-apply theme to root element
const contentRoot = widget.getContentRoot();
themeManager.applyTheme(contentRoot);
```

### Custom CSS Overrides

For advanced customization, you can override CSS custom properties:

```css
/* In your host page CSS */
#my-widget {
  --tresta-border-radius: 16px !important;
  --tresta-spacing: 24px !important;
}
```

**Note:** This only works with namespaced CSS mode. Shadow DOM prevents external CSS from affecting the widget.

## Troubleshooting

### Theme Not Applying

**Issue:** Theme configuration not taking effect

**Solutions:**
1. Verify data attributes are on the correct element (the container with `data-widget-id`)
2. Check for typos in attribute names (e.g., `data-theme-mode` not `data-theme`)
3. Ensure color values are valid CSS colors (hex, rgb, named colors)
4. Check browser console for errors

### Colors Not Visible

**Issue:** Custom colors not showing up

**Solutions:**
1. Verify color format is valid CSS (e.g., `#9333ea` not `9333ea`)
2. Check if Shadow DOM is isolating styles correctly
3. Inspect element to verify CSS custom properties are set
4. Ensure no host page CSS is overriding widget styles

### Font Not Loading

**Issue:** Custom font not displaying

**Solutions:**
1. Verify font is loaded on the host page (if using web fonts)
2. Check font family name matches exactly (case-sensitive)
3. Ensure font is available before widget initialization
4. Fallback fonts will be used if custom font fails to load

## Migration Guide

### From Previous Versions

If upgrading from a version without theme support:

**Before:**
```html
<div id="widget" data-widget-id="123"></div>
```

**After (with theme):**
```html
<div id="widget" 
     data-widget-id="123"
     data-theme-mode="light"
     data-primary-color="#3b82f6">
</div>
```

All theme attributes are optional. Widgets without theme configuration will use default values.

## Best Practices

1. **Use Auto Mode**: Let users' system preferences determine theme when possible
2. **Test Contrast**: Always verify color contrast ratios for accessibility
3. **Consistent Branding**: Use your brand colors for primary/secondary colors
4. **Font Loading**: Ensure custom fonts are loaded before widget initialization
5. **Responsive Testing**: Test on multiple screen sizes (mobile to 4K)
6. **Card Style Selection**: Choose card style that matches your site's design language

## Support

For issues or questions about the theme system:
- Check the [main README](./README.md)
- Review [test examples](./test-theme-system.html)
- Open an issue on GitHub
