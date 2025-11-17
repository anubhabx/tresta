# Layouts

This directory contains layout implementations for rendering testimonials in different visual formats.

## Available Layouts

### Carousel

The carousel layout displays testimonials in a rotating slider format with navigation controls.

**Features:**
- Auto-rotation with configurable interval
- Previous/Next navigation buttons
- Dot indicators for position tracking
- Touch gesture support (swipe left/right)
- Keyboard navigation (Arrow keys, Home, End, Escape)
- Pause on hover/focus
- Full accessibility support (ARIA labels, keyboard navigation)
- Responsive design
- Dark theme support

**Usage:**

```typescript
import { Carousel } from './layouts/carousel';

const carousel = new Carousel({
  testimonials: [...],
  layoutConfig: {
    type: 'carousel',
    autoRotate: true,
    rotateInterval: 5000, // 5 seconds
    showNavigation: true,
  },
  displayOptions: {
    showRating: true,
    showDate: true,
    showAvatar: true,
    showAuthorRole: true,
    showAuthorCompany: true,
  },
  theme: {
    mode: 'light',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    cardStyle: 'default',
  },
});

const element = carousel.render();
document.getElementById('container').appendChild(element);

// Clean up when done
carousel.destroy();
```

**Configuration Options:**

- `autoRotate` (boolean): Enable/disable automatic rotation (default: true)
- `rotateInterval` (number): Milliseconds between rotations (default: 5000)
- `showNavigation` (boolean): Show/hide navigation buttons (default: true)

**Keyboard Controls:**

- `Arrow Left`: Navigate to previous testimonial
- `Arrow Right`: Navigate to next testimonial
- `Home`: Jump to first testimonial
- `End`: Jump to last testimonial
- `Escape`: Pause auto-rotation

**Touch Gestures:**

- Swipe left: Navigate to next testimonial
- Swipe right: Navigate to previous testimonial

**Accessibility:**

The carousel implements WCAG 2.1 AA standards:
- Proper ARIA roles and labels
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Visible focus indicators

**Requirements Implemented:**

- 3.1: Carousel layout rendering
- 6.1: Auto-rotation support
- 6.2: Pause on hover
- 6.3: Navigation buttons
- 6.4: Dot indicators
- 6.5: Manual navigation
- 7.3: Touch gesture support
- 7.4: Keyboard navigation and accessibility

## Future Layouts

The following layouts are planned for future implementation:

- **Grid**: Responsive grid with equal-height cards
- **Masonry**: Pinterest-style layout with dynamic heights
- **Wall**: Dense grid with varied card sizes
- **List**: Simple vertical list (fallback for older browsers)

## Testing

Run the carousel tests:

```bash
npm test carousel.test.ts
```

Visual testing:

```bash
npm run dev
# Open test-carousel.html in browser
```

## Architecture

Each layout class follows this pattern:

1. **Constructor**: Accepts configuration and testimonials
2. **render()**: Returns an HTMLElement with the rendered layout
3. **destroy()**: Cleans up event listeners and timers
4. **Private methods**: Handle internal state and interactions

Layouts are self-contained and don't depend on external state management.
