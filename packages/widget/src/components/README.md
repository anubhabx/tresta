# Testimonial Card Component

The `TestimonialCard` component renders a single testimonial with configurable display options, supporting star ratings, OAuth verification badges, lazy-loaded avatars, and date formatting.

## Features

- ✅ Configurable display options (rating, date, avatar, role, company)
- ✅ Star rating display with ARIA labels for accessibility
- ✅ OAuth verification badge with primary color theming
- ✅ Lazy loading for avatar images
- ✅ Date formatting (e.g., "November 17, 2025")
- ✅ Three card style variants (default, minimal, bordered)
- ✅ HTML escaping for XSS protection
- ✅ Semantic HTML with proper ARIA attributes
- ✅ Responsive design with mobile support
- ✅ Dark theme support via CSS custom properties

## Usage

```typescript
import { TestimonialCard } from './components/testimonial-card';

const card = new TestimonialCard({
  testimonial: {
    id: '123',
    content: 'Great product!',
    rating: 5,
    createdAt: '2025-11-17T10:00:00Z',
    isPublished: true,
    isApproved: true,
    isOAuthVerified: true,
    oauthProvider: 'Google',
    author: {
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      role: 'CEO',
      company: 'Acme Corp'
    }
  },
  displayOptions: {
    showRating: true,
    showDate: true,
    showAvatar: true,
    showAuthorRole: true,
    showAuthorCompany: true
  },
  theme: {
    mode: 'light',
    primaryColor: '#0066cc',
    secondaryColor: '#6b7280',
    fontFamily: 'Arial, sans-serif',
    cardStyle: 'default'
  }
});

const element = card.render();
document.getElementById('container').appendChild(element);
```

## Display Options

| Option | Type | Description |
|--------|------|-------------|
| `showRating` | boolean | Display star rating |
| `showDate` | boolean | Display testimonial date |
| `showAvatar` | boolean | Display author avatar |
| `showAuthorRole` | boolean | Display author role |
| `showAuthorCompany` | boolean | Display author company |

## Card Styles

- **default**: Card with shadow and hover effect
- **minimal**: Transparent background with bottom border
- **bordered**: Card with 2px border

## Accessibility

- Uses semantic `<article>` element
- Star ratings have `role="img"` with descriptive `aria-label`
- Avatar images have proper `alt` text
- Dates use `<time>` element with `datetime` attribute
- Verification badges include screen reader text
- All interactive elements are keyboard accessible

## Testing

Run the component tests:

```bash
npm test -- testimonial-card.test.ts
```

View the visual test page:

```bash
npm run dev
# Open test-testimonial-card.html in browser
```

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **2.6**: Lazy loading for testimonial images
- **5.1**: Display star ratings when configured
- **5.2**: Display testimonial creation date when configured
- **5.3**: Display author avatar images when configured
- **5.4**: Display author role when configured
- **5.5**: Display author company name when configured
- **9.1-9.5**: OAuth verification badge rendering

## CSS Custom Properties

The component uses CSS custom properties for theming:

```css
--primary-color: Primary brand color (used for verification badge)
--secondary-color: Secondary color
--font-family: Font family for text
--card-background: Card background color
--text-color: Primary text color
--text-secondary: Secondary text color
--border-color: Border color
--rating-color: Star rating color
--rating-empty-color: Empty star color
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Gracefully degrades on older browsers.
