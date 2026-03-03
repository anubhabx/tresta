# Web/UI Backend Infrastructure Map (Client-Scope Discovery)

Scope constrained to:
- `apps/web`
- `packages/ui`

Excluded from analysis:
- `.next` build artifacts
- `node_modules`
- backend implementation internals under `apps/api`

Date: 2026-03-04

---

## 1) Route, Page, Layout, and Runtime Surface (`apps/web/app`)

## A. Route pages (URL-bearing)

| Route | File | Component | Runtime role |
|---|---|---|---|
| `/` | `apps/web/app/page.tsx` | `Page` | Server route for landing page |
| `/sign-in` (+ catch-all) | `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | `page` | Server auth page |
| `/sign-up` (+ catch-all) | `apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | `page` | Server auth page |
| `/sso-callback` | `apps/web/app/(auth)/sso-callback/page.tsx` | `page` | Server callback page |
| `/dashboard` | `apps/web/app/(dashboard)/dashboard/page.tsx` | `DashboardPage` | Client dashboard shell |
| `/account` | `apps/web/app/(dashboard)/account/page.tsx` | `AccountPage` | Client account/settings |
| `/projects` | `apps/web/app/(dashboard)/projects/page.tsx` | `ProjectsPage` | Client project list |
| `/projects/new` | `apps/web/app/(dashboard)/projects/new/page.tsx` | `NewProjectPage` | Client project creation |
| `/projects/[slug]` | `apps/web/app/(dashboard)/projects/[slug]/page.tsx` | `ProjectPage` | Client project detail |
| `/projects/[slug]/edit` | `apps/web/app/(dashboard)/projects/[slug]/edit/page.tsx` | `ProjectEditPage` | Client project edit |
| `/projects/[slug]/moderation` | `apps/web/app/(dashboard)/projects/[slug]/moderation/page.tsx` | `ModerationPage` | Server moderation page |
| `/projects/[slug]/widgets/new` | `apps/web/app/(dashboard)/projects/[slug]/widgets/new/page.tsx` | `NewWidgetPage` | Client widget creation |
| `/projects/[slug]/widgets/[widgetId]/edit` | `apps/web/app/(dashboard)/projects/[slug]/widgets/[widgetId]/edit/page.tsx` | `EditWidgetPage` | Client widget edit |
| `/pricing` | `apps/web/app/(public)/pricing/page.tsx` | `PricingPage` | Server public page |
| `/contact-us` | `apps/web/app/(public)/contact-us/page.tsx` | `ContactUsPage` | Server public page |
| `/privacy/request` | `apps/web/app/(public)/privacy/request/page.tsx` | `PrivacyRequestPage` | Client privacy request flow |
| `/privacy-policy` | `apps/web/app/(public)/privacy-policy/page.tsx` | `PrivacyPolicyPage` | Server legal page |
| `/terms-and-conditions` | `apps/web/app/(public)/terms-and-conditions/page.tsx` | `TermsAndConditionsPage` | Server legal page |
| `/cancellations-and-refunds` | `apps/web/app/(public)/cancellations-and-refunds/page.tsx` | `CancellationsPage` | Server legal page |
| `/unauthorized` | `apps/web/app/(public)/unauthorized/page.tsx` | `UnauthorizedPage` | Server public page |
| `/forbidden` | `apps/web/app/(public)/forbidden/page.tsx` | `ForbiddenPage` | Server public page |
| `/privacy/manage` | `apps/web/app/(standalone)/privacy/manage/page.tsx` | `PrivacyManagePage` | Client token-based privacy portal |
| `/testimonials/[slug]` | `apps/web/app/(standalone)/testimonials/[slug]/page.tsx` | `TestimonialSubmissionPage` | Client public testimonial submission |

## B. Layouts

- `apps/web/app/layout.tsx` → `RootLayout`
- `apps/web/app/(auth)/layout.tsx` → `AuthLayout`
- `apps/web/app/(dashboard)/layout.tsx` → `DashboardLayout`
- `apps/web/app/(public)/layout.tsx` → `PublicLayout`
- `apps/web/app/(public)/contact-us/layout.tsx` → `ContactLayout`
- `apps/web/app/(standalone)/layout.tsx` → `StandaloneLayout`

