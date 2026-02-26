# Visual Editor Design Plan
## Phase 1: Investigation Report + Phase 2: Design Proposal

---

## PHASE 1: INVESTIGATION REPORT

### 1. Current Implementation

#### Project Creation/Editing Flow

**Routes:**
- `/projects/new` — `ProjectWizard` component (create mode)
- `/projects/[slug]/edit` — `ProjectWizard` component (edit mode)

**Component:** `apps/web/components/project-wizard/project-wizard.tsx`

**Current form layout:** Split-view `lg:grid-cols-12` — left (5 cols): form, right (7 cols): preview panel.

**Form sections:**
1. `IdentitySection` — name, slug (auto-generated), accent color presets, industry preset cards, tagline
2. `BrandingWizardSection` — theme selector (light/dark/auto), logo upload, brand color picker, remove branding toggle (Pro)
3. `AdvancedSection` — collapsible accordion: Website URL, social links, tags, Pro settings (custom domain, description)

**Preview component:** `ProjectWizardPreview` — tabs: "Widget", "Wall of Love", "Collection Form" + device toggles (desktop/tablet/mobile).

**Critical gap:** The preview tabs in the wizard are **entirely fake**:
- Widget preview: hardcoded mock cards, not the real widget embed
- Form preview: static `FormPreviewContent` with only 2 static fields (Name + Testimonial); does NOT render actual `formConfig` toggles

**Submission:** `react-hook-form` with `zod` validation → `POST /api/projects` or `PUT /api/projects/:slug`.

#### Project Detail Page

Route: `/projects/[slug]` — tabs: Overview, Testimonials, Moderation, Widgets, Settings

The Settings tab (`ProjectSettingsTab`) has three accordion sections:
- General Settings (read-only info + "Edit Project Details" link)
- Auto-Moderation Settings
- **Collection Form Settings** (`FormConfigSettings` component)

This is where `formConfig` is currently configured — buried in a settings accordion, completely disconnected from any preview.

---

### 2. Data Architecture

**Project model** (Prisma schema):
```
Project {
  id, name, slug, shortDescription, description
  logoUrl, brandColorPrimary, brandColorSecondary
  projectType, websiteUrl, collectionFormUrl
  socialLinks Json?      // { twitter, linkedin, github, ... }
  tags String[]
  visibility (PUBLIC/PRIVATE/INVITE_ONLY)
  isActive, autoModeration, autoApproveVerified
  profanityFilterLevel, moderationSettings Json?
  formConfig Json?       // FormConfig — see below
  userId
  testimonials Testimonial[]
  widgets Widget[]
}
```

**FormConfig** (stored as `Project.formConfig` JSON):
```typescript
interface FormConfig {
  // Custom text
  headerTitle?: string
  headerDescription?: string
  thankYouMessage?: string
  // Field visibility
  enableRating, enableJobTitle, enableCompany,
  enableAvatar, enableVideoUrl, enableGoogleVerification: boolean
  // Field requirements
  requireRating, requireJobTitle, requireCompany,
  requireAvatar, requireVideoUrl, requireGoogleVerification: boolean
  // Submission behavior
  allowAnonymousSubmissions, notifyOnSubmission: boolean
}
```

**Widget model:**
```
Widget {
  id, projectId
  config Json   // WidgetConfig — see below
  createdAt, updatedAt
}
```

**WidgetConfig** (stored as `Widget.config` JSON):
```typescript
interface WidgetConfig {
  layout: "grid"|"list"|"masonry"|"carousel"|"wall"|"marquee"
  theme: "light"|"dark"|"auto"
  primaryColor?: string
  showRating, showAvatar, showDate, showAuthorRole, showAuthorCompany: boolean
  maxTestimonials: number
  columns, gap: number
  cardStyle: "default"|"minimal"|"bordered"|"glass"
  animation: "none"|"fadeIn"|"slideUp"|"scale"
  cardRadius, cardShadow: ...
  autoRotate, rotateInterval, showNavigation, showDots: ...
  showBranding: boolean   // "Powered by Tresta"
  customCss?: string
}
```

