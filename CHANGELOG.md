# Changelog

All notable changes to the Tresta project will be documented in this file.

## [Unreleased]

### Added - 2024-11-07 (Evening) - Moderation UX Overhaul

#### Complete Design System Transformation

**Feature:** Minimal aesthetic overhaul of moderation system with strategic color usage and granular loading states.

**UI/UX Changes:**

**1. Design System Principles:**

- **Minimal aesthetic**: Removed all bright backgrounds (yellow/orange/green/red/blue)
- **Strategic colors**:
  - Primary (teal): Positive actions, verification, published states
  - Destructive (red): Warnings, risks, flagged/rejected content
  - Muted/neutral: All other elements
- **Compact layouts**: Horizontal flex rows instead of grids (90% space reduction)
- **Subtle accents**: 5-10% opacity backgrounds, 10-30% opacity borders

**2. Component Updates:**

- **Moderation Stats Dashboard** (`apps/web/components/moderation/moderation-stats-dashboard.tsx`):
  - Single horizontal flex row (was 2x4 grid)
  - Total count in bordered box
  - Small dots (h-2 w-2) for neutral states
  - Icons only for warnings (AlertTriangle, XCircle)
  - Conditional rendering (only shows when count > 0)
  - Removed percentages and verbose labels

- **Moderation Testimonial Card** (`apps/web/components/moderation/moderation-testimonial-card.tsx`):
  - Clean p-6 padding throughout
  - Avatar fallback with primary accent (bg-primary/5)
  - Verified badge with subtle primary styling
  - Risk badges use destructive for high risk (≥70%)
  - Granular per-action loading states
  - Only clicked button shows spinner

- **Filter Presets** (`apps/web/components/moderation/filter-presets.tsx`):
  - Removed colored variants (warning/destructive/info)
  - Active state uses subtle primary
  - Clean outline buttons only

- **Regular Testimonial Cards** (`apps/web/components/testimonial-card.tsx`):
  - Matched moderation card layout
  - Single CardContent (removed CardHeader/CardFooter)
  - Status badges: Published (primary), Pending (muted)
  - Star ratings use primary instead of yellow
  - Moderation flags shown inline (no tooltips)

- **Testimonial List Header** (`apps/web/components/testimonial-list.tsx`):
  - Compact horizontal stats layout
  - Small dots for status indicators
  - Icons only for warnings
  - Removed dividers and badge groups

**3. Loading State System:**

- **Granular Per-Action Loading** (`apps/web/components/testimonial-list.tsx`):
  - State structure: `{ id: string; action: string } | null`
  - Action types: 'approve', 'reject', 'publish', 'unpublish', 'delete'
  - Button-specific spinners (only clicked button loads)
  - Other buttons remain interactive during action
  - Loading state cleared in `finally` blocks

**4. Backend Support:**

- **Update Testimonial Endpoint** (`apps/api/src/controllers/testimonial.controller.ts`):
  - Added `moderationStatus` to accepted fields
  - Now updates moderationStatus alongside isApproved/isPublished
  - Ensures frontend button visibility logic works correctly

**5. Type System:**

- **Frontend Types** (`apps/web/types/api.ts`):
  - Added `moderationStatus?: ModerationStatus` to `UpdateTestimonialPayload`

**6. Cache Management:**

- **TanStack Query Mutations** (`apps/web/lib/queries/testimonials.ts`):
  - Added `refetchType: 'active'` to invalidation
  - Forces immediate refetch after mutations
  - Ensures instant UI updates after actions

**7. Cleanup:**

- Removed corrupted `moderation-queue.tsx` file (1168 lines of broken code)
- Component was not being used anywhere
- Functionality already implemented in `TestimonialList` with `moderationMode` prop

**Before/After Examples:**