## C. Error/loading/system routes

- Error boundaries: root/auth/dashboard/public/standalone/project-slug segments
- Loading states: root/auth/dashboard/public/standalone/project-slug segments
- `apps/web/app/not-found.tsx`
- Metadata routes: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `twitter-image.tsx`

---

## 2) Data Access Layers and Integration Paths

## A. Primary HTTP clients

1. Authenticated axios hook: `apps/web/hooks/use-api.ts`
   - `baseURL`: `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"`
   - `withCredentials: true`
   - Request interceptor injects `Authorization: Bearer <ClerkToken>` when absent

2. Public axios client: `apps/web/app/(standalone)/testimonials/[slug]/page.tsx`
   - no auth headers, no credentials

3. Direct `fetch` call sites
   - `apps/web/components/account-settings/api-section.tsx`
   - `apps/web/components/ably-provider.tsx`
   - `apps/web/hooks/use-azure-sas.ts`
   - `apps/web/hooks/use-sas-url.ts`

## B. Query/mutation modules

- `apps/web/lib/queries/projects.ts`
- `apps/web/lib/queries/testimonials.ts`
- `apps/web/lib/queries/widgets.ts`
- `apps/web/lib/queries/moderation.ts`
- `apps/web/lib/queries/privacy.ts`
- `apps/web/lib/queries/notifications.ts`

## C. No server actions in scanned scope

- No `"use server"` directives were found in source files under `apps/web`.

## D. Middleware and access control

File: `apps/web/middleware.ts`
- Uses `clerkMiddleware`
- Public matcher list + protected matcher list
- Redirects unauthenticated protected users to sign-in with `redirect_url`
- Redirects authenticated users away from auth routes to `/dashboard`

---

## 3) Backend Contract Matrix (Observed from Client Code)

Note: contracts below are client-inferred. Unknown fields are marked “not specified in client”.

