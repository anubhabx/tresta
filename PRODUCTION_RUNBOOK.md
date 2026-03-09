# Production Runbook

Last updated: 2026-03-09
Owners: engineering + ops

## 1) Deploy procedure

### Preconditions
- `pnpm validate:release` passes.
- Staging + production env parity is green (`pnpm env:parity ...`).
- `API_URL`, `FRONTEND_URL`, `ADMIN_URL`, `CORS_ALLOWED_ORIGINS` are set for target environment.

### Deploy (containerized)
1. Build and push image from the release commit.
2. Roll out API and worker processes together.
3. Verify health endpoint:
   - `GET /health` returns `200 OK`.
4. Verify baseline signals:
   - Error tracking ingesting events.
   - Queue backlogs within normal range.
   - Webhook failure alert count stable.

### Post-deploy smoke checks
- Public endpoint: `GET /api/public/projects/:slug`.
- Dashboard authenticated read endpoint.
- Payment webhook endpoint receives signed events.

## 2) Rollback procedure

### Fast rollback
1. Roll back to previous known-good image tag.
2. Restart API + worker with previous image in lockstep.
3. Re-run smoke checks.

### Data-safe rollback guardrails
- Do not run destructive schema changes without verified rollback SQL.
- If a migration was already applied, restore from snapshot only when forward-fix is not viable.

## 3) Backup and restore procedures

### Postgres backup
- Logical backup:
  - `pg_dump --format=custom --file=tresta-$(date +%Y%m%d-%H%M%S).dump "$DATABASE_URL"`
- Verify backup artifact is readable:
  - `pg_restore --list tresta-<timestamp>.dump`

### Postgres restore (staging restore test first)
1. Provision a restore target database.
2. Restore:
   - `pg_restore --clean --if-exists --no-owner --dbname "$RESTORE_DATABASE_URL" tresta-<timestamp>.dump`
3. Run app-level sanity checks (auth, projects, testimonials, billing).

### Roll-forward preference
- Prefer roll-forward fixes over production restores unless corruption/loss is confirmed.

## 4) Queue recovery

Queues in use:
- `notifications`
- `send-email`
- `outbox-processor`

### Recovery steps
1. Check queue telemetry and failed counts.
2. Pause traffic-producing jobs if failure is systemic.
3. Drain/retry failed jobs in controlled batches.
4. Resume workers and confirm backlog burn-down.

## 5) Webhook replay

### Clerk
- Re-send failed event from Clerk dashboard to `/api/webhook/clerk`.
- Confirm `400` for invalid signatures and `200` for valid signed replay.

### Razorpay
- Re-send failed event from Razorpay dashboard to `/api/webhook/razorpay`.
- Confirm event row transitions in `paymentWebhookEvent` table:
  - `status` from `failed` -> `processed` (or `ignored` for unsupported events).

### Replay safety
- Idempotency and provider event IDs prevent duplicate processing.

## 6) Phase 3 security configuration review (implemented)

### Rate-limit and abuse prevention
- Public routes are rate-limited in `apps/api/src/routes/public.route.ts`.
- Public API-key testimonials route now also applies `publicRateLimitMiddleware`.
- Webhook routes now apply IP limiter in `apps/api/src/routes/webhook.route.ts`.

### Webhook signature enforcement
- Clerk webhook uses `verifyWebhook` with `CLERK_WEBHOOK_SIGNING_SECRET`.
- Razorpay webhook validates `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET`.
- Security tests added in `apps/api/tests/webhooks.security.test.ts`.

### CORS and CSP
- API CSP is enforced via `helmet` in `apps/api/src/index.ts`.
- Dynamic CORS policy is enforced in `apps/api/src/middleware/cors.middleware.ts`.

### Upload limits and SAS expiry
- MIME/type + file-size directory policies enforced in `apps/api/src/services/blob-storage.service.ts`.
- SAS expiry bounds are clamped:
  - Upload URLs: 1-30 minutes.
  - Read URLs: 1-240 minutes.

## 7) Staging webhook verification playbook

Because some local env snapshots may use placeholder/localhost `API_URL`, run this from a staging-connected shell:

1. Confirm vars are non-empty in staging:
   - `CLERK_WEBHOOK_SIGNING_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
2. Negative probes (must return `400`):
   - Clerk: send invalid `svix-signature` to `/api/webhook/clerk`.
   - Razorpay: send invalid `x-razorpay-signature` to `/api/webhook/razorpay`.
3. Positive replay (must return `200`) from provider dashboards.
4. Capture evidence in release notes with timestamp and request IDs.

## 8) CI deploy-gate configuration

GitHub workflow: `.github/workflows/ci-and-deploy.yml`

### What is gated
- Lint, typecheck, tests, and monorepo build must pass.
- Additional explicit build checks run for:
   - `web`
   - `admin`
- Deploy trigger jobs run only after all checks pass.

### Optional secrets for deployment hooks
- `DIGITALOCEAN_APP_DEPLOY_HOOK_URL`
- `VERCEL_DEPLOY_HOOK_WEB`
- `VERCEL_DEPLOY_HOOK_ADMIN`

If a hook secret is missing, the job logs a skip message and does not fail CI.

### Important Vercel note
This workflow can gate deploy-hook based deployments. If Vercel Git auto-deploy is enabled, disable it (or use ignored build settings) to ensure this CI gate is the single deploy path.
