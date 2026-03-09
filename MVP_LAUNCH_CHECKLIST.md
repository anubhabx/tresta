# MVP Launch Checklist

Status owner: product + engineering
Branch: `chore/mvp-launch-phases`
Last updated: 2026-03-09

This checklist is organized in phases so launch work can move from hard blockers to post-launch quality upgrades.

## Phase 0 — Housekeeping

- [x] Create a dedicated launch branch.
- [x] Remove generated terminal output artifact files from the workspace root.
- [x] Link this checklist from the main README after the content stabilizes.

---

## Phase 1 — Critical blockers before MVP launch

Phase status: ✅ Complete (all launch blockers in this phase are now closed)

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
- [x] Confirm staging and production env parity for Clerk, Razorpay, Redis, Ably, Resend, Azure Blob, and Postgres.
  - [x] Add a parity audit command in [package.json](package.json#L9-L17) and [scripts/check-env-parity.mjs](scripts/check-env-parity.mjs).
  - [x] Document the launch-critical env matrix in [ENV_PARITY_CHECKLIST.md](ENV_PARITY_CHECKLIST.md).
  - [x] Run the parity audit against exported staging and production env files.
    - Result (2026-03-09): `pnpm env:parity .secrets/.env.staging.combined .secrets/.env.production.combined` failed on missing `CORS_ALLOWED_ORIGINS` and `API_URL` in both snapshots.
  - [x] Critical follow-up: export sanitized staging/prod env snapshots into the repo workspace (or provide paths) so `pnpm env:parity <staging.env> <production.env>` can be executed in CI and locally.
  - [x] Add `CORS_ALLOWED_ORIGINS` and `API_URL` to both staging and production env snapshots, then rerun parity audit.
    - Result (2026-03-09): `pnpm env:parity .secrets/.env.staging.combined .secrets/.env.production.combined` now passes.
- [x] Fix Prisma runtime/build-time path behavior seen during sitemap generation in [apps/web/app/sitemap.ts](apps/web/app/sitemap.ts).

### Documentation blockers

- [x] Remove or restore broken documentation links in [README.md](README.md#L384-L397).
- [x] Replace the unsupported “97% complete” claim with checklist-driven readiness criteria in [README.md](README.md#L5-L10).

---

## Phase 2 — MVP stability and user-facing correctness

Current note:
- Repo lint completes.
- Latest status: `pnpm --filter web run lint` now reports zero warnings/errors.

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
  - [ ] Depends on staging credentials + env parity evidence for Razorpay/Clerk/Redis/Postgres before end-to-end verification is reliable.
- [ ] Verify privacy workflows: data export and deletion request lifecycle.

### Quality cleanup

- [x] Reduce launch-relevant warnings from the web build.
  - [x] Remove broad unused-import / dead-code warnings across account settings, project detail, project wizard, and widget embed surfaces.
  - [x] Remove low-risk `any` and no-useless-catch warnings in wizard/widget flows where behavior is unchanged.
- [x] Remove obvious unused imports and dead code in dashboard and moderation surfaces.
  - [x] Remove dead/unused code in moderation and dashboard cards (`activity-feed`, `pending-actions-card`, `moderation-stats-dashboard`, `moderation-testimonial-card`).
  - [x] Remove additional dashboard dead imports (`projects page`, `quick-embed`, `keyboard-shortcuts`, `recent-projects`, `theme-toggle`, `command-palette`, `landing page`).
- [x] Replace unsafe `any` usage in moderation and project settings forms.
  - [x] Remove explicit `any` usage from moderation and project settings form components and switch form `watch` props to typed `UseFormWatch`.
- [x] Review hook dependency warnings on launch-critical components.
  - [x] Fix route-change `useEffect` dependency list in dashboard sidebar (`ui-sidebar`).

### Observability and ops

- [x] Replace high-value `console.*` usage in the API with the shared logger.
  - [x] Replace core Redis, queue, Google OAuth, and unknown API error logging with the shared logger.
  - [x] Replace notification, email, and outbox worker logging plus Clerk and Razorpay webhook logging with the shared logger.
  - [x] Replace cron job and rate-limit logging with the shared logger.
  - [x] Replace admin/auth/idempotency/audit middleware and high-value controller logging with the shared logger.
  - [x] Replace remaining service, utility, and config `console.*` usage with the shared logger.
  - [x] Replace remaining script `console.*` usage.
- [x] Add request correlation across API, workers, webhooks, and admin actions.
- [x] Add error tracking for web and API.
- [x] Add dashboards/alerts for webhook failures, queue backlog, payment failures, and degraded dependencies.

---

## Phase 3 — Security and operational readiness

Phase status: ✅ Complete

- [x] Patch vulnerable container base images in [Dockerfile](Dockerfile#L1-L21).
- [x] Re-run rate-limit and abuse prevention verification on all public endpoints.
- [x] Verify webhook signature enforcement for Clerk and Razorpay in staging.
  - [x] Depends on parity-complete staging env and webhook secrets.
  - [x] Live probe evidence (2026-03-09) against `https://pleasing-central-cow.ngrok-free.app`:
    - Clerk invalid signature (`svix-signature`) → `400`
    - Razorpay invalid signature (`x-razorpay-signature`) → `400`
    - Razorpay valid signature (HMAC with staging `RAZORPAY_WEBHOOK_SECRET`) → `200`
- [x] Review CORS, CSP, upload limits, and SAS URL expiry configuration.
- [x] Confirm backup, restore, and rollback procedures.
- [x] Write a production runbook for deploy, rollback, queue recovery, and webhook replay.

---

## Phase 4 — Post-launch iteration work

- [x] Add CI workflows for lint, typecheck, test, and build.
- [ ] Add E2E coverage for major flows.
- [ ] Add product analytics around conversion funnel and moderation throughput.
- [ ] Expand admin health dashboards and SLO reporting.

---

## Test plan checklist — comprehensive unit and integration coverage

### Authentication and identity

- [x] Unit test Clerk auth guards and helper utilities.
- [x] Unit test Google OAuth verification success/failure branches.
- [x] Integration test protected route access with valid, invalid, and expired auth.

### Projects

- [x] Unit test project validation, slug normalization, and duplicate detection.
- [x] Integration test create/update/delete project endpoints.
- [x] Integration test project visibility and inactive project behavior.

### Testimonials

- [x] Unit test testimonial validation rules.
  - [x] content length boundaries
  - [x] rating coercion and bounds
  - [x] required field toggles from `formConfig`
  - [x] anonymous submission restrictions
- [x] Unit test moderation heuristics and scoring.
- [x] Unit test duplicate-content detection and reviewer behavior analysis.
- [x] Integration test testimonial submission endpoint for happy path and invalid payloads.
- [x] Integration test testimonial list/detail/update/delete endpoints.
- [x] Integration test moderation queue filtering and pagination.
- [x] Integration test bulk moderation with mixed valid/invalid IDs.
- [x] Add API contract tests for owner list, moderation queue metadata, and public testimonial response fields.
- [x] Add controller-level lifecycle coverage for owner list empty state, detail ownership checks, update publish-guard, delete flow, moderation filters, and bulk approve path.

### Widgets

- [x] Unit test widget config normalization and defaults.
- [x] Unit test widget rendering for each layout.
- [x] Unit test CSS sanitization and CSP helpers.
- [x] Integration test public widget API response parsing.
- [x] Integration test embed bootstrapping, rate limiting, and error states.

### Billing and subscriptions

- [x] Unit test payment signature verification and provider mapping.
- [x] Unit test reconciliation logic and idempotency handling.
- [x] Integration test payment webhooks for duplicate and out-of-order events.
- [x] Integration test plan enforcement on gated features.

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
- [x] Add related project summary or explicitly document why it is omitted.
- [x] Add derived flags useful to UI such as `needsReview` or `canAutoPublish` if the frontend repeatedly computes them.
- [x] Ensure date fields are consistently serialized as ISO strings.
- [x] Consider returning `meta.filters` or `meta.sort` for client traceability.

#### Owner testimonial detail

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L796-L829)

Current strengths:
- [x] Ownership check exists.
- [x] Returns the raw record.

Gaps to address:
- [x] Include related project summary.
- [x] Include moderation context if present, especially normalized `moderationFlags`.
- [x] Decide whether internal-only fields such as encrypted IP metadata should remain omitted for UI safety.

#### Moderation queue

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L944-L1026)

Current strengths:
- [x] Supports pagination.
- [x] Supports status and verification filtering.
- [x] Computes moderation stats.

Gaps to address:
- [x] Confirm `meta.stats` is actually returned in the serialized response path.
- [x] Add explicit filter echo in response metadata.
- [x] Add high-risk counts or review-priority buckets if used by the dashboard.

#### Public testimonials by API key

Source: [apps/api/src/controllers/testimonial.controller.ts](apps/api/src/controllers/testimonial.controller.ts#L694-L793)

Current strengths:
- [x] Returns project summary.
- [x] Restricts to approved and published testimonials.
- [x] Excludes sensitive fields like email and IP data.

Potential gaps for embed consumers:
- [x] Consider including `mediaUrl` in addition to `videoUrl` if rich media is part of MVP scope.
- [x] Consider including `updatedAt` if cache invalidation or freshness matters.
- [ ] Consider including per-project branding hints if the widget should not require a second fetch.

### Edge cases to test explicitly

- [x] Empty list for a valid project with zero testimonials.
- [x] Project not found.
- [x] Authenticated user without ownership.
- [x] Invalid pagination values.
- [ ] Testimonials with `null` rating, avatar, role, company, and media fields.
- [ ] Testimonials with large `moderationFlags` arrays.
- [ ] Mixed text/video testimonial datasets.
- [x] Inactive project or revoked API key on public fetch.
- [ ] Date serialization consistency across list, detail, moderation queue, and public API routes.
- [ ] Backward compatibility for frontend consumers expecting current `Testimonial` shape from [apps/web/types/api.ts](apps/web/types/api.ts#L104-L131).

### Recommended response-shape improvements

- [ ] Define one canonical testimonial response DTO shared across API and web types.
- [x] Add explicit serializers instead of returning raw Prisma objects in owner endpoints.
- [ ] Separate public, owner, moderation, and admin testimonial DTOs.
- [x] Add contract tests to lock response shape before launch.