| Method | Path | Call sites | Request args/body | Headers/auth | Response (client inferred) |
|---|---|---|---|---|---|
| GET | `/api/projects` | `lib/queries/projects.ts`, `components/account-settings/data-privacy-section.tsx`, `components/account-settings/api-section.tsx` | Query: `page`, `limit` (optional by callsite) | Bearer via `useApi` or manual bearer fetch | `PaginatedResponse<Project>` in query layer; some callsites treat as direct list |
| GET | `/api/projects/:slug` | `lib/queries/projects.ts` | Path: `slug:string` | Bearer | `ApiResponse<Project>` (unwrapped to `.data`) |
| POST | `/api/projects` | `lib/queries/projects.ts` | `CreateProjectPayload` | Bearer | `ApiResponse<Project>` |
| PUT | `/api/projects/:slug` | `lib/queries/projects.ts` | `UpdateProjectPayload` | Bearer | `ApiResponse<Project>` |
| DELETE | `/api/projects/:slug` | `lib/queries/projects.ts` | Path only | Bearer | Body not consumed |
| GET | `/api/projects/:slug/testimonials` | `lib/queries/testimonials.ts`, `components/account-settings/data-privacy-section.tsx` | Query: `page`, `limit` | Bearer | `PaginatedResponse<Testimonial>` |
| GET | `/api/projects/:slug/testimonials/:id` | `lib/queries/testimonials.ts` | Path: `slug`, `id` | Bearer | `ApiResponse<Testimonial>` |
| POST | `/api/projects/:slug/testimonials` | `lib/queries/testimonials.ts` | `CreateTestimonialPayload` | Bearer | `ApiResponse<Testimonial>` |
| PUT | `/api/projects/:slug/testimonials/:id` | `lib/queries/testimonials.ts` | `{ id, data: UpdateTestimonialPayload }` | Bearer | `ApiResponse<Testimonial>` |
| DELETE | `/api/projects/:slug/testimonials/:id` | `lib/queries/testimonials.ts` | Path: `id` | Bearer | Response not strongly used |
| GET | `/api/projects/:slug/testimonials/moderation/queue` | `lib/queries/moderation.ts` | Query: `status`, `verified`, `page`, `limit` | Bearer | `ModerationQueueResponse` |
| POST | `/api/projects/:slug/testimonials/moderation/bulk` | `lib/queries/moderation.ts` | `{ testimonialIds: string[]; action: "approve" | "reject" | "flag" }` | Bearer | Reads `response.data.data`, exact shape not specified |
| GET | `/api/widgets/project/:projectSlug` | `lib/queries/widgets.ts`, `components/account-settings/data-privacy-section.tsx` | Path: `projectSlug` | Bearer | `ApiResponse<Widget[]>` |
| GET | `/api/widgets/:widgetId/public` | `lib/queries/widgets.ts`, `components/widgets/widget-preview.tsx`, `lib/embed-code.ts` | Path: `widgetId` | In app query layer via `useApi`; embed docs suggest API key usage | `ApiResponse<PublicWidgetData>` |
| POST | `/api/widgets` | `lib/queries/widgets.ts` | `CreateWidgetPayload` | Bearer | `ApiResponse<Widget>` |
| PUT | `/api/widgets/:widgetId` | `lib/queries/widgets.ts` | `UpdateWidgetPayload` | Bearer | `ApiResponse<Widget>` |
| DELETE | `/api/widgets/:widgetId` | `lib/queries/widgets.ts` | Path: `widgetId` | Bearer | Response not strongly used |
| POST | `/api/privacy/access` | `lib/queries/privacy.ts`, `app/(public)/privacy/request/page.tsx` | `{ email: string }` | Usually no auth in public flow | Dynamic response; `debugLink` optionally read by UI |
| GET | `/api/privacy/data` | `lib/queries/privacy.ts` | Token supplied in `Authorization` header | `Authorization: Bearer <magicToken>` | `PrivacyDataResponse` (client-local interface) |
| DELETE | `/api/privacy/data` | `lib/queries/privacy.ts` | None | `Authorization: Bearer <magicToken>` | Shape not specified in client |
| GET | `/api/notifications` | `lib/queries/notifications.ts` | Query: optional `cursor` | Bearer | `NotificationListResponse` |
| GET | `/api/notifications/unread-count` | `lib/queries/notifications.ts` | None | Bearer | `UnreadCountResponse` |
| GET | `/api/notifications/preferences` | `lib/queries/notifications.ts` | None | Bearer | `PreferencesResponse` |
| PATCH | `/api/notifications/:notificationId` | `lib/queries/notifications.ts` | `{ isRead: true }` | Bearer | Shape not specified in client |
| POST | `/api/notifications/mark-all-read` | `lib/queries/notifications.ts` | None | Bearer | Shape not specified in client |
| PUT | `/api/notifications/preferences` | `lib/queries/notifications.ts` | `{ emailEnabled: boolean }` | Bearer | Shape not specified in client |
| POST | `/api/media/generate-upload-url` | `hooks/use-azure-sas.ts` | `{ filename, contentType, directory, fileSize }` | Bearer + JSON content-type | Expects `{ data: { uploadUrl, blobUrl, blobName, expiresAt } }` |
| POST | `/api/media/generate-read-url` | `hooks/use-sas-url.ts` | `{ blobName }` | Bearer + JSON content-type | Expects `{ data: { url } }` |
| GET | `/api/payments/subscription` | `hooks/use-subscription.ts` | None | Bearer | `ApiSuccessResponse<SubscriptionDetails>` (imported shared type) |
| POST | `/api/payments/subscription` | `components/billing/checkout-button.tsx` | `{ planId }` | Bearer | Expects `subscriptionId`, `key`, `planName` fields |
| POST | `/api/payments/verify` | `components/billing/checkout-button.tsx` | Razorpay verification payload | Bearer | Shape not specified in client |
| POST | `/api/payments/cancel` | `components/account-settings/billing-section.tsx` | None | Bearer | Shape not specified in client |
| GET | `/api/ably/token` | `components/ably-provider.tsx` | None | Bearer | Expects `data` token object for Ably auth callback |
| GET | `/api/account/api-keys` | `components/account-settings/api-section.tsx` | None | Manual bearer fetch | Expects `payload.data.keys` array |
| POST | `/api/account/api-keys` | `components/account-settings/api-section.tsx` | `{ name, projectSlug, environment:"live", permissions:{widgets:true,testimonials:true} }` | Manual bearer fetch + JSON | Expects `payload.data.key` |
| DELETE | `/api/account/api-keys/:keyId` | `components/account-settings/api-section.tsx` | Path: `keyId` | Manual bearer fetch | Body not consumed |
| GET | `/api/public/projects/:slug` | `app/(standalone)/testimonials/[slug]/page.tsx` | Path: `slug` | Public | `ApiResponse<Project>` |
| POST | `/api/public/projects/:slug/testimonials` | `app/(standalone)/testimonials/[slug]/page.tsx` | testimonial payload + optional `googleIdToken`; optional `x-anonymous-submission` header | Public + optional anon header | Success body not consumed; explicit 409 duplicate handling |
| GET (generated snippet) | `/api/public/embed/:widgetId?apiKey=...` | `lib/embed-code.ts` | URL params in generated snippet | API key in query in generated code | Not consumed in app runtime |

