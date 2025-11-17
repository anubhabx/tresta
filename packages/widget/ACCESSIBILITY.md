# Accessibility Features

This document outlines the accessibility features implemented in the Tresta Widget System to ensure WCAG 2.1 AA compliance.

## Overview

The widget is designed to be fully accessible to all users, including those using assistive technologies such as screen readers, keyboard-only navigation, and other accessibility tools.

## Key Features

### 1. ARIA Labels and Roles

#### Widget Container
- **role="region"**: The widget root has a region role to identify it as a significant area
- **aria-label="Testimonials widget"**: Provides a descriptive label for screen readers
- **lang attribute**: Supports localization with configurable language codes

#### Carousel Layout
- **role="region"**: Carousel container identified as a region
- **aria-label="Customer testimonials"**: Descriptive label for the carousel
- **aria-roledescription="carousel"**: Identifies the component type
- **aria-live="polite"**: Announces slide changes to screen readers
- **Slides**: Each slide has `role="tabpanel"` with descriptive labels
- **Navigation buttons**: Proper `aria-label` attributes ("Previous testimonial", "Next testimonial")
- **Dot indicators**: `role="tab"` with `aria-controls` linking to slides

#### Grid, List, Masonry, and Wall Layouts
- **role="list"**: Container identified as a list
- **aria-label="Customer testimonials"**: Descriptive label
- **role="listitem"**: Each testimonial item marked as a list item

#### Testimonial Cards
- **Semantic HTML**: Uses `<article>` element for each card
- **Star Ratings**: `role="img"` with `aria-label="X out of 5 stars"`
- **Verification Badges**: `role="img"` with `aria-label="Verified via [Provider]"`
- **Dates**: Uses `<time>` element with `datetime` attribute

#### Error and Empty States
- **Error State**: `role="alert"` with `aria-live="assertive"` for immediate announcement
- **Empty State**: `role="status"` with `aria-live="polite"` for non-urgent announcement
- **aria-atomic="true"**: Ensures entire message is announced

### 2. Keyboard Navigation

#### Global Navigation
- **Tab**: Navigate through all interactive elements
- **Shift + Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and controls
- **Escape**: Pause carousel auto-rotation

#### Carousel-Specific
- **Arrow Left**: Previous slide
- **Arrow Right**: Next slide
- **Home**: Jump to first slide
- **End**: Jump to last slide
- **Tab**: Navigate to carousel controls (buttons, dots)

#### Focus Management
- **Roving Tabindex**: Dot indicators use roving tabindex pattern
  - First dot: `tabindex="0"`
  - Other dots: `tabindex="-1"`
  - Arrow keys move focus between dots
- **Focus Trap**: No keyboard traps - users can always Tab out of the widget
- **Logical Tab Order**: Focus moves in a logical sequence

### 3. Focus Indicators

All interactive elements have visible focus indicators:
- **3px solid outline** in primary color
- **2px offset** for better visibility
- **Applies to**: buttons, links, focusable elements
- **CSS**: Uses `:focus-visible` for keyboard-only focus indicators

```css
[data-tresta-widget] *:focus-visible {
  outline: 3px solid var(--tresta-primary-color);
  outline-offset: 2px;
}
```

### 4. Screen Reader Support

#### Live Regions
- **ARIA Live Region**: Created on widget mount for dynamic announcements
- **Loading State**: "Loading testimonials" announced when fetching data
- **Success State**: "X testimonials loaded" announced after successful load
- **Error State**: "Failed to load testimonials" announced on errors

#### Screen Reader-Only Content
- **Carousel Instructions**: Hidden text provides keyboard navigation instructions
- **CSS Class**: `.tresta-sr-only` for visually hidden but screen reader accessible content

