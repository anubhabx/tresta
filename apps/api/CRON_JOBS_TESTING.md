# Cron Jobs Testing Guide

This document describes how to test the notification system's cron jobs.

## Overview

The notification system includes two cron jobs:

1. **Daily Digest Job** - Runs at 9 AM UTC
2. **Reconciliation Job** - Runs at 11:59 PM UTC

## Prerequisites

Before testing, ensure you have:

- Redis instance running (local or Upstash)
- PostgreSQL database with migrations applied
- Environment variables configured:
  - `REDIS_URL`
  - `DATABASE_URL`
  - `RESEND_API_KEY` (optional for mock mode)
  - `SLACK_WEBHOOK_URL` (optional for alerts)
  - `ENABLE_REAL_EMAILS=false` (for testing)

## Automated Tests

### 1. Worker Startup Test

Verifies that workers and cron jobs can start without errors:

```bash
cd apps/api
npx ts-node src/scripts/test-worker-startup.ts
```

**What it tests:**
- ✅ Cron jobs can be imported
- ✅ Cron expressions are correct (9 AM and 11:59 PM UTC)
- ✅ Jobs can be started and stopped
- ✅ Workers can be imported without errors

### 2. Digest Logic Test

Tests the core logic of the daily digest job (requires Redis):

```bash
cd apps/api
npx ts-node src/scripts/test-digest-logic.ts
```

**What it tests:**
- ✅ Distributed lock prevents concurrent runs
- ✅ Quota lock check works correctly
- ✅ User query finds users with email enabled
- ✅ Notification query filters correctly
- ✅ Quota increment is atomic
- ✅ Quota exhaustion is handled
- ✅ High priority emails bypass quota

## Manual Testing

### Test Daily Digest Job

1. **Start the worker process:**
   ```bash
   cd apps/api
   npm run dev:workers
   ```

2. **Create test notifications:**
   ```bash
   # Use the API to create notifications for a test user
   curl -X POST http://localhost:3000/api/test/create-notifications \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Manually trigger the digest job:**
   ```typescript
   // In a test script or REPL
   import { dailyDigestJob } from './src/jobs/daily-digest.job.ts';
   await dailyDigestJob.fireOnTick();
   ```

4. **Verify results:**
   - Check console logs for digest emails sent
   - Check Redis for quota count: `GET tresta:email:quota:YYYY-MM-DD`
   - Check Slack for quota alerts (if configured)

### Test Reconciliation Job

1. **Set a test quota in Redis:**
   ```bash
   redis-cli SET tresta:email:quota:2025-11-11 150
   ```

2. **Manually trigger the reconciliation job:**
   ```typescript
   import { reconciliationJob } from './src/jobs/reconciliation.job.ts';
   await reconciliationJob.fireOnTick();
   ```

3. **Verify results:**
   - Check database for EmailUsage record
   - Verify count matches Redis value

### Test Quota Alerts

1. **Set quota to trigger alert:**
   ```bash
   redis-cli SET tresta:email:quota:2025-11-11 160
   ```

2. **Send a test email:**
   ```typescript
   import { checkAndAlertQuota } from './src/utils/alerts.ts';
   await checkAndAlertQuota(160);
   ```

3. **Verify Slack alert received** (if webhook configured)

## Production Testing

### Verify Cron Schedule

Check that jobs are scheduled correctly:

```bash
# In worker logs, you should see:
✅ Daily digest job scheduled (9 AM UTC)
✅ Reconciliation job scheduled (11:59 PM UTC)
```

### Monitor Job Execution

1. **Check worker logs** for job execution:
   ```
   🔔 Starting daily digest job...
   📧 Processing digest for X users
   ✅ Daily digest job completed: Sent: X, Skipped: Y
   ```

2. **Check admin metrics endpoint:**
   ```bash
   curl http://localhost:3000/admin/metrics \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

3. **Monitor Slack alerts** for quota thresholds

### Test Quota Management

1. **Send emails until quota reached:**
   - Create 200 notifications
   - Verify 201st email is deferred
   - Verify quota lock is set
   - Verify Slack alert at 100%

2. **Test high priority bypass:**
   - Create a SECURITY_ALERT notification
   - Verify it's sent immediately even at quota

3. **Test quota reset:**
   - Wait for midnight UTC
   - Verify quota resets to 0
   - Verify quota lock is cleared

## Expected Behavior

### Daily Digest Job (9 AM UTC)

1. Acquires distributed lock
2. Checks if quota is locked
3. Fetches users with emailEnabled=true
4. For each user:
   - Fetches non-critical notifications from last 24 hours
   - Skips if no notifications
   - Atomically checks and increments quota
   - Sends digest email (or logs in mock mode)
   - Checks for quota alerts
   - Stops if quota exhausted
5. Releases distributed lock

### Reconciliation Job (11:59 PM UTC)

1. Fetches current day's quota from Redis
2. Snapshots to EmailUsage table in Postgres
3. Logs reconciliation results

### Quota Alerts

Alerts are sent at:
- **80% (160 emails)** - ⚠️ Warning (orange)
- **90% (180 emails)** - 🚨 Critical (red-orange)
- **100% (200 emails)** - 🔴 Exhausted (crimson)

Each alert is sent only once per day.

## Troubleshooting

### Jobs not running

- Check worker process is running: `ps aux | grep workers`
- Check worker logs for errors
- Verify cron expressions: `dailyDigestJob.cronTime.source`

### Emails not sending

- Check `ENABLE_REAL_EMAILS` flag
- Check `RESEND_API_KEY` is set
- Check quota hasn't been exhausted
- Check user has emailEnabled=true

### Quota not incrementing

- Check Redis connection
- Check Lua script execution
- Check TTL is set correctly
- Verify date format (YYYY-MM-DD UTC)

### Alerts not sending

- Check `SLACK_WEBHOOK_URL` is set
- Check webhook URL is valid
- Check alert hasn't been sent already today
- Check Redis for alert keys

## Test Checklist

Before deploying to production:

- [ ] Worker startup test passes
- [ ] Digest logic test passes (with Redis)
- [ ] Cron expressions are correct
- [ ] Distributed lock prevents concurrent runs
- [ ] Quota management is atomic
- [ ] High priority emails bypass quota
- [ ] Quota alerts trigger at thresholds
- [ ] Reconciliation snapshots to database
- [ ] Graceful shutdown works correctly
- [ ] Mock mode works without RESEND_API_KEY
- [ ] Real emails send with ENABLE_REAL_EMAILS=true

## Performance Considerations

- **Digest job** can take >30s for many users
  - Run on dedicated worker dyno (not web)
  - Monitor execution time
  - Consider batching if >1000 users

- **Reconciliation job** is fast (<1s)
  - Can run on same worker as digest

- **Quota checks** are atomic (Lua script)
  - No race conditions
  - Safe for concurrent workers