---

## 4) Request/Response Types and Validation Schemas

## A. Core API and payload types

Primary file: `apps/web/types/api.ts`
- `ApiResponse<T>`
- `PaginatedResponse<T>`
- Domain types: `Project`, `Testimonial`, `ModerationQueueResponse`, etc.
- Payloads: `CreateProjectPayload`, `UpdateProjectPayload`, `CreateTestimonialPayload`, `UpdateTestimonialPayload`, `CreateWidgetPayload`, `UpdateWidgetPayload`

## B. Query-local interfaces

- `apps/web/lib/queries/notifications.ts`
  - `NotificationListResponse`, `UnreadCountResponse`, `PreferencesResponse`
- `apps/web/lib/queries/privacy.ts`
  - `AccessRequestPayload`, `PrivacyDataResponse`
- `apps/web/components/account-settings/api-section.tsx`
  - `AccountApiKey`, `ProjectOption`
- `apps/web/lib/queries/widgets.ts`
  - `PublicWidgetData`

## C. Zod schemas found

- `apps/web/lib/schemas/project-schema.ts` → `projectFormSchema`
- `apps/web/lib/schemas/moderation-settings-schema.ts` → `moderationSettingsFormSchema`
- `apps/web/lib/schemas/form-config-schema.ts` → `formConfigSchema`
- `apps/web/components/collection-form/schema.ts` → `testimonialFormSchema`
- `apps/web/app/(public)/privacy/request/page.tsx` → `requestFormSchema`
- `apps/web/components/widgets/widget-form.tsx` → `widgetFormSchema`

## D. Types imported from outside scope

Several payload/response contracts are imported from `@workspace/types`.
Fields not visible within `apps/web` + `packages/ui` are treated as not specified in client.

---

## 5) Query/Mutation and Direct-Call Coverage Index

## Query modules
- Projects: list/detail/create/update/delete
- Testimonials: list/detail/create/update/delete
- Widgets: list/publicData/create/update/delete
- Moderation: queue + bulk action
- Privacy: access request + fetch personal data + anonymize
- Notifications: list/unread count/preferences + mark one/all read + update preferences

## Direct non-query API calls
- Billing checkout and verification
- Subscription cancel
- API key CRUD
- Privacy data export aggregation in account area
- Ably token retrieval
- SAS URL generation/read URL generation
- Public testimonial flow (project fetch + submission)

---

## 6) `packages/ui` Infrastructure Role

Inventory summary:
- 58 source files under `packages/ui/src`
- Pure presentation primitives and utility hooks
- No direct API client usage (`fetch`, `axios`) found
- No backend coupling detected in package source

Operational role:
- `packages/ui` acts as decoupled design-system/runtime component layer
- Data/backend contracts are consumed exclusively in `apps/web`

---

