# MVP Launch Checklist

Status owner: product + engineering
Branch: `chore/mvp-launch-phases`
Last updated: 2026-03-08

This checklist is organized in phases so launch work can move from hard blockers to post-launch quality upgrades.

## Phase 0 — Housekeeping

- [x] Create a dedicated launch branch.
- [x] Remove generated terminal output artifact files from the workspace root.
- [x] Link this checklist from the main README after the content stabilizes.

---

## Phase 1 — Critical blockers before MVP launch

### Release gate blockers

- [x] Make API tests non-watch and CI-safe by using a one-shot `vitest run` script.
- [x] Verify API tests pass in one-shot mode.
- [x] Add missing `eslint` dependency to the UI package so the monorepo lint command can execute.
- [x] Run repo-wide lint again and fix all launch-critical failures.
- [x] Stabilize the widget test suite so it passes in CI.
- [x] Rebuild the quarantined widget accessibility assertions instead of keeping them skipped.
- [x] Add a single release validation command that runs lint, typecheck, tests, and builds.

### Widget test blockers to fix first

- [x] Fix stale import expectations and outdated component test coverage in the widget package.
- [x] Verify widget path alias resolution for [packages/widget/src/components/WidgetRoot.tsx](packages/widget/src/components/WidgetRoot.tsx#L17).
- [x] Replace the currently skipped widget accessibility checks with stable assertions against the active DOM structure.
- [x] Resolve known TODO-based tests still left in the widget package.
  - [x] [packages/widget/src/__tests__/storage-manager.test.ts](packages/widget/src/__tests__/storage-manager.test.ts#L300-L419)
  - [x] [packages/widget/src/core/__tests__/loader.test.ts](packages/widget/src/core/__tests__/loader.test.ts#L89-L192)

### Env and deployment blockers

- [x] Add missing `ENCRYPTION_KEY` to [apps/api/.env.example](apps/api/.env.example).
- [x] Add missing `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` to [apps/web/.env.example](apps/web/.env.example).
- [ ] Confirm staging and production env parity for Clerk, Razorpay, Redis, Ably, Resend, Azure Blob, and Postgres.
  - [x] Add a parity audit command in [package.json](package.json#L9-L17) and [scripts/check-env-parity.mjs](scripts/check-env-parity.mjs).
  - [x] Document the launch-critical env matrix in [ENV_PARITY_CHECKLIST.md](ENV_PARITY_CHECKLIST.md).
  - [ ] Run the parity audit against exported staging and production env files.
- [x] Fix Prisma runtime/build-time path behavior seen during sitemap generation in [apps/web/app/sitemap.ts](apps/web/app/sitemap.ts).

### Documentation blockers

- [x] Remove or restore broken documentation links in [README.md](README.md#L384-L397).
- [x] Replace the unsupported “97% complete” claim with checklist-driven readiness criteria in [README.md](README.md#L5-L10).

---

## Phase 2 — MVP stability and user-facing correctness

Current note:
- Repo lint now completes, but the web app still emits many non-blocking warnings that should be reduced before launch hardening.

### Core product journeys

- [ ] Verify auth flow: sign-up, sign-in, sign-out, session expiry, redirect behavior.
- [ ] Verify project lifecycle: create, edit, deactivate, delete, slug conflict handling.
- [ ] Verify testimonial submission flow for:
  - [ ] standard text submission
  - [ ] rating enabled/disabled
  - [ ] required optional fields
  - [ ] avatar upload
  - [ ] video URL submission
  - [ ] anonymous submission opt-out paths
  - [ ] Google verification required/optional/disabled
- [ ] Verify moderation flow: queue, filters, approve, reject, flag, bulk actions, pagination.
- [ ] Verify widget builder flow: create, edit, preview, publish, embed copy.
- [ ] Verify public widget consumption with a real API key and external site embed.
- [ ] Verify billing lifecycle: checkout, webhook processing, plan upgrades, downgrades, failed payments, cancellation.
- [ ] Verify privacy workflows: data export and deletion request lifecycle.

### Quality cleanup

- [ ] Reduce launch-relevant warnings from the web build.
- [ ] Remove obvious unused imports and dead code in dashboard and moderation surfaces.
- [ ] Replace unsafe `any` usage in moderation and project settings forms.
- [ ] Review hook dependency warnings on launch-critical components.

### Observability and ops

- [x] Replace high-value `console.*` usage in the API with the shared logger.
  - [x] Replace core Redis, queue, Google OAuth, and unknown API error logging with the shared logger.
  - [x] Replace notification, email, and outbox worker logging plus Clerk and Razorpay webhook logging with the shared logger.
  - [x] Replace cron job and rate-limit logging with the shared logger.
  - [x] Replace admin/auth/idempotency/audit middleware and high-value controller logging with the shared logger.
  - [x] Replace remaining service, utility, and config `console.*` usage with the shared logger.
  - [x] Replace remaining script `console.*` usage.
- [x] Add request correlation across API, workers, webhooks, and admin actions.
- [ ] Add error tracking for web and API.
- [ ] Add dashboards/alerts for webhook failures, queue backlog, payment failures, and degraded dependencies.

---

## Phase 3 — Security and operational readiness

- [ ] Patch vulnerable container base images in [Dockerfile](Dockerfile#L1-L21).
- [ ] Re-run rate-limit and abuse prevention verification on all public endpoints.
- [ ] Verify webhook signature enforcement for Clerk and Razorpay in staging.
- [ ] Review CORS, CSP, upload limits, and SAS URL expiry configuration.
- [ ] Confirm backup, restore, and rollback procedures.
- [ ] Write a production runbook for deploy, rollback, queue recovery, and webhook replay.

---

## Phase 4 — Post-launch iteration work

- [ ] Add CI workflows for lint, typecheck, test, and build.
- [ ] Add E2E coverage for major flows.
- [ ] Add product analytics around conversion funnel and moderation throughput.
- [ ] Expand admin health dashboards and SLO reporting.

---

## Test plan checklist — comprehensive unit and integration coverage

### Authentication and identity

- [ ] Unit test Clerk auth guards and helper utilities.
- [ ] Unit test Google OAuth verification success/failure branches.
- [ ] Integration test protected route access with valid, invalid, and expired auth.

### Projects

- [ ] Unit test project validation, slug normalization, and duplicate detection.
- [ ] Integration test create/update/delete project endpoints.
- [ ] Integration test project visibility and inactive project behavior.

### Testimonials

- [ ] Unit test testimonial validation rules.
  - [ ] content length boundaries
  - [ ] rating coercion and bounds
  - [ ] required field toggles from `formConfig`
  - [ ] anonymous submission restrictions
- [ ] Unit test moderation heuristics and scoring.
- [ ] Unit test duplicate-content detection and reviewer behavior analysis.
- [ ] Integration test testimonial submission endpoint for happy path and invalid payloads.
- [ ] Integration test testimonial list/detail/update/delete endpoints.
- [ ] Integration test moderation queue filtering and pagination.
- [ ] Integration test bulk moderation with mixed valid/invalid IDs.

### Widgets

- [ ] Unit test widget config normalization and defaults.
- [ ] Unit test widget rendering for each layout.
- [ ] Unit test CSS sanitization and CSP helpers.
- [ ] Integration test public widget API response parsing.
- [ ] Integration test embed bootstrapping, rate limiting, and error states.

### Billing and subscriptions

- [ ] Unit test payment signature verification and provider mapping.
- [ ] Unit test reconciliation logic and idempotency handling.
- [ ] Integration test payment webhooks for duplicate and out-of-order events.
- [ ] Integration test plan enforcement on gated features.

### Notifications, jobs, and workers

- [ ] Unit test notification eligibility and preference filtering.
- [ ] Unit test queue enqueue/idempotency behavior.
- [ ] Integration test worker processing for success, retry, and dead-letter scenarios.

### Privacy and compliance

- [ ] Unit test export formatting and deletion helpers.
- [ ] Integration test privacy request flows and authorization checks.

---

## API audit — testimonial response shape and edge cases

### Current findings

#### Owner testimonial list

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L669-L792)

Current strengths:
- [x] Returns paginated results.
- [x] Returns full testimonial objects with moderation and publish state.

Gaps to address:
- [ ] Add related project summary or explicitly document why it is omitted.
- [ ] Add derived flags useful to UI such as `needsReview` or `canAutoPublish` if the frontend repeatedly computes them.
- [ ] Ensure date fields are consistently serialized as ISO strings.
- [ ] Consider returning `meta.filters` or `meta.sort` for client traceability.

#### Owner testimonial detail

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L796-L829)

Current strengths:
- [x] Ownership check exists.
- [x] Returns the raw record.

Gaps to address:
- [ ] Include related project summary.
- [ ] Include moderation context if present, especially normalized `moderationFlags`.
- [ ] Decide whether internal-only fields such as encrypted IP metadata should remain omitted for UI safety.

#### Moderation queue

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L944-L1026)

Current strengths:
- [x] Supports pagination.
- [x] Supports status and verification filtering.
- [x] Computes moderation stats.

Gaps to address:
- [ ] Confirm `meta.stats` is actually returned in the serialized response path.
- [ ] Add explicit filter echo in response metadata.
- [ ] Add high-risk counts or review-priority buckets if used by the dashboard.

#### Public testimonials by API key

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L694-L793)

Current strengths:
- [x] Returns project summary.
- [x] Restricts to approved and published testimonials.
- [x] Excludes sensitive fields like email and IP data.

Potential gaps for embed consumers:
- [ ] Consider including `mediaUrl` in addition to `videoUrl` if rich media is part of MVP scope.
- [ ] Consider including `updatedAt` if cache invalidation or freshness matters.
- [ ] Consider including per-project branding hints if the widget should not require a second fetch.

### Edge cases to test explicitly

- [ ] Empty list for a valid project with zero testimonials.
- [ ] Project not found.
- [ ] Authenticated user without ownership.
- [ ] Invalid pagination values.
- [ ] Testimonials with `null` rating, avatar, role, company, and media fields.
- [ ] Testimonials with large `moderationFlags` arrays.
- [ ] Mixed text/video testimonial datasets.
- [ ] Inactive project or revoked API key on public fetch.
- [ ] Date serialization consistency across list, detail, moderation queue, and public API routes.
- [ ] Backward compatibility for frontend consumers expecting current `Testimonial` shape from [apps/web/types/api.ts](apps/web/types/api.ts#L104-L131).

### Recommended response-shape improvements

- [ ] Define one canonical testimonial response DTO shared across API and web types.
- [ ] Add explicit serializers instead of returning raw Prisma objects in owner endpoints.
- [ ] Separate public, owner, moderation, and admin testimonial DTOs.
- [ ] Add contract tests to lock response shape before launch.