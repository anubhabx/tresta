# Environment Parity Checklist

Use this checklist to verify that staging and production are configured with the same launch-critical integrations before release.

## Required service matrix

| Service | Variables to confirm |
| --- | --- |
| Clerk | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Redis | `REDIS_URL` |
| Ably | `ABLY_API_KEY`, `NEXT_PUBLIC_ENABLE_REAL_NOTIFICATIONS` |
| Resend | `RESEND_API_KEY`, `ENABLE_REAL_EMAILS`, `EMAIL_FROM` |
| Azure Blob | `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_STORAGE_CONTAINER_NAME`, `CORS_ALLOWED_ORIGINS` |
| Postgres | `DATABASE_URL` |
| Base URLs | `APP_URL`, `API_URL`, `FRONTEND_URL`, `ADMIN_URL`, `NEXT_PUBLIC_API_URL` |

## Suggested verification flow

1. Export the effective staging variables to a local file such as `staging.env`.
2. Export the effective production variables to a local file such as `production.env`.
3. Run the parity audit:

   `pnpm env:parity staging.env production.env`

4. Confirm the following manually after the audit passes:
   - Clerk webhook endpoint and signing secret match the deployed API base URL.
   - Razorpay webhook endpoint targets the correct environment.
   - Redis, Ably, Resend, Azure Blob, and Postgres point to the intended environment-specific resources.
   - `NEXT_PUBLIC_ENABLE_REAL_NOTIFICATIONS` only flips to `true` when Ably is configured and validated.

## Launch sign-off

- [ ] Staging audit passed
- [ ] Production audit passed
- [ ] Clerk webhook verified
- [ ] Razorpay webhook verified
- [ ] Redis / Ably / Resend connectivity checked
- [ ] Azure Blob uploads checked
- [ ] Postgres connectivity checked