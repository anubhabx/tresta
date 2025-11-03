# Changelog

All notable changes to the Tresta project will be documented in this file.

## [Unreleased]

### Added - 2024-01-XX

#### Standalone Widget Library for CDN Embedding

**Feature:** Created a self-contained JavaScript widget library that can be embedded on any website with a simple script tag.

**Implementation:**
- **Zero-dependency widget**: Pure vanilla JavaScript, no external dependencies
- **Auto-initialization**: Automatically detects and initializes from script tags with `data-tresta-widget` attribute
- **Multiple layouts**: Carousel, Grid, Masonry, Wall, List
- **Theme customization**: Override colors, fonts, border radius via data attributes
- **Settings control**: Configure display options (ratings, dates, author info, autoplay)
- **Programmatic API**: Manual initialization and control via `window.TrestaWidget`
- **Responsive**: Works on all screen sizes and devices
- **Accessible**: ARIA labels, keyboard navigation
- **Security**: XSS protection via HTML escaping

**Files Created:**
- `/packages/widget/` - Complete widget package
  - `src/index.ts` - Entry point with auto-initialization
  - `src/widget.ts` - Main TrestaWidget class
  - `src/renderer.ts` - Layout-specific renderers
  - `src/styles.ts` - Dynamic CSS generation
  - `src/types.ts` - TypeScript type definitions
  - `vite.config.ts` - Build configuration for CDN bundles
  - `package.json` - Widget package configuration
  - `README.md` - Comprehensive usage documentation
  - `CDN_DEPLOYMENT.md` - Deployment guide for Azure, Digital Ocean, Heroku
  - `demo.html` - Interactive demo with multiple examples

**Build Output:**
- `tresta-widget.js` - Minified IIFE bundle (~12KB gzipped)
- `tresta-widget.esm.js` - ES Module bundle
- Source maps for debugging

**Usage Examples:**

Simple embed (auto-initialize):
```html
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
></script>
```

With customization:
```html
<script 
  src="https://cdn.tresta.io/widget.js" 
  data-tresta-widget="YOUR_WIDGET_ID"
  data-primary-color="#10b981"
  data-autoplay="true"
  data-max-items="10"
></script>
```

Programmatic control:
```javascript
const widget = TrestaWidget.init('WIDGET_ID', {
  container: '#testimonials',
  theme: { primaryColor: '#3b82f6' },
  onLoad: (widget) => console.log('Loaded!'),
});
```

**CDN Deployment Options:**
1. **Azure Blob Storage + Azure CDN** (Recommended)
   - Fastest and most cost-effective
   - Global edge caching
   - ~$5-20/month for 100K-1M loads

2. **Digital Ocean Spaces**
   - S3-compatible with built-in CDN
   - $5/month base plan
   - Simple deployment

3. **Heroku + CloudFlare**
   - Express static server
   - CloudFlare for caching
   - $7+/month

**Scripts Added:**
- `pnpm widget:build` - Build production widget
- `pnpm widget:dev` - Watch mode for development
- `pnpm widget:preview` - Preview built widget

**Impact:**
- ✅ Users can embed testimonials with one line of code
- ✅ No technical knowledge required (vs. API access)
- ✅ Widget is free tier feature
- ✅ API access can be premium/paywall feature
- ✅ CDN-ready for global distribution
- ✅ Self-contained (no external dependencies)
- ✅ Production-ready with minification, compression, source maps

---

### Fixed - 2024-01-XX

#### CORS Configuration for External Widget Embedding

**Problem:** Widgets embedded on external websites were blocked by CORS policy because the API only allowed requests from the frontend dashboard URL.

**Solution:** Implemented route-specific CORS configurations:

1. **Restrictive CORS** for authenticated endpoints (dashboard, project management)
   - Only allows requests from `FRONTEND_URL`
   - Supports credentials (authentication tokens)
   - Full HTTP methods (GET, POST, PUT, DELETE, PATCH)

2. **Public CORS** for widget embedding endpoints
   - Allows requests from ANY origin (`origin: "*"`)
   - Read-only (GET requests only)
   - No credentials required
   - Applied to:
     - `/api/public/*` - Public project/testimonial data
     - `/api/widgets/:widgetId/public` - Widget data for embedding

3. **Webhook CORS** for external integrations (Clerk)
   - Allowlist of trusted webhook sources
   - POST requests only

**Files Changed:**
- Created `/apps/api/src/middleware/cors.middleware.ts` - Centralized CORS configurations
- Updated `/apps/api/src/index.ts` - Applied route-specific CORS
- Updated `/apps/api/src/routes/widget.route.ts` - Widget-specific CORS handling
- Created `/apps/api/CORS.md` - Comprehensive CORS documentation
- Created `/apps/api/examples/widget-embed-example.html` - Live embedding example

**Security Measures:**
- Public endpoints are read-only (GET only)
- No credentials allowed on public endpoints (prevents CSRF)
- Business logic validates project visibility (PUBLIC + ACTIVE)
- Only APPROVED testimonials returned
- Server-side caching reduces abuse
- Preflight cache set to 24 hours (reduces OPTIONS requests)

**Testing:**
- TypeScript compilation successful (no errors)
- CORS headers properly configured per route type
- Example HTML demonstrates cross-origin fetching

**Impact:**
- ✅ Widgets can now be embedded on any external website
- ✅ Dashboard/management APIs remain secure (frontend-only)
- ✅ No breaking changes to existing functionality
- ✅ Better separation of concerns (public vs. private endpoints)

---

## Previous Changes

(Add previous changelog entries here as the project evolves)