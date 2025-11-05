# Changelog

All notable changes to the Tresta project will be documented in this file.

## [Unreleased]

### Added - 2024-11-05

#### Google OAuth Verification for Testimonials

**Feature:** Integrated Google OAuth authentication to verify testimonial authors and increase credibility.

**Implementation:**
- **Frontend OAuth integration**: 
  - Added `@react-oauth/google` package for Google Sign-In button
  - Created `GoogleOAuthProvider` wrapper component
  - Auto-fill testimonial form (name, email, avatar) from Google profile
  - Store Google ID token for server-side verification
  
- **Backend verification**:
  - Added `google-auth-library` package for token verification
  - Created `verifyGoogleIdToken()` utility for server-side validation
  - Updated testimonial controller to accept and verify `googleIdToken` parameter
  - Store verification status with `isOAuthVerified`, `oauthProvider`, `oauthSubject` fields
  
- **Database schema updates**:
  - Added `isOAuthVerified` (Boolean, default false) to Testimonial model
  - Added `oauthProvider` (String?, nullable) to store provider name
  - Added `oauthSubject` (String?, nullable) to store unique OAuth subject ID
  - Created migration: `20251105044214_add_oauth_verification`
  - Added index on `isOAuthVerified` for efficient filtering
  
- **Verified badge display**:
  - Added green checkmark badge to verified testimonials in all widget layouts
  - Badge shows OAuth provider in tooltip (e.g., "Verified via google")
  - Styled with green background (#d1fae5), circular shape, 16px size
  - SVG shield check icon for visual clarity
  
- **Management UI enhancements**:
  - Display verified badge on testimonial cards with `ShieldCheck` icon
  - Added verification filter dropdown (All Verification / Verified / Unverified)
  - Combined filtering: status (pending/approved/published) + verification
  - Show OAuth provider in badge tooltip for owner reference
  
**Files Modified:**
- `packages/database/prisma/schema.prisma` - Added OAuth fields
- `apps/api/src/lib/google-oauth.ts` - NEW: Token verification utility
- `apps/api/src/controllers/testimonial.controller.ts` - Accept and verify tokens
- `apps/api/src/controllers/widget.controller.ts` - Return OAuth fields
- `apps/web/components/google-oauth-provider.tsx` - NEW: OAuth wrapper
- `apps/web/app/(public)/testimonials/[slug]/page.tsx` - Google Sign-In integration
- `apps/web/components/testimonial-card.tsx` - Verified badge display
- `apps/web/components/testimonial-list.tsx` - Verification filter
- `apps/web/types/api.ts` - Added OAuth fields to Testimonial interface
- `packages/widget/src/types.ts` - Added OAuth fields to widget types
- `packages/widget/src/renderer.ts` - Verified badge in testimonials
- `packages/widget/src/carousel.ts` - Verified badge in carousel
- `packages/widget/src/styles.ts` - Verified badge styles
- `packages/widget/src/widget.ts` - Pass OAuth fields to carousel

**Environment Variables:**
- `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` - Frontend client ID
- `GOOGLE_OAUTH_CLIENT_ID` - Backend client ID (same as frontend)
- `GOOGLE_OAUTH_CLIENT_SECRET` - Backend client secret

**Widget Build:**
- Rebuilt widget: 42.39 KB (IIFE), 58.61 KB (ESM)
- Includes verified badge support in all layouts

#### Widget Branding Footer

**Feature:** Added "Powered by Tresta" watermark to all widgets for brand visibility.

**Implementation:**
- Created `renderBranding()` function in renderer
- Always displays at bottom of widget with top border separator
- Small gray text (12px) with branded link to tresta.io
- Link styled with primary theme color and hover effect
- Fixed demo files to properly render branding footer

**Files Modified:**
- `packages/widget/src/renderer.ts` - `renderBranding()` function
- `packages/widget/src/widget.ts` - Call branding in render pipeline
- `packages/widget/index.html` - Include branding in demo
- `packages/widget/src/styles.ts` - Branding styles

---

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