## 7) Noted Contract Inconsistencies and Risk Points

1. Public widget endpoint auth expectations are inconsistent:
   - Query path uses authenticated `useApi`
   - Embed docs/generator indicate API key-based access
2. `/api/projects` response shape assumptions differ by callsite (paginated object vs direct array reads)
3. Notification polling comment does not match implementation (`refetchInterval: false`)
4. Middleware public matcher uses `/testimonial(.*)` while actual route is `/testimonials/[slug]`
5. Environment base URL handling is fragmented (`useApi` fallback vs direct `fetch` with env-only paths)

---

## 8) Components, Hooks, and Feature Surface Map (Index)

## Hooks with backend coupling
- `apps/web/hooks/use-api.ts`
- `apps/web/hooks/use-subscription.ts`
- `apps/web/hooks/use-azure-sas.ts`
- `apps/web/hooks/use-sas-url.ts`
- `apps/web/hooks/use-testimonial-moderation.ts`
- `apps/web/hooks/use-projects.ts`

## High-impact components with direct backend coupling
- `apps/web/components/account-settings/api-section.tsx`
- `apps/web/components/account-settings/data-privacy-section.tsx`
- `apps/web/components/account-settings/billing-section.tsx`
- `apps/web/components/billing/checkout-button.tsx`
- `apps/web/components/ably-provider.tsx`
- `apps/web/components/widgets/widget-preview.tsx`
- `apps/web/components/widgets/embed-code-dialog.tsx`

## Exhaustive source inventories (scanned scope)

### `apps/web/app` files (47)

