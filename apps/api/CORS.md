# CORS Configuration Guide

## Overview

Tresta uses **route-specific CORS configurations** to balance security with the need for public widget embedding. This approach ensures that:

1. **Authenticated endpoints** (dashboard, management APIs) only accept requests from the trusted frontend
2. **Public widget endpoints** accept requests from any origin to enable embedding on external websites
3. **Security is maintained** through proper authentication and validation, not just CORS

---

## CORS Configurations

### 1. Restrictive CORS (Dashboard/Management)

**Used for:** Authenticated endpoints that require user login

**Configuration:**

```typescript
{
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

**Applied to:**

- `/api/projects/*` - Project management
- `/api/media/*` - Media uploads
- `/api/widgets/*` - Widget management (except public endpoint)

**Why:** These endpoints require authentication via Clerk tokens. Restricting CORS ensures only the dashboard can make authenticated requests.

---

### 2. Public CORS (Widget Embedding)

**Used for:** Public read-only endpoints that power widget embeds

**Configuration:**

```typescript
{
  origin: "*",
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  maxAge: 86400 // 24 hours for preflight cache
}
```

**Applied to:**

- `/api/public/*` - Public project/testimonial data
- `/api/widgets/:widgetId/public` - Widget data for embedding

**Why:** Widgets need to be embedded on ANY external website. Allowing `origin: "*"` is necessary for this use case.

**Security measures:**

- No credentials allowed (prevents CSRF attacks)
- Read-only (GET only)
- Business logic validates project is PUBLIC and ACTIVE
- Only APPROVED testimonials are returned
- Server-side caching reduces abuse

---

### 3. Webhook CORS

**Used for:** Webhook endpoints (e.g., Clerk user sync)

**Configuration:**

```typescript
{
  origin: [
    "https://clerk.com",
    "https://api.clerk.com",
    "https://clerk.dev",
    process.env.FRONTEND_URL
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "svix-id", "svix-timestamp", "svix-signature"],
  credentials: false
}
```

**Applied to:**

- `/api/webhook/*` - Webhook handlers

**Why:** Webhooks should only be triggered by trusted sources.

---

## Implementation

### Centralized Middleware

All CORS configurations are defined in `/apps/api/src/middleware/cors.middleware.ts`:

```typescript
export const restrictiveCors = cors({
  /* ... */
});
export const publicCors = cors({
  /* ... */
});
export const webhookCors = cors({
  /* ... */
});
```

### Usage in Routes

Import and apply per-route:

```typescript
import { restrictiveCors, publicCors } from "../middleware/cors.middleware.ts";

// Public endpoint
router.get("/:widgetId/public", publicCors, fetchPublicWidgetData);

// Protected endpoint
router.post("/", restrictiveCors, attachUser, createWidget);
```

---

## Security Considerations

### Why `origin: "*"` is Safe for Public Endpoints

1. **No credentials:** Public endpoints don't accept authentication tokens
2. **Read-only:** Only GET requests allowed
3. **Business logic validation:** Controllers validate project visibility and testimonial status
4. **Rate limiting:** (TODO) Add rate limiting for abuse prevention
5. **Caching:** Server-side caching reduces load from repeated requests

### What CORS Does NOT Protect

CORS is a **browser security feature**. It does NOT:

- Prevent server-to-server requests (can be bypassed with curl/Postman)
- Authenticate users (that's what Clerk tokens do)
- Validate data integrity (that's what Zod schemas do)

**Real security comes from:**

- Proper authentication (Clerk middleware)
- Authorization checks (ownership validation)
- Input validation (Zod schemas)
- Business logic (project visibility, testimonial approval)

---

## Testing CORS

### Test Public Widget Endpoint

```bash
# Should succeed from any origin
curl -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:8000/api/widgets/clxyz123/public

# Response should include:
# Access-Control-Allow-Origin: *
```

### Test Protected Endpoint

```bash
# Should only accept requests from FRONTEND_URL
curl -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  http://localhost:8000/api/widgets

# Response should NOT include Access-Control-Allow-Origin header
```

---

## Environment Variables

```env
FRONTEND_URL=http://localhost:3000  # Development
FRONTEND_URL=https://app.tresta.io  # Production
```

---

## Future Improvements

1. **Rate Limiting:** Add rate limiting to public endpoints (express-rate-limit)
2. **Origin Allowlist:** For webhooks, maintain a strict allowlist
3. **Monitoring:** Log CORS violations for security auditing
4. **CDN Caching:** Add CloudFlare/CDN caching for public endpoints
5. **Analytics:** Track widget impressions and prevent abuse

---

## Related Files

- `/apps/api/src/middleware/cors.middleware.ts` - CORS configurations
- `/apps/api/src/index.ts` - Route-level CORS application
- `/apps/api/src/routes/widget.route.ts` - Widget-specific CORS
- `/apps/api/src/controllers/widget.controller.ts` - Business logic validation

---

## Summary

| Endpoint Type        | CORS Policy                 | Credentials | Methods   | Use Case                 |
| -------------------- | --------------------------- | ----------- | --------- | ------------------------ |
| Dashboard/Management | Restrictive (frontend only) | ✅ Yes      | All       | Authenticated operations |
| Public Widgets       | Open (any origin)           | ❌ No       | GET only  | Widget embedding         |
| Webhooks             | Allowlist                   | ❌ No       | POST only | External integrations    |

**Key Principle:** CORS is about controlling browser access, not API security. Real security comes from authentication, authorization, and validation.