```css
.tresta-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### SVG Accessibility
- **aria-hidden="true"**: Decorative SVGs hidden from screen readers
- **focusable="false"**: SVGs not included in tab order
- **Meaningful icons**: Accompanied by text labels or aria-labels

### 5. Semantic HTML

The widget uses proper semantic HTML elements:
- **`<article>`**: Testimonial cards
- **`<button>`**: All interactive controls (not divs with click handlers)
- **`<time>`**: Dates with `datetime` attribute
- **`<nav>`**: Navigation controls (when applicable)
- **Headings**: Proper heading hierarchy (if used)

### 6. Reduced Motion Support

Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  [data-tresta-widget] * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 7. High Contrast Mode Support

Adapts to high contrast mode:

```css
@media (prefers-contrast: high) {
  [data-tresta-widget] {
    --tresta-border-color: currentColor;
  }
  
  [data-tresta-widget] button,
  [data-tresta-widget] a {
    border: 2px solid currentColor;
  }
}
```

## Configuration

### Language Support

Set the language for the widget:

```javascript
TrestaWidget.mount(container, {
  widgetId: 'your-widget-id',
  apiKey: 'your-api-key',
  lang: 'es', // Spanish
});
```

### Custom Error Messages

Provide localized error messages:

```javascript
TrestaWidget.mount(container, {
  widgetId: 'your-widget-id',
  apiKey: 'your-api-key',
  errorMessage: 'No se pudieron cargar los testimonios',
  emptyMessage: 'Aún no hay testimonios',
});
```

## Testing

### Automated Testing

Run accessibility tests:

```bash
npm test accessibility.test.ts
```

### Manual Testing

#### Keyboard Navigation
1. Open the widget in a browser
2. Press Tab to navigate through elements
3. Verify focus indicators are visible
4. Test all keyboard shortcuts (arrows, Enter, Escape, etc.)
5. Ensure no keyboard traps exist

#### Screen Reader Testing
1. Enable screen reader (NVDA, JAWS, VoiceOver, etc.)
2. Navigate through the widget
3. Verify all content is announced
4. Check that dynamic content changes are announced
5. Confirm ARIA labels are read correctly

#### Browser DevTools
1. Open DevTools (F12)
2. Inspect widget elements
3. Check Accessibility tab
4. Verify ARIA attributes
5. Review accessibility tree

### Testing Tools

Recommended tools for accessibility testing:
- **axe DevTools**: Browser extension for automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built-in Chrome DevTools audit
- **NVDA**: Free screen reader for Windows
- **JAWS**: Popular screen reader for Windows
- **VoiceOver**: Built-in screen reader for macOS/iOS

## WCAG 2.1 AA Compliance

The widget meets WCAG 2.1 Level AA requirements:

### Perceivable
- ✅ **1.1.1 Non-text Content**: All images have text alternatives
- ✅ **1.3.1 Info and Relationships**: Semantic HTML and ARIA roles
- ✅ **1.3.2 Meaningful Sequence**: Logical reading order
- ✅ **1.4.1 Use of Color**: Information not conveyed by color alone
- ✅ **1.4.3 Contrast**: Minimum 4.5:1 contrast ratio for text
- ✅ **1.4.11 Non-text Contrast**: 3:1 contrast for UI components

### Operable
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard
- ✅ **2.1.2 No Keyboard Trap**: Users can navigate away from widget
- ✅ **2.4.3 Focus Order**: Logical focus order
- ✅ **2.4.7 Focus Visible**: Visible focus indicators
- ✅ **2.5.3 Label in Name**: Accessible names match visible labels

### Understandable
- ✅ **3.1.1 Language of Page**: Lang attribute support
- ✅ **3.2.1 On Focus**: No unexpected context changes on focus
- ✅ **3.2.2 On Input**: No unexpected context changes on input
- ✅ **3.3.1 Error Identification**: Errors clearly identified
- ✅ **3.3.2 Labels or Instructions**: Clear labels for controls

### Robust
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA attributes
- ✅ **4.1.3 Status Messages**: ARIA live regions for status updates

## Known Limitations

1. **Shadow DOM**: When using Shadow DOM, some browser extensions may have limited access to the widget's internals
2. **Third-party Content**: Avatar images from external sources may not have optimal alt text
3. **Auto-rotation**: Carousel auto-rotation may be distracting for some users (can be paused with Escape key)

## Future Enhancements

Planned accessibility improvements:
- [ ] Configurable auto-rotation pause duration
- [ ] More granular control over ARIA announcements
- [ ] Support for additional languages
- [ ] Enhanced keyboard shortcuts customization
- [ ] Better support for voice control

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## Support

For accessibility-related issues or questions, please:
1. Check this documentation
2. Review the [GitHub Issues](https://github.com/your-repo/issues)
3. Contact support at accessibility@tresta.com
