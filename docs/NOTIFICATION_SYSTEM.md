# Notification System - Complete Technical Documentation

## Overview

The notification system is a comprehensive, production-ready solution for real-time and email notifications with free-tier optimizations. It handles 200 emails/day efficiently through batching, quota management, and intelligent routing.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Notification │  │  Notification │  │   Toast      │     │
│  │    Center    │  │    Badge      │  │  Messages    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │  Ably Client    │                       │
│                   │  (Real-time)    │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Routes    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐      ┌──────▼──────┐    ┌──────▼──────┐
    │  Ably   │      │   BullMQ    │    │  Postgres   │
    │ Service │      │   Queue     │    │  (Prisma)   │
    └─────────┘      └──────┬──────┘    └─────────────┘
                            │
                     ┌──────▼──────┐
                     │   Resend    │
                     │   Service   │
                     └─────────────┘
```

## Core Features

### 1. Real-Time Notifications (Ably)

**Implementation:**
- User-specific channels: `notifications:{userId}`
- Token-based authentication
- Auto-disconnect after 30 minutes of inactivity
- Auto-reconnect on user activity
- Polling fallback when disconnected

**Frontend Integration:**
```typescript
// apps/web/components/ably-provider.tsx
const ablyClient = new Realtime({
  authCallback: async (tokenParams, callback) => {
    const response = await fetch('/api/ably/token', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    callback(null, data.token);
  },
});

const channel = ablyClient.channels.get(`notifications:${userId}`);
channel.subscribe('new-notification', (message) => {
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  toast.info(message.data.title);
});
```

### 2. Email Notifications

**Types:**
- **Critical emails:** Immediate (bypass quota)
  - TESTIMONIAL_FLAGGED
  - SECURITY_ALERT
- **Non-critical emails:** Daily digest at 9 AM UTC
  - NEW_TESTIMONIAL
  - TESTIMONIAL_APPROVED
  - TESTIMONIAL_REJECTED

**Email Templates:**
- HTML template with Tresta branding
- Plain text version for accessibility
- Digest template for batched notifications
- List-Unsubscribe header for compliance

### 3. Quota Management

**Free Tier Limits:**
- 200 emails/day (Resend free tier)
- Atomic check-and-increment using Lua script
- TTL expires at midnight UTC
- High priority emails bypass quota

**Lua Script (Atomic):**
```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local priority = ARGV[2]
local ttl = tonumber(ARGV[3])

local current = tonumber(redis.call('GET', key) or '0')
local isNewKey = (current == 0)

-- High priority bypasses quota
if priority == 'high' then
  local newCount = redis.call('INCR', key)
  if isNewKey then
    redis.call('EXPIRE', key, ttl)
  end
  return {1, newCount}
end

-- Normal priority respects quota
if current >= limit then
  return {0, current}
end

local newCount = redis.call('INCR', key)
if isNewKey then
  redis.call('EXPIRE', key, ttl)
end

return {1, newCount}
```

### 4. Queue System (BullMQ)

**Workers:**
1. **Outbox Worker** - Ensures reliable job enqueuing
2. **Notification Worker** - Sends via Ably + queues emails
3. **Email Worker** - Sends emails with quota management

**Transactional Outbox Pattern:**
```typescript
// Create notification + outbox entry atomically
const result = await prisma.$transaction(async (tx) => {
  const notification = await tx.notification.create({ data });
  await tx.notificationOutbox.create({
    data: {
      notificationId: notification.id,
      jobType: 'send-notification',
      payload: { ... },
      status: 'pending',
    },
  });
  return notification;
});
```

### 5. Cron Jobs

**Daily Digest Job (9 AM UTC):**
- Distributed lock prevents concurrent runs
- Checks quota lock before processing
- Fetches users with emailEnabled=true
- Batches non-critical notifications from last 24 hours
- Skips users with no notifications
- Atomic quota check-and-increment
- Sets quota lock when exhausted

**Reconciliation Job (11:59 PM UTC):**
- Snapshots Redis quota to Postgres
- Creates historical audit trail
- Provides recovery data if Redis fails

### 6. Quota Alerts (Slack)

**Thresholds:**
- 80% (160 emails) - ⚠️ Warning (orange)
- 90% (180 emails) - 🚨 Critical (red-orange)
- 100% (200 emails) - 🔴 Exhausted (crimson)

**Integration:**
```typescript
await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: message,
    attachments: [{
      color: colors[level],
      fields: [
        { title: 'Service', value: 'Email Notifications' },
        { title: 'Environment', value: process.env.NODE_ENV },
        { title: 'Timestamp', value: new Date().toISOString() },
      ],
    }],
  }),
});
```

## Redis Keys Structure

```
# Email quota (atomic counter with TTL)
tresta:email:quota:YYYY-MM-DD → integer
  TTL: Expires at midnight UTC

# Email quota lock
tresta:email:quota:locked → "1"
  TTL: 1 hour

# Email quota next retry time
tresta:email:quota:nextRetry → ISO timestamp
  TTL: 1 hour

# Distributed locks
tresta:lock:digest:running → "1"
  TTL: 1 hour

# Ably connection tracking
tresta:ably:connections:count → integer