**Relationships:** Project has-many Widgets, Project has-many Testimonials. Widget is per-project, 1 free widget max, unlimited on Pro.

---

### 3. Collection Page Rendering

**URL:** `/testimonials/[slug]` — under `(standalone)` layout (no sidebar, no auth required)

**Component:** `apps/web/app/(standalone)/testimonials/[slug]/page.tsx` (~900 lines)

**Data fetch:** `GET /api/public/projects/:slug` — public endpoint, no auth.

**Form fields** (all dynamically shown/hidden via formConfig):
- Google OAuth verification button (if `enableGoogleVerification`)
- Star rating 1–5 (if `enableRating`, required if `requireRating`)
- Testimonial textarea (always required)
- Name (always required), Email (always required)
- Job Title / Role (if `enableJobTitle`, required if `requireJobTitle`)
- Company (if `enableCompany`, required if `requireCompany`)
- Avatar photo upload (if `enableAvatar`, required if `requireAvatar`)
- Video URL (collapsible section, if `enableVideoUrl`)
- Privacy checkbox + anonymous option (if `allowAnonymousSubmissions`)

**Brand theming:** Sets CSS custom property `--accent-color` from `project.brandColorPrimary`. The page header shows project logo and custom `headerTitle`/`headerDescription` from formConfig.

**Submission:** `POST /api/testimonials` — server enforces formConfig requirements (matching client-side validation).

**Shell wrapper:** `CollectionPageShell` — `min-h-screen bg-muted/20 py-8`.

**States:** loading skeleton, already-submitted screen, success screen with custom `thankYouMessage`.

---

### 4. Widget Configuration and Rendering

**Widget creation routes:**
- `/projects/[slug]/widgets/new` → `WidgetBuilder` (create mode)
- `/projects/[slug]/widgets/[widgetId]/edit` → `WidgetBuilder` (edit mode)

**`WidgetBuilder`** (`apps/web/components/widgets/widget-builder.tsx`):
Split-view layout — left: `WidgetForm`, right: `WidgetPreview`. `onConfigChange` prop pipes form changes to preview with 150ms debounce.

**`WidgetForm`** (`apps/web/components/widgets/widget-form.tsx`):
Sections:
- `WidgetBasicSection`: layout picker (6 visual cards), theme selector (3 cards)
- `WidgetAppearanceSection`: accent color picker (Pro-gated for custom colors)
- `WidgetDisplaySection`: showRating, showAvatar toggles; showBranding `LockedToggle` (Pro)
- `WidgetLayoutSection`: maxTestimonials slider (1–20)
- `WidgetAdvancedSection`: customCss textarea (Pro)

**Pro-gated layouts:** masonry, carousel, wall, marquee

**`WidgetPreview`** (`apps/web/components/widgets/widget-preview.tsx`):
- Builds a complete HTML document string (`buildPreviewDocument`)
- Loads the actual `widget.js` script in an iframe (`srcDoc`)
- Mocks `GET /api/widgets/:widgetId/public` by intercepting fetch in the iframe
- Sends mock testimonials + current widget config to the widget renderer
- This is a **fully accurate, interactive preview** that closely matches the final embedded widget

**Embedding:** Users get `<script>` + `<div data-tresta-widget="widgetId">` embed code via `EmbedCodeDialog`.

---

### 5. Preview Mechanisms

| Preview | Location | Accuracy |
|---------|----------|----------|
| Widget (in WidgetBuilder) | `WidgetPreview` via iframe + real widget.js | ✅ Excellent |
| Widget (in ProjectWizard) | `WidgetPreviewContent` — hardcoded mock cards | ❌ Fake |
| Wall (in ProjectWizard) | `WallPreviewContent` — hardcoded mock cards | ❌ Fake |
| Collection Form (in ProjectWizard) | `FormPreviewContent` — 2 static fields only | ❌ Fake |
| Collection Form (standalone page) | Full real UI at `/testimonials/[slug]` | ✅ Real |

