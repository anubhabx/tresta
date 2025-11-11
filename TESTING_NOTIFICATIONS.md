# Notification System Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Environment Variables Set** (in `apps/api/.env`):
```env
# Required
REDIS_URL=redis://localhost:6379  # or your Redis URL
DATABASE_URL=postgresql://...      # Your database URL

# Optional (for full testing)
ABLY_API_KEY=your_ably_key        # For real-time notifications
RESEND_API_KEY=your_resend_key    # For email sending
EMAIL_FROM=Tresta <notifications@tresta.app>
APP_URL=http://localhost:3000

# Feature Flags
ENABLE_REAL_NOTIFICATIONS=false   # Set to 'true' to enable Ably
ENABLE_REAL_EMAILS=false          # Set to 'true' to enable Resend
```

2. **Frontend Environment** (in `apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_REAL_NOTIFICATIONS=false  # Set to 'true' to enable Ably
```

3. **Dependencies Installed**:
```bash
pnpm install
```

4. **Database Migrated**:
```bash
cd packages/database
pnpm prisma migrate dev
```

## Testing Steps

### 1. Start the Services

Open 3 terminal windows:

**Terminal 1 - API Server:**
```bash
pnpm --filter api dev
```

**Terminal 2 - Workers:**
```bash
pnpm --filter api dev:workers
```

**Terminal 3 - Web App:**
```bash
pnpm --filter web dev
```

Wait for all services to start successfully.

### 2. Test Notification Creation (Mock Mode)

With `ENABLE_REAL_NOTIFICATIONS=false`, test the basic flow:

**A. Create a Test Notification via API:**

```bash
# Get your auth token from the browser (Clerk)
# Open DevTools > Application > Cookies > __session

# Create a notification
curl -X POST http://localhost:8000/api/test/create-notification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NEW_TESTIMONIAL",
    "title": "Test Notification",
    "message": "This is a test notification",
    "link": "/dashboard"
  }'
```

**B. Check the Results:**

1. **Database** - Notification should be created:
   - Check `Notification` table
   - Check `NotificationOutbox` table (status: 'enqueued')
   - Check `JobIdempotency` table

2. **Worker Logs** - Should see:
   ```
   Outbox entry processed successfully
   Notification sent successfully
   [MOCK] Ably notification: ...
   ```

3. **Frontend** - Refresh the page:
   - Sidebar should show the notification
   - Unread count badge should appear
   - Click to open notification center

### 3. Test Notification API Endpoints

**A. List Notifications:**
```bash
curl http://localhost:8000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**B. Get Unread Count:**
```bash
curl http://localhost:8000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**C. Mark as Read:**
```bash
curl -X PATCH http://localhost:8000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isRead": true}'
```

**D. Mark All as Read:**
```bash
curl -X POST http://localhost:8000/api/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**E. Get Preferences:**
```bash
curl http://localhost:8000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**F. Update Preferences:**
```bash
curl -X PUT http://localhost:8000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}'
```

### 4. Test Email Quota Management

**A. Check Current Quota:**
```bash
curl http://localhost:8000/admin/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**B. Test Quota Enforcement:**

Create a script to send multiple notifications and verify quota limits work.

### 5. Test Frontend Components

**A. Sidebar Notifications:**
1. Open the web app
2. Expand sidebar (if collapsed)
3. Look for "Notifications" section above user menu
4. Should see:
   - Bell icon with unread count badge
   - 2-3 recent notifications (if any exist)
   - "View all notifications" link

**B. Notification Center:**
1. Click on any notification or "View all"
2. Sheet should open from the right
3. Should see:
   - "Notifications" header
   - "Mark all read" button (if unread exist)
   - List of notifications
   - "Load more" button (if more than 20)

**C. Mark as Read:**
1. Click on an unread notification (blue background)
2. Should navigate to the link
3. Notification should be marked as read
4. Unread count should decrease

**D. Preferences Page:**
1. Navigate to `/settings/notifications`
2. Should see:
   - Email notification toggle
   - Explanation of notification types
   - Real-time notifications info

**E. Mobile View:**
1. Resize browser to mobile width
2. Notification badge should appear in navbar
3. Sidebar notifications should be hidden
4. Click badge to open notification center

### 6. Test Real-Time Notifications (Optional)

If you have Ably credentials:

**A. Enable Ably:**
```env
# apps/api/.env
ENABLE_REAL_NOTIFICATIONS=true
ABLY_API_KEY=your_key

# apps/web/.env.local
NEXT_PUBLIC_ENABLE_REAL_NOTIFICATIONS=true
```

**B. Restart Services**

**C. Test Real-Time:**
1. Open web app in browser
2. Create a notification via API (see step 2)
3. Should see:
   - Toast notification appear immediately
   - Notification appear in sidebar instantly
   - Unread count update in real-time
   - No page refresh needed

**D. Test Auto-Disconnect:**
1. Leave the page idle for 30 minutes
2. Ably should disconnect automatically
3. Move mouse or click
4. Should reconnect automatically

### 7. Test Email Sending (Optional)

If you have Resend credentials:

**A. Enable Emails:**
```env
# apps/api/.env
ENABLE_REAL_EMAILS=true
RESEND_API_KEY=your_key
EMAIL_FROM=Tresta <notifications@tresta.app>
```

**B. Restart Workers**

**C. Test Email:**
1. Create a critical notification (TESTIMONIAL_FLAGGED or SECURITY_ALERT)
2. Check worker logs for email sending
3. Check your email inbox
4. Verify email template looks good

### 8. Test Rate Limiting

**A. Test API Rate Limit (100 req/min):**
```bash
# Send 101 requests quickly
for i in {1..101}; do
  curl http://localhost:8000/api/notifications/unread-count \
    -H "Authorization: Bearer YOUR_TOKEN"
done
```

Should see 429 error on 101st request with `Retry-After` header.

**B. Check Rate Limit Headers:**
```bash
curl -i http://localhost:8000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should see:
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 99`
- `X-RateLimit-Reset: <timestamp>`

### 9. Test Admin Endpoints

**A. Health Checks:**
```bash
# Liveness
curl http://localhost:8000/healthz

# Readiness
curl http://localhost:8000/readyz
```

**B. Metrics:**
```bash
curl http://localhost:8000/admin/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should see:
- Email quota usage
- Ably connection count
- Metrics counters
- Last 7 days history

**C. Dead Letter Queue:**
```bash
# List failed jobs
curl http://localhost:8000/admin/dlq \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get DLQ stats
curl http://localhost:8000/admin/dlq/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Test Error Handling

**A. Test Worker Failure:**
1. Create notification with invalid data
2. Check worker logs for error
3. Verify job appears in DeadLetterJob table
4. Check DLQ admin endpoint

**B. Test Quota Exhaustion:**
1. Manually set Redis quota to 200
2. Try to send email
3. Should be deferred (not fail)
4. Check worker logs for quota message

**C. Test Ably Disconnection:**
1. Disconnect from internet
2. Ably should show disconnected
3. Polling should activate (every 30s)
4. Reconnect internet
5. Should reconnect automatically

## Expected Results

### ✅ Success Criteria

1. **Notifications Created:**
   - Appear in database
   - Outbox entry created
   - Worker processes successfully

2. **Frontend Display:**
   - Sidebar shows recent notifications
   - Unread count badge appears
   - Notification center opens correctly
   - Mark as read works

3. **Real-Time (if enabled):**
   - Notifications appear instantly
   - Toast shows on new notification
   - Auto-disconnect/reconnect works

4. **Email (if enabled):**
   - Emails sent successfully
   - Templates render correctly
   - Quota enforced

5. **Rate Limiting:**
   - 429 errors after limit
   - Headers present
   - Retry-After works

6. **Admin:**
   - Health checks pass
   - Metrics accurate
   - DLQ tracking works

## Troubleshooting

### Issue: Notifications not appearing

**Check:**
1. API server running?
2. Workers running?
3. Database migrated?
4. Redis connected?
5. Check browser console for errors
6. Check API logs for errors

### Issue: Real-time not working

**Check:**
1. `ENABLE_REAL_NOTIFICATIONS=true` in both API and web?
2. Valid `ABLY_API_KEY`?
3. Browser console for Ably errors
4. Network tab for token request

### Issue: Emails not sending

**Check:**
1. `ENABLE_REAL_EMAILS=true`?
2. Valid `RESEND_API_KEY`?
3. Worker logs for errors
4. Email quota not exhausted?

### Issue: Workers not processing

**Check:**
1. Workers running? (`pnpm --filter api dev:workers`)
2. Redis connected?
3. Check worker logs
4. Check outbox table for pending entries

## Quick Test Script

Create a file `test-notifications.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Notification System..."

# Test 1: Health Check
echo -n "1. Health Check... "
if curl -s http://localhost:8000/healthz | grep -q "ok"; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

# Test 2: Readiness Check
echo -n "2. Readiness Check... "
if curl -s http://localhost:8000/readyz | grep -q "ready"; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

# Add more tests as needed...

echo "✅ Testing complete!"
```

Run with: `bash test-notifications.sh`

## Next Steps

After testing:

1. ✅ Verify all features work
2. ✅ Fix any issues found
3. ✅ Test with real Ably/Resend credentials
4. ✅ Implement daily digest cron job
5. ✅ Add Slack alerts for quota
6. ✅ Deploy to production

## Support

If you encounter issues:
1. Check logs (API, workers, browser console)
2. Verify environment variables
3. Check database state
4. Review error messages
5. Test individual components