```tsx
// BEFORE: Large grid with colored backgrounds
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="bg-yellow-100 border-yellow-500">
    <CardContent className="p-6">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-yellow-600" />
        <div>
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-yellow-600">(30%)</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

// AFTER: Compact horizontal row with subtle accents
<div className="flex items-center gap-4 pb-4 border-b flex-wrap">
  <div className="px-3 py-1 rounded-md border bg-muted/30">
    <span className="text-sm font-medium">4 Total</span>
  </div>
  {pending > 0 && (
    <div className="flex items-center gap-2 text-sm">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="text-muted-foreground">{pending} Pending</span>
    </div>
  )}
</div>
```

### Added - 2024-11-07 (Morning) - Auto-Moderation System

#### Auto-Moderation System with Advanced Sentiment Analysis

**Feature:** AI-powered content moderation system to automatically filter spam, profanity, and inappropriate testimonials with sentiment analysis.

**Implementation:**

- **Auto-Moderation Service** (`apps/api/src/services/moderation.service.ts`):
  - Multi-category profanity detection (severe, mild, offensive)
  - Advanced sentiment analysis with weighted keywords
  - Sentiment scoring from -1 (very negative) to +1 (very positive)
  - Five sentiment categories: very_negative, negative, neutral, positive, very_positive
  - Spam pattern detection (excessive caps, repeated characters, URLs)
  - Risk score calculation (0-1, higher = more problematic)
  - Detailed moderation flags with reasons
- **Database Schema** (Migration: `20251106144930_add_auto_moderation`):
  - Added `ModerationStatus` enum: PENDING, APPROVED, REJECTED, FLAGGED
  - Added `moderationStatus`, `moderationScore`, `moderationFlags`, `autoPublished` to Testimonial model
  - Project-level moderation settings: `autoModeration`, `autoApproveVerified`, `profanityFilterLevel`
- **Migration Script for Existing Data**:
  - Created `apps/api/src/scripts/migrate-existing-testimonials.ts`
  - Batch processes existing PENDING testimonials (50 at a time)
  - Respects project-level auto-moderation settings
  - Run via `pnpm migrate:testimonials` command
  - Outputs detailed statistics (approved/flagged/rejected counts)
- **Integrated Moderation UI** (`apps/web/components/testimonial-list.tsx`):
  - Replaced separate moderation page with inline moderation
  - Select All checkbox for bulk operations
  - Moderation status filter dropdown (PENDING/APPROVED/FLAGGED/REJECTED)
  - Individual checkboxes per testimonial card
  - Fixed bottom bulk actions bar (Approve/Flag/Reject buttons)
  - Moderation stats badges in header
- **Enhanced Testimonial Cards** (`apps/web/components/testimonial-card.tsx`):
  - Color-coded moderation badges (Green Shield, Red AlertTriangle, Red XCircle)
  - Detailed tooltips showing risk score and moderation flags
  - Visual integration with status and verification badges
  - Truncated flag display (first 3 + count of remaining)

**UX Improvements:**

- No separate moderation page needed - all inline
- Quick bulk moderation actions
- Fixed action bar prevents layout shift
- Clear visual indicators for flagged/rejected content
- Transparent moderation reasons via tooltips

**Files Added:**

- `apps/api/src/services/moderation.service.ts` - Core moderation logic (450+ lines)
- `apps/api/src/scripts/migrate-existing-testimonials.ts` - Data migration script
- `packages/database/prisma/migrations/20251106144930_add_auto_moderation/` - Schema migration

**Files Modified:**

- `apps/api/src/controllers/testimonial.controller.ts` - Integrated moderation on create
- `apps/web/components/testimonial-list.tsx` - Bulk actions and filters
- `apps/web/components/testimonial-card.tsx` - Moderation badges
- `apps/api/package.json` - Added `migrate:testimonials` script

**Dependencies:**

- No new external dependencies (uses built-in string matching)

---

### Added - 2024-11-06

#### Custom Account Settings with Privacy Transparency