# Rate limiting
tresta:ratelimit:api:notifications:{userId} → counter
  TTL: 60 seconds

tresta:ratelimit:email:{userId} → counter
  TTL: 3600 seconds

# Metrics
tresta:metrics:notifications:sent → counter
  TTL: 7 days

tresta:metrics:emails:sent → counter
  TTL: 7 days

# Idempotency keys
tresta:idempotency:{webhookId}:{eventType} → "1"
  TTL: 24 hours
```

## API Endpoints

### Notification Management
- `GET /api/notifications` - List with cursor pagination
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### Preferences
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

### Ably Token
- `GET /api/ably/token` - Get authentication token

### Admin
- `GET /admin/metrics` - System metrics
- `GET /admin/dlq` - Dead letter queue
- `POST /admin/dlq/:id/requeue` - Retry failed job
- `GET /admin/dlq/stats` - DLQ statistics

## Frontend Components

### NotificationBadge
```typescript
<Button onClick={toggleCenter}>
  <Bell />
  {unreadCount > 0 && (
    <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>
  )}
</Button>
```

### NotificationCenter
```typescript
<Sheet open={isOpen} onOpenChange={closeCenter}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Notifications</SheetTitle>
      {hasUnread && (
        <Button onClick={markAllAsRead}>Mark all read</Button>
      )}
    </SheetHeader>
    <NotificationList />
  </SheetContent>
</Sheet>
```

### NotificationList
- Cursor-based pagination
- Infinite scroll
- Empty state
- Loading state
- Error handling

## State Management

### Zustand Store
```typescript
interface NotificationState {
  isOpen: boolean;
  openCenter: () => void;
  closeCenter: () => void;
  toggleCenter: () => void;
}
```

### React Query Hooks
```typescript
// Queries
useList(cursor, limit)
useUnreadCount()
usePreferences()

// Mutations
useMarkAsRead()
useMarkAllAsRead()
useUpdatePreferences()
```

## Error Handling

### Dead Letter Queue (DLQ)
- Captures failed jobs with detailed metadata
- Tracks error type (transient vs permanent)
- Stores HTTP status code and provider response
- Maintains retry history
- Supports manual requeue

### Error Types
- **Transient:** 429, 5xx (retry with backoff)
- **Permanent:** 4xx (don't retry)
- **Quota:** QUOTA_EXCEEDED (expected, don't persist)

### Exponential Backoff
```typescript
backoffStrategy: (attemptsMade: number) => {
  return Math.min(Math.pow(2, attemptsMade) * 1000, 30000);
}
```

## Performance Optimizations

### Caching
- Public widget endpoint: 5min CDN, 1min browser
- Notification list: 30s polling fallback
- Unread count: 30s polling fallback

### Rate Limiting
- API: 100 requests/minute per user
- Email: 10 emails/hour per user
- Global: 200 emails/day

### Database Indexes
- `userId + isRead` for unread queries
- `userId + createdAt` for list queries
- `createdAt` for global queries
- `status + createdAt` for outbox processing

## Security

### Authentication
- Clerk JWT tokens for API
- Ably token authentication for real-time
- User-scoped channels (subscribe only)

### Content Sanitization
- DOMPurify for XSS prevention
- Metadata sanitization
- Never log sensitive keys (ABLY_API_KEY, RESEND_API_KEY)

### Authorization
- User can only access own notifications
- Admin endpoints require admin role
- Public endpoints limited to PUBLIC projects

## Monitoring

### Metrics
- Notifications sent
- Emails sent
- Emails deferred
- Emails failed
- Ably connections
- Queue depth
- DLQ size

### Alerts
- Quota at 80%, 90%, 100%
- Worker failures
- Redis connection issues
- Database connection issues

### Logs
- Structured JSON logging
- Job ID correlation
- User ID correlation
- Error context

## Testing

### Unit Tests
- Quota management Lua script
- Email template rendering
- Content sanitization
- Error handling

### Integration Tests
- Outbox → worker flow
- Notification creation → delivery
- Email sending with quota
- Ably fallback to polling

### E2E Tests
- User receives notification
- Email sent for critical event
- Daily digest sent
- Preferences respected

## Deployment

### Environment Variables
```env
# Redis
REDIS_URL=rediss://...

# Database
DATABASE_URL=postgresql://...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=Tresta <notifications@tresta.app>
ENABLE_REAL_EMAILS=true

# Real-time (Ably)
ABLY_API_KEY=...
ENABLE_REAL_NOTIFICATIONS=true

# Alerts (Slack)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# App
APP_URL=https://tresta.app
NODE_ENV=production
```

### Worker Process
```bash
# Development
npm run dev:workers

# Production
npm run start:workers
```

### Cron Jobs
- Started automatically in worker process
- Graceful shutdown on SIGTERM/SIGINT
- Distributed locks prevent concurrent runs

## Future Enhancements

### Phase 2 (After 500 users)
- Per-event notification preferences
- Weekly digest option
- Quota dashboard for admins
- Advanced notification grouping
- Notification search and filtering

### Phase 3 (Scale-up)
- Mobile push notifications
- Slack/Discord integration
- SMS notifications
- Self-hosted alternative (Novu)
- Multi-language support
- Custom notification rules

