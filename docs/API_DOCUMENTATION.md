# API Documentation

## Base URL

```
Development: http://localhost:8000
Production: https://api.tresta.app (planned)
```

## Authentication

All authenticated endpoints require a Bearer token from Clerk:

```http
Authorization: Bearer <clerk_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## API Endpoints

### Projects

#### List Projects
```http
GET /api/projects?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get Project
```http
GET /api/projects/:slug
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My SaaS App",
  "slug": "my-saas-app",
  "description": "Customer testimonials",
  "type": "SAAS_APP",
  "brandColor": "#3b82f6",
  "autoApprove": false,
  "autoApproveVerified": true
}
```

#### Update Project
```http
PUT /api/projects/:slug
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "autoApprove": true
}
```

#### Delete Project
```http
DELETE /api/projects/:slug
Authorization: Bearer <token>
```

### Testimonials

#### List Testimonials
```http
GET /api/projects/:slug/testimonials?status=APPROVED&verified=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: PENDING | APPROVED | REJECTED | FLAGGED
- `verified`: true | false
- `page`: number
- `limit`: number

#### Submit Testimonial (Public)
```http
POST /api/projects/:slug/testimonials
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "rating": 5,
  "content": "Great product!",
  "avatarUrl": "https://...",
  "isOAuthVerified": true,
  "oauthProvider": "google",
  "oauthSubject": "google_user_id"
}
```

#### Update Testimonial Status
```http
PATCH /api/testimonials/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPublished": true,
  "moderationStatus": "APPROVED"
}
```

#### Bulk Update Testimonials
```http
POST /api/testimonials/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "testimonialIds": ["id1", "id2", "id3"],
  "action": "approve" | "reject" | "flag"
}
```

#### Delete Testimonial
```http
DELETE /api/testimonials/:id
Authorization: Bearer <token>
```

### Widgets

#### List Widgets
```http
GET /api/projects/:slug/widgets
Authorization: Bearer <token>
```

#### Get Widget (Public)
```http
GET /api/widgets/:widgetId/public
Cache-Control: public, max-age=300, s-maxage=300
```

**Response:**
```json
{
  "success": true,
  "data": {
    "widget": {
      "id": "...",
      "name": "Homepage Carousel",
      "type": "carousel",
      "config": { ... }
    },
    "testimonials": [...]
  }
}
```

#### Create Widget
```http
POST /api/widgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "...",
  "name": "Homepage Carousel",
  "type": "carousel",
  "config": {
    "theme": "light",
    "autoRotate": true,
    "showRating": true,
    "showDate": true
  }
}
```

#### Update Widget
```http
PUT /api/widgets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "config": { ... }
}
```

#### Delete Widget
```http
DELETE /api/widgets/:id
Authorization: Bearer <token>
```

### Notifications

#### List Notifications
```http
GET /api/notifications?cursor={createdAt}_{id}&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "nextCursor": "2025-11-11T10:30:00.000Z_clxyz123",
    "hasMore": true
  }
}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /api/notifications/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isRead": true
}
```

#### Mark All as Read
```http
POST /api/notifications/mark-all-read
Authorization: Bearer <token>
```

#### Get Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

#### Update Preferences
```http
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailEnabled": false
}
```

### Ably Token

#### Get Ably Token
```http
GET /api/ably/token
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "..."
  }
}
```

### Admin Endpoints

#### Health Check (Liveness)
```http
GET /healthz
```

#### Readiness Check
```http
GET /readyz
```

**Response:**
```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "queue": "ok"
  }
}
```

#### Get Metrics
```http
GET /admin/metrics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailQuota": {
      "today": 47,
      "limit": 200,
      "percentage": 23.5
    },
    "ablyConnections": 12,
    "metrics": {
      "notificationsSent": 1234,
      "emailsSent": 567,
      "emailsDeferred": 23,
      "emailsFailed": 2
    },
    "emailUsageHistory": [...]
  }
}
```

#### List Dead Letter Queue
```http
GET /admin/dlq?queue=send-email&errorType=transient&limit=50
Authorization: Bearer <admin_token>
```

#### Requeue Failed Job
```http
POST /admin/dlq/:id/requeue
Authorization: Bearer <admin_token>
```

#### Get DLQ Stats
```http
GET /admin/dlq/stats
Authorization: Bearer <admin_token>
```

## Rate Limiting

### API Rate Limits
- **Authenticated endpoints:** 100 requests/minute per user
- **Public endpoints:** 10 requests/minute per IP

### Email Rate Limits
- **Per user:** 10 emails/hour
- **Global:** 200 emails/day (free tier)

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Webhooks

### Clerk User Sync
```http
POST /api/webhooks/clerk
Svix-Id: msg_...
Svix-Timestamp: 1234567890
Svix-Signature: v1,signature...
```

**Events:**
- `user.created`
- `user.updated`
- `user.deleted`