The `WidgetPreview` iframe approach is proven and robust. The main opportunity is building an accurate Collection Form preview.

---

### 6. Feature Gating

**Detection:** `useSubscription()` hook → `isPro: data?.plan?.type === "PRO"`

**Paywall components** (`apps/web/components/paywall/PaywallComponents.tsx`):
- `ProBadge` — small amber "PRO" badge on locked items
- `LockedToggle` — grayed-out toggle with lock icon + upgrade toast on click
- `PremiumWarningBanner` — amber banner shown when free user selects a Pro option (non-blocking, warns before publish)
- `PremiumOption` — wrapper for selectable premium options (allows selection, shows warning)
- `useFeatureGate()` — hook for programmatic gating; calls `openUpgradeModal()`

**Currently gated features:**
| Feature | Gate Level |
|---------|-----------|
| Layouts: masonry, carousel, wall, marquee | Pro (API enforces) |
| Custom accent colors (non-palette) | Pro (API enforces via `isFreeColor()`) |
| Remove "Powered by Tresta" branding | Pro (UI only, UI marked "Coming Soon") |
| Custom CSS on widget | Pro (UI only) |
| Custom domain | Pro (UI only, marked "Coming Soon") |
| Widgets: max 1 free | Free tier limit |

**API enforcement:** Server-side plan checks in `widget.controller.ts` — checks `project.userId → user.plan` before allowing Pro layouts or custom colors.

---

### Key Problems Identified

1. **Disconnected config flows**: Project identity wizard, form-config settings, and widget creation are 3 completely separate flows across different pages. Users lack a coherent setup path.
2. **Inaccurate previews**: The current wizard preview is entirely fake — shows hardcoded mock cards that don't reflect real settings. This erodes trust.
3. **Form config buried**: Collection form configuration is hidden in Settings tab → accordion → inside a plain form with no preview. Users can't see what their changes look like.
4. **No unified "configure your project" experience**: After creating a project, users must navigate separate tabs and pages to configure the form and create a widget.

---

## PHASE 2: DESIGN PROPOSAL

### Architecture Decision: Unified Two-Step Visual Editor

Replace the current fragmented experience with a single, cohesive visual editor that handles both configuration steps with accurate live previews.

**Proposed routes:**
- `/projects/new` — New Project Editor (Step 1 defaults)
- `/projects/[slug]/configure` — Project Configuration Editor (Step 1: Collection, Step 2: Widget)
- `/projects/[slug]/edit` — Redirect to `/projects/[slug]/configure` (same editor in edit mode)
- `/projects/[slug]/widgets/new` — Can be removed; widget creation integrated into `/configure`
- `/projects/[slug]/widgets/[id]/edit` — Keep for editing existing widgets in isolation

**Alternative considered**: Keep wizard for basic creation, add "Configure" experience separately. Rejected because it adds another disconnected step.

---