**Feature:** Comprehensive custom account settings page matching authentication UI design with modular components and dedicated privacy transparency.

**Implementation:**

- **Account Settings Refactoring**:
  - Refactored monolithic `account-settings-form.tsx` into 6 modular components
  - `ProfileImageSection`: Avatar upload/removal with 5MB validation
  - `ProfileInformationSection`: Name editing with react-hook-form
  - `PasswordSection`: Conditional password management (OAuth users can't change)
  - `ConnectedAccountsSection`: Display OAuth provider status with badges
  - `AccountInformationSection`: Member since and last updated dates
  - `DataPrivacySection`: Enhanced data export + account deletion
- **Enhanced Data Export**:
  - Export includes user profile, projects, widgets, and testimonials in single JSON file
  - Timestamped filename: `tresta-data-export-YYYY-MM-DD-HHmmss.json`
  - Complete data portability for GDPR compliance
- **Account Deletion**:
  - AlertDialog confirmation before deletion
  - Clear warning about permanent data loss
  - Redirects to sign-in after successful deletion
- **Privacy Transparency Page**:
  - Created dedicated `/privacy` route for data collection disclosure
  - Structured data with TypeScript interfaces (DataItem, DataCategory, etc.)
  - 30+ Lucide icons for visual clarity (User, Mail, MapPin, Activity, etc.)
  - Four main sections: Data Categories, Data Usage, Storage & Security, Your Rights
  - Data-driven rendering via constant arrays (DATA_CATEGORIES, DATA_USAGE, STORAGE_INFO, DATA_RIGHTS)
  - 383 lines of comprehensive privacy information
- **Layout Consistency**:
  - Applied `container mx-auto max-w-4xl py-8 px-4` to all form pages
  - Center-aligned forms: account settings, privacy, new project, edit project
  - Consistent spacing and visual hierarchy
- **UX Improvements**:
  - Removed user ID exposure from account information display
  - Better data collection info formatting with structured components
  - Icon-driven UI for better scannability
  - Modular component architecture for maintainability

**Files Modified:**

- `apps/web/components/account-settings-form.tsx` - Refactored to 65 lines
- `apps/web/components/account-settings/profile-image-section.tsx` - NEW
- `apps/web/components/account-settings/profile-information-section.tsx` - NEW
- `apps/web/components/account-settings/password-section.tsx` - NEW
- `apps/web/components/account-settings/connected-accounts-section.tsx` - NEW
- `apps/web/components/account-settings/account-information-section.tsx` - NEW
- `apps/web/components/account-settings/data-privacy-section.tsx` - NEW
- `apps/web/components/account-settings/data-collection-info.tsx` - NEW: 383 lines with structured data
- `apps/web/components/account-settings/index.ts` - NEW: Barrel export
- `apps/web/app/(dashboard)/privacy/page.tsx` - NEW: Dedicated privacy page
- `apps/web/app/(dashboard)/projects/new/page.tsx` - Updated layout alignment
- `apps/web/app/(dashboard)/projects/[slug]/edit/page.tsx` - Updated layout alignment
- `apps/web/middleware.ts` - Added `/privacy` to protected routes

**Dependencies:**

- No new dependencies (uses existing Lucide React icons)

---

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
- Small gray text (12px) with branded link to tresta.app
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
  src="https://cdn.tresta.app/widget.js"
  data-tresta-widget="YOUR_WIDGET_ID"
></script>
```

With customization:

```html
<script
  src="https://cdn.tresta.app/widget.js"
  data-tresta-widget="YOUR_WIDGET_ID"
  data-primary-color="#10b981"
  data-autoplay="true"
  data-max-items="10"
></script>
```

Programmatic control:

```javascript
const widget = TrestaWidget.init("WIDGET_ID", {
  container: "#testimonials",
  theme: { primaryColor: "#3b82f6" },
  onLoad: (widget) => console.log("Loaded!"),
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