- `apps/web/app/(auth)/error.tsx`
- `apps/web/app/(auth)/layout.tsx`
- `apps/web/app/(auth)/loading.tsx`
- `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `apps/web/app/(auth)/sso-callback/page.tsx`
- `apps/web/app/(dashboard)/account/page.tsx`
- `apps/web/app/(dashboard)/dashboard/page.tsx`
- `apps/web/app/(dashboard)/error.tsx`
- `apps/web/app/(dashboard)/layout.tsx`
- `apps/web/app/(dashboard)/loading.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/edit/page.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/error.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/loading.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/moderation/page.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/page.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/widgets/[widgetId]/edit/page.tsx`
- `apps/web/app/(dashboard)/projects/[slug]/widgets/new/page.tsx`
- `apps/web/app/(dashboard)/projects/new/page.tsx`
- `apps/web/app/(dashboard)/projects/page.tsx`
- `apps/web/app/(public)/cancellations-and-refunds/page.tsx`
- `apps/web/app/(public)/contact-us/layout.tsx`
- `apps/web/app/(public)/contact-us/page.tsx`
- `apps/web/app/(public)/error.tsx`
- `apps/web/app/(public)/forbidden/page.tsx`
- `apps/web/app/(public)/layout.tsx`
- `apps/web/app/(public)/loading.tsx`
- `apps/web/app/(public)/pricing/page.tsx`
- `apps/web/app/(public)/privacy-policy/page.tsx`
- `apps/web/app/(public)/privacy/request/page.tsx`
- `apps/web/app/(public)/terms-and-conditions/page.tsx`
- `apps/web/app/(public)/unauthorized/page.tsx`
- `apps/web/app/(standalone)/error.tsx`
- `apps/web/app/(standalone)/layout.tsx`
- `apps/web/app/(standalone)/loading.tsx`
- `apps/web/app/(standalone)/privacy/manage/page.tsx`
- `apps/web/app/(standalone)/testimonials/[slug]/page.tsx`
- `apps/web/app/error.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/app/loading.tsx`
- `apps/web/app/manifest.ts`
- `apps/web/app/not-found.tsx`
- `apps/web/app/opengraph-image.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/robots.ts`
- `apps/web/app/sitemap.ts`
- `apps/web/app/twitter-image.tsx`

### `apps/web/hooks` files (9)

- `apps/web/hooks/use-api.ts`
- `apps/web/hooks/use-azure-sas.ts`
- `apps/web/hooks/use-debounce.ts`
- `apps/web/hooks/use-keyboard-shortcuts.ts`
- `apps/web/hooks/use-mobile.ts`
- `apps/web/hooks/use-projects.ts`
- `apps/web/hooks/use-sas-url.ts`
- `apps/web/hooks/use-subscription.ts`
- `apps/web/hooks/use-testimonial-moderation.ts`

### `apps/web/components` files (139)

- `apps/web/components/ably-provider.tsx`
- `apps/web/components/account-settings/account-settings-layout.tsx`
- `apps/web/components/account-settings/api-key-card.tsx`
- `apps/web/components/account-settings/api-section.tsx`
- `apps/web/components/account-settings/billing-section.tsx`
- `apps/web/components/account-settings/connected-accounts-section.tsx`
- `apps/web/components/account-settings/data-collection-info.tsx`
- `apps/web/components/account-settings/data-privacy-section.tsx`
- `apps/web/components/account-settings/general-settings-section.tsx`
- `apps/web/components/account-settings/index.ts`
- `apps/web/components/account-settings/password-section.tsx`
- `apps/web/components/account-settings/profile-image-section.tsx`
- `apps/web/components/account-settings/profile-information-section.tsx`
- `apps/web/components/account-settings/sidebar-nav.tsx`
- `apps/web/components/auth/oauth-buttons.tsx`
- `apps/web/components/azure-file-upload.tsx`
- `apps/web/components/billing/checkout-button.tsx`
- `apps/web/components/billing/pricing-table.tsx`
- `apps/web/components/billing/upgrade-modal.tsx`
- `apps/web/components/collection-form/collection-form-body.tsx`
- `apps/web/components/collection-form/index.ts`
- `apps/web/components/collection-form/schema.ts`
- `apps/web/components/color-picker.tsx`
- `apps/web/components/command-palette.tsx`
- `apps/web/components/conditional-color-picker.tsx`
- `apps/web/components/custom-form-field.tsx`
- `apps/web/components/dashboard-shell.tsx`
- `apps/web/components/dashboard/activity-feed.tsx`
- `apps/web/components/dashboard/dashboard-empty-state.tsx`
- `apps/web/components/dashboard/dashboard-stats.tsx`
- `apps/web/components/dashboard/getting-started-card.tsx`
- `apps/web/components/dashboard/index.ts`
- `apps/web/components/dashboard/keyboard-shortcuts-card.tsx`
- `apps/web/components/dashboard/pending-actions-card.tsx`
- `apps/web/components/dashboard/quick-actions-card.tsx`
- `apps/web/components/dashboard/quick-embed-card.tsx`
- `apps/web/components/dashboard/quick-insights-card.tsx`
- `apps/web/components/dashboard/recent-projects-list.tsx`
- `apps/web/components/dashboard/status-overview-card.tsx`
- `apps/web/components/empty-projects.tsx`
- `apps/web/components/forms/moderation/advanced-moderation-settings.tsx`
- `apps/web/components/forms/moderation/core-moderation-settings.tsx`
- `apps/web/components/forms/moderation/index.ts`
- `apps/web/components/google-oauth-provider.tsx`
- `apps/web/components/keyboard-shortcut-badge.tsx`
- `apps/web/components/keyboard-shortcuts-help.tsx`
- `apps/web/components/landing/canvas-reveal-effect.tsx`
- `apps/web/components/landing/card-spotlight.tsx`
- `apps/web/components/landing/dx-terminal.tsx`
- `apps/web/components/landing/feature-bento.tsx`
- `apps/web/components/landing/hero-section.tsx`
- `apps/web/components/landing/how-it-works.tsx`
- `apps/web/components/landing/pricing-footer.tsx`
- `apps/web/components/landing/site-header.tsx`
- `apps/web/components/legal-layout.tsx`
- `apps/web/components/loader.tsx`
- `apps/web/components/moderation/filter-presets.tsx`
- `apps/web/components/moderation/index.ts`
- `apps/web/components/moderation/moderation-stats-dashboard.tsx`
- `apps/web/components/moderation/moderation-testimonial-card.tsx`
- `apps/web/components/notification-settings.tsx`
- `apps/web/components/notifications/index.ts`
- `apps/web/components/notifications/notification-badge.tsx`
- `apps/web/components/notifications/notification-center.tsx`
- `apps/web/components/notifications/notification-empty-state.tsx`
- `apps/web/components/notifications/notification-item.tsx`
- `apps/web/components/notifications/notification-list.tsx`
- `apps/web/components/notifications/notification-sidebar-section.tsx`
- `apps/web/components/page-header.tsx`
- `apps/web/components/paywall/index.ts`
- `apps/web/components/paywall/PaywallComponents.tsx`
- `apps/web/components/project-config-editor/collection-form-preview.tsx`
- `apps/web/components/project-config-editor/collection-form-step.tsx`
- `apps/web/components/project-config-editor/index.ts`
- `apps/web/components/project-config-editor/project-config-editor.tsx`
- `apps/web/components/project-config-editor/widget-config-step.tsx`
- `apps/web/components/project-detail/embed-dialog.tsx`
- `apps/web/components/project-detail/form-config-settings.tsx`
- `apps/web/components/project-detail/index.ts`
- `apps/web/components/project-detail/moderation-settings-form.tsx`
- `apps/web/components/project-detail/project-api-keys-tab.tsx`
- `apps/web/components/project-detail/project-header.tsx`
- `apps/web/components/project-detail/project-overview-tab.tsx`
- `apps/web/components/project-detail/project-settings-tab.tsx`
- `apps/web/components/project-detail/project-stats-cards.tsx`
- `apps/web/components/project-detail/project-widgets-tab.tsx`
- `apps/web/components/project-wizard/components/index.ts`
- `apps/web/components/project-wizard/components/industry-preset-cards.tsx`
- `apps/web/components/project-wizard/index.ts`
- `apps/web/components/project-wizard/project-wizard-header.tsx`
- `apps/web/components/project-wizard/project-wizard-preview.tsx`
- `apps/web/components/project-wizard/project-wizard.tsx`
- `apps/web/components/project-wizard/sections/advanced-section.tsx`
- `apps/web/components/project-wizard/sections/branding-section.tsx`
- `apps/web/components/project-wizard/sections/identity-section.tsx`
- `apps/web/components/project-wizard/sections/index.ts`
- `apps/web/components/project-wizard/types.ts`
- `apps/web/components/providers.tsx`
- `apps/web/components/sas-image.tsx`
- `apps/web/components/sign-in-form.tsx`
- `apps/web/components/sign-up-form.tsx`
- `apps/web/components/site-footer.tsx`
- `apps/web/components/skeletons/account-skeleton.tsx`
- `apps/web/components/skeletons/dashboard-skeleton.tsx`
- `apps/web/components/skeletons/form-skeleton.tsx`
- `apps/web/components/skeletons/index.ts`
- `apps/web/components/skeletons/project-skeleton.tsx`
- `apps/web/components/skeletons/testimonial-skeleton.tsx`
- `apps/web/components/skeletons/widget-skeleton.tsx`
- `apps/web/components/testimonial-card.tsx`
- `apps/web/components/testimonial-list.tsx`
- `apps/web/components/testimonials/action-history-panel.tsx`
- `apps/web/components/testimonials/bulk-actions-bar.tsx`
- `apps/web/components/testimonials/collection-page-shell.tsx`
- `apps/web/components/testimonials/empty-states.tsx`
- `apps/web/components/testimonials/index.ts`
- `apps/web/components/testimonials/search-and-filters.tsx`
- `apps/web/components/testimonials/status-badge.tsx`
- `apps/web/components/testimonials/status-header.tsx`
- `apps/web/components/testimonials/testimonial-actions.tsx`
- `apps/web/components/theme-toggle.tsx`
- `apps/web/components/ui-breadcrumbs.tsx`
- `apps/web/components/ui-sidebar.tsx`
- `apps/web/components/ui/background-beams.tsx`
- `apps/web/components/ui/bento-grid.tsx`
- `apps/web/components/ui/dither.tsx`
- `apps/web/components/ui/empty-state.tsx`
- `apps/web/components/ui/grid-background.tsx`
- `apps/web/components/ui/hero-glow.tsx`
- `apps/web/components/ui/pagination.tsx`
- `apps/web/components/ui/spotlight-new.tsx`
- `apps/web/components/widgets/embed-code-dialog.tsx`
- `apps/web/components/widgets/index.ts`
- `apps/web/components/widgets/widget-builder.tsx`
- `apps/web/components/widgets/widget-card.tsx`
- `apps/web/components/widgets/widget-empty-state.tsx`
- `apps/web/components/widgets/widget-form-sections.tsx`
- `apps/web/components/widgets/widget-form.tsx`
- `apps/web/components/widgets/widget-preview.tsx`

### `packages/ui/src/components` files (56)

- `packages/ui/src/components/accordion.tsx`
- `packages/ui/src/components/alert-dialog.tsx`
- `packages/ui/src/components/alert.tsx`
- `packages/ui/src/components/aspect-ratio.tsx`
- `packages/ui/src/components/avatar.tsx`
- `packages/ui/src/components/background-beams.tsx`
- `packages/ui/src/components/badge.tsx`
- `packages/ui/src/components/breadcrumb.tsx`
- `packages/ui/src/components/button-group.tsx`
- `packages/ui/src/components/button.tsx`
- `packages/ui/src/components/calendar.tsx`
- `packages/ui/src/components/card.tsx`
- `packages/ui/src/components/carousel.tsx`
- `packages/ui/src/components/chart.tsx`
- `packages/ui/src/components/checkbox.tsx`
- `packages/ui/src/components/code-block.tsx`
- `packages/ui/src/components/collapsible.tsx`
- `packages/ui/src/components/command.tsx`
- `packages/ui/src/components/context-menu.tsx`
- `packages/ui/src/components/dialog.tsx`
- `packages/ui/src/components/drawer.tsx`
- `packages/ui/src/components/dropdown-menu.tsx`
- `packages/ui/src/components/empty.tsx`
- `packages/ui/src/components/field.tsx`
- `packages/ui/src/components/file-upload.tsx`
- `packages/ui/src/components/form.tsx`
- `packages/ui/src/components/hover-card.tsx`
- `packages/ui/src/components/input-group.tsx`
- `packages/ui/src/components/input-otp.tsx`
- `packages/ui/src/components/input.tsx`
- `packages/ui/src/components/item.tsx`
- `packages/ui/src/components/kbd.tsx`
- `packages/ui/src/components/label.tsx`
- `packages/ui/src/components/menubar.tsx`
- `packages/ui/src/components/navigation-menu.tsx`
- `packages/ui/src/components/pagination.tsx`
- `packages/ui/src/components/popover.tsx`
- `packages/ui/src/components/progress.tsx`
- `packages/ui/src/components/radio-group.tsx`
- `packages/ui/src/components/resizable.tsx`
- `packages/ui/src/components/scroll-area.tsx`
- `packages/ui/src/components/select.tsx`
- `packages/ui/src/components/separator.tsx`
- `packages/ui/src/components/sheet.tsx`
- `packages/ui/src/components/sidebar.tsx`
- `packages/ui/src/components/skeleton.tsx`
- `packages/ui/src/components/slider.tsx`
- `packages/ui/src/components/sonner.tsx`
- `packages/ui/src/components/spinner.tsx`
- `packages/ui/src/components/switch.tsx`
- `packages/ui/src/components/table.tsx`
- `packages/ui/src/components/tabs.tsx`
- `packages/ui/src/components/textarea.tsx`
- `packages/ui/src/components/toggle-group.tsx`
- `packages/ui/src/components/toggle.tsx`
- `packages/ui/src/components/tooltip.tsx`

---

## 9) Discovery Conclusion

From the client-only scope, the application backend surface is broad and mostly mediated by React Query abstractions. The critical infrastructure risks are not missing endpoints; they are consistency drift across API client usage, route matching, and contract interpretation. This document can be used as a reference baseline for subsequent backend and security audits.
