# Tresta — Product Integrity Audit Report

**Audit Type:** Gap Analysis — Public Claims vs. Actual Implementation  
**Date:** February 18, 2026  
**Auditor:** Product Integrity Auditor / Technical Due Diligence  
**Branch:** `fix/checkout-audit`  
**Project Status Claimed:** 97% complete

---

## Table of Contents

- [Methodology](#methodology)
- [Claim Sources Audited](#claim-sources-audited)
- [Claims Extracted](#claims-extracted)
- [Critical Mismatches](#1-critical-mismatches)
- [Notable Disparities](#2-notable-disparities)
- [Verified Claims](#3-verified-claims)
- [Severity Summary](#severity-summary)
- [Verdicts](#verdicts)

---

## Methodology

For every major feature or capability claimed in documentation and marketing surfaces, the corresponding functional logic was located (or confirmed absent) in the codebase. The audit specifically looked for:

- **Ghost Features** — Features listed in README/Landing Page with no backend logic or API routes.
- **"Coming Soon" Disguised as "Live"** — Features that exist in the UI but lead to dead ends or empty handlers.
- **Security Exaggerations** — Claims of advanced security where the code uses basic/insecure implementations.
- **Performance Hyperbole** — Claims of "real-time" or "instant" where the implementation relies on polling or unoptimized patterns.

If code evidence could not be found, the claim is marked **MISSING**. No assumptions about hidden submodules were made.

---

## Claim Sources Audited

| Source | File Path |
|--------|-----------|
| Root README | `README.md` |
| Landing Page — Hero | `apps/web/components/landing/hero.tsx` |
| Landing Page — Features | `apps/web/components/landing/features.tsx` |
| Landing Page — Pain Section | `apps/web/components/landing/pain-section.tsx` |
| Landing Page — Integration | `apps/web/components/landing/integration-section.tsx` |
| Landing Page — FAQ | `apps/web/components/landing/faq.tsx` |
| Landing Page — CTA | `apps/web/components/landing/cta.tsx` |
| Pricing Configuration | `apps/web/config/pricing.ts` |
| Widget README | `packages/widget/README.md` |
| Widget Security README | `packages/widget/src/security/README.md` |
| Widget Component README | `packages/widget/src/components/README.md` |

---

## Claims Extracted

The following 14 major claims were identified across all sources:

1. WebSocket-powered realtime testimonial feed
2. AI-powered auto-moderation with sentiment analysis
3. Zero-dependency vanilla JavaScript widget
4. Video testimonials (Pro paid feature)
5. OAuth verification badges in widget
6. Google + GitHub OAuth for testimonial verification
7. Optimized bundle sizes (42.39 KB IIFE, 58.61 KB ESM)
8. WCAG 2.1 AA accessibility compliance
9. Rate limiting (README says "planned", pricing says "active")
10. 5 widget layout types
11. CSP compliance toolkit
12. GDPR-compliant data export & deletion
13. JWT token authentication + CORS protection
14. Clerk authentication

---

## 1. Critical Mismatches

These are claims that are materially false or misleading.

---

### 1.1 — "WebSocket-powered live feed"

| Field | Detail |
|-------|--------|
| **Claim** | *"WebSocket-powered live feed. See new testimonials the instant they arrive."* |
| **Source** | `apps/web/components/landing/features.tsx` (line 397) |
| **Severity** | 🔴 CRITICAL |
| **Verdict** | **MISMATCH — Not real-time. Landing page UI is animated theater.** |

**Code Evidence:**

- **Ably library installed** (`ably` ^2.14.0 in both `apps/api` and `apps/web` package.json), but it is used **exclusively for user notification channels** (`notifications:${userId}`), not testimonial updates.
  - Server: `apps/api/src/services/ably.service.ts` — singleton Ably Realtime instance
  - Client: `apps/web/components/ably-provider.tsx` — subscribes to `notifications:${userId}` only
  - Token endpoint: `GET /api/ably/token` — scoped to notification channels
  - Feature flag: Behind `NEXT_PUBLIC_ENABLE_REAL_NOTIFICATIONS` (defaults to **disabled**)

- **Widget uses plain HTTP fetch** — `packages/widget/src/api/client.ts` makes standard REST API calls. No WebSocket, no Ably, no real-time subscription of any kind exists in the widget package.

- **Landing page "realtime feed" is a `setInterval` animation** cycling hardcoded strings:
  ```
  // apps/web/components/landing/features.tsx, line 239
  const interval = setInterval(() => {
    current = (current + 1) % realtimeFeed.length;
    setVisibleItems((prev) => {
      const next = [current, ...prev];
      return next.slice(0, 3);
    });
  }, 2500);
  ```
  The UI renders a fake "WebSocket Connected" badge (line 257) with a pulsing green dot — purely cosmetic.

- **No testimonial pub/sub channels exist** — no `testimonials:${projectId}` or `widget:${widgetId}` channels anywhere in the codebase.

---

### 1.2 — "AI-powered moderation"

| Field | Detail |
|-------|--------|
| **Claim** | *"AI-powered spam and profanity filtering with sentiment analysis"*, *"Advanced Sentiment Analysis — Weighted keyword detection with 5-category sentiment scoring"*, *"Smart moderation — AI-flagged content"* |
| **Source** | `README.md` (lines 58, 70–73), `apps/web/components/landing/features.tsx` (line 387) |
| **Severity** | 🔴 CRITICAL |
| **Verdict** | **OVERSTATED — No AI/ML. System is keyword/regex-based heuristics.** |

**Code Evidence:**

- **The code's own docstring contradicts the README:**
  ```
  // apps/api/src/services/moderation.service.ts (header comment)
  /**
   * Auto-Moderation Service
   *
   * Heuristic-based content moderation for testimonials.
   * Future: Can be enhanced with AI moderation APIs (OpenAI, Perspective API)
   */
  ```

- **Sentiment analysis** (`moderation.service.ts`, lines 574–672): Keyword matching against ~48 manually curated words split into three negative severity tiers and one positive list. Scoring formula is simple arithmetic:
  ```
  score -= severeNegative.found.length * 0.4
  score -= strongNegative.found.length * 0.25
  score -= moderateNegative.found.length * 0.15
  score += positiveFound.found.length * 0.2
  ```

- **Profanity detection** (lines 46–359): Hardcoded word lists (~110 words from `PROFANITY_SEVERE` and `PROFANITY_MILD` arrays) with regex-based obfuscation normalization (leet speak, character repetition). No external library.

- **Spam detection** (lines 365–524): Rule-based heuristics — checks for URL count, capitalization percentage, special character ratio, repeated characters, disposable email domains, pronoun ratios, brand mention frequency. All regex/arithmetic.

- **Risk scoring** (lines 693–734): Simple formula: `score = 0.5 + bonuses - penalties`, then inverted (`risk = 1 - qualityScore`). Not a trained model.

- **No AI/ML dependencies anywhere:** No OpenAI, Hugging Face, TensorFlow, Perspective API, sentiment analysis libraries, or any ML packages in any `package.json`.

---

### 1.3 — "Zero Dependencies: Pure vanilla JavaScript"

| Field | Detail |
|-------|--------|
| **Claim** | *"Zero Dependencies: Pure vanilla JavaScript, CDN-ready"* |
| **Source** | `README.md` (line 84) |
| **Severity** | 🔴 CRITICAL |
| **Verdict** | **FALSE — Widget has 3 runtime dependencies including a UI framework.** |

**Code Evidence:**

- `packages/widget/package.json` (lines 30–34):
  ```json
  "dependencies": {
    "clsx": "^2.1.1",
    "dompurify": "^3.3.0",
    "preact": "^10.27.2"
  }
  ```

- **Preact** is used as the primary UI framework — all widget components are JSX/Preact components (`packages/widget/src/components/TestimonialCard.tsx`, layouts, etc.)
- **clsx** is used for className merging (`packages/widget/src/lib/utils.ts`)
- **DOMPurify** is used for HTML sanitization (`packages/widget/src/security/sanitizer.ts`)
- Build toolchain uses `@preact/preset-vite` with React-to-Preact aliases

---

### 1.4 — "Video testimonials" (Paid Pro Feature)

| Field | Detail |
|-------|--------|
| **Claim** | *"Video testimonials (up to 5 min each)"* listed as an **active Pro plan feature** |
| **Source** | `apps/web/config/pricing.ts` (line 74) |
| **Severity** | 🔴 CRITICAL |
| **Verdict** | **INCOMPLETE — Sold as a paid feature, but videos cannot be played in-app.** |

**Code Evidence:**

- **What exists (infrastructure only):**
  - Database schema: `videoUrl` field + `VIDEO` enum in `TestimonialType` (`packages/database/prisma/schema.prisma`, line 219, 257)
  - Upload routes: `apps/api/src/controllers/media.controller.ts` supports `StorageDirectory.VIDEOS`
  - Storage config: `apps/api/src/services/blob-storage.service.ts` — 200MB max, accepts mp4/webm/quicktime
  - Frontend upload hook: `apps/web/hooks/use-azure-sas.ts` — video upload validation

- **What is missing (user-facing functionality):**
  - Widget `TestimonialCard.tsx` (143 lines): **No `<video>` element**, no video player, no video rendering of any kind
  - Frontend `testimonial-card.tsx`: Shows video as an **external link**, not an embedded player
  - No video processing/transcoding (no ffmpeg or similar)
  - No video thumbnail generation

---

## 2. Notable Disparities

These are claims that are partially true but materially incomplete or misleading.

---

### 2.1 — Widget Verification Badges

| Field | Detail |
|-------|--------|
| **Claim** | *"Verified Badges: Display OAuth verification status in all layouts"* |
| **Source** | `README.md` (line 87), `packages/widget/src/components/README.md` (line 9) |
| **Severity** | 🟠 HIGH |
| **Verdict** | **MISSING IN WIDGET — Types and tests exist, but rendering is not implemented.** |

**Code Evidence:**

- `Testimonial` type includes `isOAuthVerified` and `oauthProvider` fields (`packages/widget/src/types/index.ts`, lines 82–83)
- Tests expect `.tresta-verification-badge` elements (`packages/widget/src/components/__tests__/testimonial-card.test.ts`, lines 243–286)
- Widget component README documents the badge feature (line 110: *"9.1-9.5: OAuth verification badge rendering"*)
- **Actual `TestimonialCard.tsx`** (143 lines): Never reads `isOAuthVerified`, renders **zero** badge markup. The field is completely ignored.

---

### 2.2 — GitHub OAuth for Testimonial Verification

| Field | Detail |
|-------|--------|
| **Claim** | *"OAuth Providers — Google, GitHub integration"* |
| **Source** | `README.md` (line 97) |
| **Severity** | 🟠 HIGH |
| **Verdict** | **OVERSTATED — GitHub OAuth is for user login only, not testimonial verification.** |

**Code Evidence:**

- **Google OAuth for testimonials:** Fully implemented
  - Token verification: `apps/api/src/lib/google-oauth.ts` (`verifyGoogleIdToken()`)
  - Testimonial flow: `apps/api/src/controllers/testimonial.controller.ts` (lines 195–220)
  - Frontend provider: `apps/web/components/google-oauth-provider.tsx`

- **GitHub OAuth:** Exists only in **Clerk authentication** components
  - `apps/web/components/auth/oauth-buttons.tsx` — GitHub login button
  - `apps/web/components/sign-up-form.tsx` / `sign-in-form.tsx` — GitHub handlers
  - **No backend GitHub token verification** for testimonial submissions exists

---

### 2.3 — ESM Bundle Size

| Field | Detail |
|-------|--------|
| **Claim** | *"Optimized bundle (42.39 KB IIFE, 58.61 KB ESM)"* |
| **Source** | `README.md` (line 86) |
| **Severity** | 🟡 MEDIUM |
| **Verdict** | **UNVERIFIABLE — No ESM build is configured.** |

**Code Evidence:**

- `packages/widget/vite.config.ts` (line 13): `formats: ["iife"]` — only IIFE format is built
- No `"es"` or `"esm"` entry in the formats array
- Build output is a single `tresta-widget.js` file (IIFE)
- The claimed ESM bundle does not exist in any build pipeline

---

### 2.4 — WCAG 2.1 AA Accessibility

| Field | Detail |
|-------|--------|
| **Claim** | *"WCAG 2.1 AA compliant (keyboard nav, focus states, screen readers)"* |
| **Source** | `README.md` (line 88) |
| **Severity** | 🟡 MEDIUM |
| **Verdict** | **PARTIAL — Good ARIA/screen reader support, but keyboard nav and focus styles are incomplete.** |

**Code Evidence:**

| Sub-claim | Status | Evidence |
|-----------|--------|----------|
| ARIA attributes | ✅ Verified | Extensive: `role="region"`, `aria-label`, `aria-roledescription="carousel"`, `role="tabpanel"`, `role="tab"`, `role="img"` for ratings |
| Screen reader support | ✅ Verified | `aria-live="polite"`, `announceToScreenReader()` method, `.tresta-sr-only` CSS class |
| Keyboard navigation | ⚠️ Incomplete | Native `<button>` Tab/Enter works; **no arrow key handlers** (`ArrowLeft`, `ArrowRight`, `Home`, `End`) in carousel |
| Focus styles | ❌ Missing | **No `:focus-visible` CSS** found in `packages/widget/src/index.css`; no visible focus indicators |
| Focus trapping | ❌ Missing | No focus trap implementation |
| Accessibility utility | ❌ Deleted | `packages/widget/src/utils/accessibility.ts` was deleted (confirmed in git status) |
| Test suite | ✅ Exists | `packages/widget/src/__tests__/accessibility.test.ts` — 600-line comprehensive test file |

---

### 2.5 — Rate Limiting (Outdated Documentation)

| Field | Detail |
|-------|--------|
| **Claim** | README: *"Rate Limiting — Protection against abuse (planned)"*; Pricing: *"API access (GET testimonials, rate-limited)"* |
| **Source** | `README.md` (line 98), `apps/web/config/pricing.ts` (line 48) |
| **Severity** | 🟡 MEDIUM |
| **Verdict** | **README OUTDATED — Rate limiting is fully implemented but README still says "(planned)".** |

**Code Evidence:**

- `rate-limiter-flexible` v8.2.0 installed in `apps/api/package.json`
- Redis-backed middleware at `apps/api/src/middleware/rate-limiter.ts` with multiple tiers:
  - API: 100 requests/minute per user
  - Email: 10 emails/hour per user
  - Admin read: 100 requests/minute
  - Admin write: 30 requests/minute
  - Admin heavy: 10 requests/5 minutes
  - Public (IP-based): 300 requests/5 minutes
- Per-API-key rate limiting in `apps/api/src/middleware/api-key.middleware.ts` (configurable 1–10,000 requests/hour)
- Applied across routes: `public.route.ts`, `notifications.route.ts`, `widget-analytics.route.ts`, admin routes
- `RateLimitError` class with proper HTTP 429 responses and retry headers

---

## 3. Verified Claims

These claims are accurate and backed by implementation.

---

### 3.1 — Widget Layout Types

| Field | Detail |
|-------|--------|
| **Claim** | *"5 Layout Types: Carousel, Grid, Masonry, Wall, List"* |
| **Source** | `README.md` (line 81) |
| **Verdict** | ✅ **ACCURATE (actually understated — 6 layouts exist)** |

**Code Evidence:**

Six distinct layout files in `packages/widget/src/components/layouts/`:
- `CarouselLayout.tsx` — scroll-snap with navigation arrows
- `GridLayout.tsx` — responsive CSS Grid
- `ListLayout.tsx` — single-column flex
- `MasonryLayout.tsx` — CSS columns waterfall
- `WallOfLoveLayout.tsx` — multi-column with rotation/scale transforms
- `MarqueeLayout.tsx` — infinite scrolling with two rows (**undocumented**)

All registered in `packages/widget/src/components/WidgetRoot.tsx` (lines 28–43).

---

### 3.2 — CSP Compliance Toolkit

| Field | Detail |
|-------|--------|
| **Claim** | *"CSP Compliance: Runtime validator + CI audit script for strict security policies"* |
| **Source** | `README.md` (line 89) |
| **Verdict** | ✅ **VERIFIED** |

**Code Evidence:**

- **Runtime validator:** `packages/widget/src/security/csp-validator.ts` — 267-line `CSPValidator` class with URL validation, nonce support (`getNonce()`, `applyNonce()`), CSP violation listener, strict CSP detection, CSP-friendly embed code generator
- **CI audit script:** `packages/widget/scripts/audit-csp-compliance.js` — 266-line Node.js script checking for `eval()`, `Function()`, inline event handlers, `javascript:` URLs, external domain references. Exits with code 1 on violations.
- **Integration:** Configured as `pnpm audit-csp` in widget `package.json`. Used in `core/widget.ts`.
- **Test coverage:** `packages/widget/src/__tests__/csp-compliance.test.ts` — 290-line comprehensive test suite

---

### 3.3 — GDPR-Compliant Data Export & Deletion

| Field | Detail |
|-------|--------|
| **Claim** | *"Data Export & Deletion — GDPR-compliant data portability and account deletion"* |
| **Source** | `README.md` (lines 66–67) |
| **Verdict** | ✅ **VERIFIED** |

**Code Evidence:**

- **Data export:** `apps/api/src/controllers/privacy.controller.ts` — `getPrivacyData()` endpoint (`GET /api/privacy/data`). Admin DSAR export in `apps/api/src/controllers/admin/users.controller.ts` — `exportUserData()`
- **Account deletion:** `privacy.controller.ts` — `deletePrivacyData()` anonymizes testimonial data (sets PII to null). `apps/web/components/account-settings/data-privacy-section.tsx` — `handleDeleteAccount()` uses Clerk's `user.delete()`
- **Cascading deletion:** `apps/api/src/webhooks/clerk.webhook.ts` — handles `user.deleted` event, cascades to database
- **Privacy pages:** Privacy policy, privacy request form, data management portal, privacy transparency component
- **Access control:** JWT-based privacy access tokens with email verification

> **Note:** Testimonial data is anonymized (PII nulled) rather than hard-deleted, which is a valid GDPR approach.

---

### 3.4 — JWT Token Authentication + CORS Protection

| Field | Detail |
|-------|--------|
| **Claim** | *"JWT Tokens — Bearer token authentication for API"*, *"CORS Protection — Configured for secure cross-origin requests"* |
| **Source** | `README.md` (lines 95–96) |
| **Verdict** | ✅ **VERIFIED** |

**Code Evidence:**

- **JWT:** `jsonwebtoken` library used in `apps/api/src/controllers/privacy.controller.ts` — signed tokens with 1-hour expiration for privacy access. JWT error handling in `apps/api/src/middleware/error.middleware.ts` (lines 86–99).
- **CORS:** `apps/api/src/middleware/cors.middleware.ts` — dynamic middleware with three policies:
  - Restrictive (authenticated endpoints): only `FRONTEND_URL` and `ADMIN_URL`
  - Public (widget endpoints): allows any origin
  - Webhook (Clerk): specific webhook origins
- **API key auth:** `apps/api/src/middleware/api-key.middleware.ts` — Bearer token support with per-key rate limits

---

### 3.5 — Clerk Authentication

| Field | Detail |
|-------|--------|
| **Claim** | *"Clerk Authentication — Secure user management and OAuth"* |
| **Source** | `README.md` (line 94) |
| **Verdict** | ✅ **VERIFIED** |

**Code Evidence:**

- Clerk Express SDK in `apps/api/src/middleware/auth.middleware.ts`
- Clerk webhooks for user sync in `apps/api/src/webhooks/clerk.webhook.ts`
- Frontend Clerk components: `apps/web/app/(auth)/sign-in/`, `apps/web/app/(auth)/sign-up/`
- SSO callback page: `apps/web/app/(auth)/sso-callback/page.tsx`

---

### 3.6 — Google OAuth Verification

| Field | Detail |
|-------|--------|
| **Claim** | *"Google Sign-In for verified testimonials"* |
| **Source** | `README.md` (line 57) |
| **Verdict** | ✅ **VERIFIED** |

**Code Evidence:**

- Token verification: `apps/api/src/lib/google-oauth.ts` — `verifyGoogleIdToken()` function
- Testimonial submission flow: `apps/api/src/controllers/testimonial.controller.ts` (lines 195–220)
- Frontend provider: `apps/web/components/google-oauth-provider.tsx`
- Submission form integration: `apps/web/app/(standalone)/testimonials/[slug]/page.tsx`

---

## Severity Summary

| Severity | Count | Items |
|----------|-------|-------|
| 🔴 **CRITICAL** (false / materially misleading claim) | 4 | WebSocket realtime (§1.1), AI-powered moderation (§1.2), Zero dependencies (§1.3), Video testimonials as paid feature (§1.4) |
| 🟠 **HIGH** (partially missing / incomplete) | 2 | Widget verification badges (§2.1), GitHub OAuth scope (§2.2) |
| 🟡 **MEDIUM** (outdated docs / partial) | 3 | ESM bundle (§2.3), WCAG AA (§2.4), Rate limiting docs (§2.5) |
| ✅ **CLEAN** (verified) | 6 | Layouts (§3.1), CSP (§3.2), GDPR (§3.3), JWT/CORS (§3.4), Clerk (§3.5), Google OAuth (§3.6) |

---

## Verdicts

### Immediate (before any public launch / paid customers)

1. **Remove the "WebSocket-powered" claim** in `features.tsx`. Change the copy to accurately describe the notification system. The fake "WebSocket Connected" badge should be removed from the landing page animation.

2. Integrate an actual AI service (OpenAI Moderation API, Google Perspective API) to match the claim.

3. **Remove "Zero Dependencies" / "Pure vanilla JavaScript"** from `README.md`. Replace with accurate language, e.g., *"Lightweight Preact-based widget (~42 KB gzipped)"*.

4. **Move "Video testimonials" out of active pricing features** until video playback is implemented in both the widget and the dashboard. Users currently pay for upload-only infrastructure with no way to view videos.

### High Priority

5. **Implement verification badge rendering** in `packages/widget/src/components/TestimonialCard.tsx`. The types, tests, documentation, and CSS classes all exist — only the JSX markup is missing.

6. **Clarify GitHub OAuth scope** in `README.md` — make it clear that GitHub is for platform authentication, not testimonial verification.

### Medium Priority

7. **Update `README.md` line 98:** Change Rate Limiting from "(planned)" to a completed feature with implementation details.

8. Remove the ESM bundle size claim from `README.md`.

9. **Complete WCAG 2.1 AA compliance** for the widget:
   - Add arrow key handlers to the carousel (`ArrowLeft`, `ArrowRight`, `Home`, `End`)
   - Add `:focus-visible` styles to `packages/widget/src/index.css`
   - Restore or replace the deleted `accessibility.ts` utility file

10. **Document the 6th layout (Marquee)** — it's implemented and functional but not mentioned in any documentation.

---

*End of audit report.*