### Visual Editor Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Back]  My Awesome Product          [Save & Continue / Publish]│
│  ────────────────────────────────────────────────────────────────│
│  [① Collection Form]    [② Widget Display]                       │
├───────────────────────┬──────────────────────────────────────────┤
│   SETTINGS PANEL      │  LIVE PREVIEW                            │
│   (400px, scrollable) │  (flex-1, sticky, scrollable)            │
│                       │  ┌─────────────────────────────────┐     │
│   Step 1:             │  │ [📱] [💻] [🖥️]  device toggle  │     │
│   • Project name      │  │                                 │     │
│   • Slug / URL        │  │   ┌────────────────────────┐    │     │
│   • Logo upload       │  │   │  [Live collection form │    │     │
│   • Brand color       │  │   │   preview renders here]│    │     │
│   • Form header text  │  │   │                        │    │     │
│   • Form description  │  │   │  ★★★★☆               │    │     │
│   • Thank you message │  │   │  [Testimonial]         │    │     │
│   ── Field Toggles ── │  │   │  [Name] [Email]        │    │     │
│   ✓ Star Rating       │  │   │  [Role] [Company]      │    │     │
│   ✓ Job Title         │  │   │  [Photo]               │    │     │
│   ✓ Company           │  │   └────────────────────────┘    │     │
│   ✓ Avatar Upload     │  └─────────────────────────────────┘     │
│   ✓ Video URL         │                                          │
│   ✓ Google Verify     │                                          │
│                       │                                          │
│   [Next: Widget →]    │                                          │
├───────────────────────┼──────────────────────────────────────────┤
│   Step 2:             │  ┌─────────────────────────────────┐     │
│   • Layout picker     │  │  [iframe: real widget preview]  │     │
│   • Theme             │  │                                 │     │
│   • Accent color      │  │  ┌────┐ ┌────┐ ┌────┐          │     │
│   • Show Rating       │  │  │card│ │card│ │card│          │     │
│   • Show Avatar       │  │  └────┘ └────┘ └────┘          │     │
│   • Max testimonials  │  └─────────────────────────────────┘     │
│   • Remove branding   │                                          │
│     (Pro)             │                                          │
│   • Custom CSS (Pro)  │                                          │
│                       │                                          │
│   [← Back] [Finish]   │                                          │
└───────────────────────┴──────────────────────────────────────────┘
```

---

### Two-Step Flow Design

#### Step 1: Collection Form

**Settings (left panel):**

**Project Identity** (collapsed on edit, expanded on create):
- Project Name (text input)
- Slug / Public URL (auto-generated, editable with reset button)
- Logo (file upload, Azure SAS)
- Brand Color (color picker, Pro for custom colors)

**Collection Form**:
- Form Header Title (text input, placeholder: "Share Your Experience")
- Form Description (textarea, 2 rows)
- Thank You Message (textarea, 2 rows)

**Field Visibility** (toggle grid):
- ⭐ Star Rating `[on/off]` → `[require]`
- 💼 Job Title `[on/off]` → `[require]`
- 🏢 Company `[on/off]` → `[require]`
- 📸 Avatar Upload `[on/off]` → `[require]`
- 🎥 Video URL `[on/off]` → `[require]`
- ✅ Google Verification `[on/off]` → `[require]`

**Submission Behavior** (collapsed accordion):
- Allow anonymous submissions toggle
- Notify on submission toggle

**Preview (right panel):** Accurate rendering of the collection page using a `CollectionFormPreview` component that renders the actual form UI with current config applied. Non-interactive (read-only) preview mode showing how fields will appear/disappear based on toggles.

**Device toggles:** desktop (100%), tablet (768px max-width), mobile (375px max-width) — apply max-width constraint on preview container.

#### Step 2: Widget Display

**Settings (left panel):**

**Layout** (visual card grid, 2×3):
- Grid, List (free)
- Carousel, Masonry, Wall, Marquee (Pro — show ProBadge, PremiumWarningBanner if selected without Pro)

**Theme** (3-button row):
- Light | Dark | Auto

**Appearance:**
- Accent Color (color picker, Pro for custom hex; free users get 6 preset swatches)

**Content** (toggle row):
- Show Ratings `[on/off]`
- Show Avatars `[on/off]`
- Show Date `[on/off]`

**Branding:**
- Remove "Powered by Tresta" — `LockedToggle` (Pro)

**Limits:**
- Max testimonials — slider 1–20

**Advanced** (collapsed accordion):
- Auto-rotate (carousel only)
- Custom CSS — `LockedToggle` (Pro)

**Preview (right panel):** Current `WidgetPreview` component (iframe with real widget.js). Already fully accurate.

---

### Preview Implementation

#### Collection Form Preview

**Problem:** The collection form is ~900 lines of stateful client logic, Google OAuth, file uploads, etc. We can't just render it directly in preview mode.

**Solution:** Extract the form body into a reusable `CollectionFormBody` component with a `previewMode?: boolean` prop. In preview mode:
- Disable all inputs (visual only)
- Hide Google OAuth button
- Show/hide fields based on passed `formConfig` prop
- Apply brand color via inline style / CSS variable
- Show project name and logo in header

**Implementation:** The `CollectionFormPreview` component would:
1. Accept `formConfig` and `projectIdentity` (name, logoUrl, brandColorPrimary) as props
2. Render a scaled-down, read-only version of the real form UI
3. Reactively re-render as user toggles settings in the left panel
4. Wrap in a `div` with `pointer-events: none` + max-width constraint for device preview

**Performance:** Use `useMemo` + debounce (150ms) on config updates, same pattern as `WidgetBuilder`.

#### Widget Preview

No changes needed — `WidgetPreview` iframe is already excellent. Will be reused directly in Step 2.

---

### Navigation & Data Saving

**Step transitions:**
- "Next: Configure Widget →" button on Step 1 saves the project (creates or updates) before advancing
- Step 1 save: `PUT /api/projects/:slug` with `{ name, slug, logoUrl, brandColorPrimary, formConfig }`
- Step 2 save: `POST /api/widgets` (create) or `PUT /api/widgets/:id` (update) with `{ projectId, config }`
- "← Back" on Step 2 does not re-save Step 1 (already saved)

**Auto-save consideration:** Could add auto-save on blur/change for Step 1 fields (optional, would require debouncing API calls). Explicit save on step transition is simpler and safer.

**URL state:** Store current step in URL query param `?step=1` or `?step=2` so refresh preserves position.

**Edit mode:** When editing an existing project:
- Load existing `formConfig` into Step 1 form
- Load existing widget config into Step 2 form (first widget for the project, or allow selecting)
- If no widget exists, Step 2 is in create mode

---

### Information Architecture

**Principle:** Essential options visible, advanced options in accordions.

| Setting | Priority | Location |
|---------|----------|----------|
| Project name | Essential | Top of Step 1, always visible |
| Slug/URL | Essential | Step 1, always visible |
| Brand color | Essential | Step 1, always visible |
| Form header/description | Essential | Step 1, always visible |
| Field visibility toggles | Essential | Step 1, always visible |
| Logo upload | Secondary | Step 1, always visible |
| Thank you message | Secondary | Step 1, always visible |
| Field requirement toggles | Secondary | Step 1, inline with visibility |
| Submission behavior | Advanced | Step 1, collapsed accordion |
| Social links, tags | Advanced | Step 1, collapsed accordion |
| Layout | Essential | Step 2, always visible |
| Theme | Essential | Step 2, always visible |
| Accent color | Essential | Step 2, always visible |
| Show Rating/Avatar | Essential | Step 2, always visible |
| Max testimonials | Secondary | Step 2, always visible |
| Remove branding (Pro) | Secondary | Step 2, always visible |
| Auto-rotate | Advanced | Step 2, collapsed accordion |
| Custom CSS (Pro) | Advanced | Step 2, collapsed accordion |

---

### Mobile Strategy

**Small screens (< lg):**
- Step tabs stack vertically (full-width pill tabs)
- Settings panel is full width
- Preview panel is hidden by default; shown via "Preview →" floating button or tab
- Device size toggles only available on larger screens (hide on mobile)

**Preview toggle on mobile:**
```
[⚙️ Settings] [👁️ Preview]   ← toggle tabs on mobile
```

---

### Feature Gating Strategy

**Approach:** "Gentle Paywall" — same as current pattern.

| Feature | Free User | Pro User |
|---------|-----------|----------|
| Layouts: grid, list | Full access | Full access |
| Layouts: masonry/carousel/wall/marquee | Can select, `PremiumWarningBanner` shown | Full access |
| Accent color (preset swatches) | Full access | Full access |
| Accent color (custom hex) | `LockedToggle`, upgrade on click | Full access |
| Remove branding | `LockedToggle` | Full access |
| Custom CSS | `LockedToggle` | Full access |
| Widget limit (1 per project free) | Hard gate at create time | Unlimited |

**Upgrade prompts:**
- `LockedToggle`: click → toast with "Upgrade" action → `openUpgradeModal()`
- `PremiumWarningBanner`: shown below layout picker when Pro layout selected
- Hard gates (widget limit): show modal explaining limit, link to upgrade

---

### Technical Approach

**State management:**
- `react-hook-form` + `zod` for both steps (consistent with current codebase)
- `useWatch` to drive preview updates reactively
- 150ms debounce on preview updates (consistent with `WidgetBuilder`)
- Step state in URL query param (`?step=1`)

**Form handling:**
- Step 1: `projectFormSchema` (extended to include `formConfig` fields inline)
- Step 2: existing `widgetFormSchema`
- Separate `handleStep1Submit` and `handleStep2Submit` functions

**New components to create:**
1. `ProjectConfigEditor` — main container, step routing, header
2. `CollectionFormStep` — Step 1 settings panel
3. `WidgetConfigStep` — Step 2 settings panel (adapted from `WidgetBuilder`)
4. `CollectionFormPreview` — accurate read-only collection form preview
5. `CollectionFormBody` — extracted from `app/(standalone)/testimonials/[slug]/page.tsx`, reused in both preview and real form

**Files to modify:**
- `apps/web/app/(dashboard)/projects/new/page.tsx` — point to new editor
- `apps/web/app/(dashboard)/projects/[slug]/edit/page.tsx` — point to new editor
- `apps/web/app/(standalone)/testimonials/[slug]/page.tsx` — extract `CollectionFormBody`

**Files to retire (or repurpose):**
- `apps/web/components/project-wizard/project-wizard.tsx` — replaced by `ProjectConfigEditor`
- `apps/web/components/project-wizard/project-wizard-preview.tsx` — replaced by step-specific previews

**No database schema changes required.** All config fields already exist.

**No new API endpoints required.** Existing `PUT /api/projects/:slug` and `POST/PUT /api/widgets` are sufficient.

---

### Implementation Phases

**Phase 3A: Foundation**
1. Extract `CollectionFormBody` from the standalone page
2. Build `CollectionFormPreview` component using `CollectionFormBody`
3. Create `ProjectConfigEditor` shell with step routing and header

**Phase 3B: Step 1**
4. Build `CollectionFormStep` settings panel (consolidating wizard fields + formConfig)
5. Wire preview to form state with debounce
6. Connect Step 1 save to `PUT /api/projects/:slug`

**Phase 3C: Step 2**
7. Build `WidgetConfigStep` (adapted from `WidgetBuilder`/`WidgetForm`)
8. Wire `WidgetPreview` iframe (already exists, minimal work)
9. Connect Step 2 save to `POST/PUT /api/widgets`

**Phase 3D: Integration & Polish**
10. Update routes (`/projects/new`, `/projects/[slug]/edit`)
11. Mobile layout + preview toggle
12. Device size toggles
13. Feature gating throughout
14. Loading states, error states, success redirect

**Phase 3E: Testing**
15. Preview accuracy — collection form vs. hosted page
16. Preview accuracy — widget vs. embedded widget
17. Feature gating enforcement (UI + API)
18. Mobile responsiveness
19. Cross-browser testing
20. Accessibility (keyboard navigation, screen reader labels)

---

### Open Questions for Approval

1. **Existing widget on edit:** When editing a project that has multiple widgets, should Step 2 show the first widget? Or allow selecting which widget to edit?
2. **Social links & tags:** Should these be in the new editor (advanced accordion) or remain only on the old Edit page?
3. **Auto-moderation settings:** Keep in Settings tab (separate), or integrate into the new editor as "Advanced"?
4. **Step 1 save timing:** Save explicitly on "Next →" button click, or auto-save as user types?
5. **Collection Form Preview interactivity:** Read-only (recommended for simplicity) or allow test submission?
6. **Redirect after finish:** After Step 2 "Finish", redirect to project detail page Overview tab?
