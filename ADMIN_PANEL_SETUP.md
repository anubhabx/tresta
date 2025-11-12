# Admin Panel Setup Guide

## 🎯 Quick Start

The admin panel is a **separate, minimal Next.js app** for managing the Tresta notification system.

### Why Separate?

✅ **Security** - Admin logic not exposed in main app bundle  
✅ **Performance** - Smaller bundle size (no main app dependencies)  
✅ **Isolation** - Independent deployment and scaling  
✅ **Maintenance** - Easier to secure and update  

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd apps/admin
pnpm install
```

### 2. Configure Environment

Create `apps/admin/.env.local`:

```env
# Clerk Authentication (same as main app)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Set Up Admin User

**In Clerk Dashboard:**

1. Go to **Users** → Select your user
2. Click **Metadata** tab
3. Click **Edit** next to "Public metadata"
4. Add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Click **Save**

### 4. Start Admin Panel

```bash
# From root directory
pnpm admin:dev

# Or from admin directory
cd apps/admin
pnpm dev
```

Admin panel will be available at: **http://localhost:3001**

---

## 🔐 Security Features

### Access Control

- ✅ **Authentication Required** - Clerk handles auth
- ✅ **Admin Role Required** - Middleware checks `publicMetadata.role === "admin"`
- ✅ **Access Denied Page** - Non-admin users see friendly error
- ✅ **Backend Verification** - API also checks admin role

### Security Headers

```javascript
X-Frame-Options: DENY                    // Prevents clickjacking
X-Content-Type-Options: nosniff          // Prevents MIME sniffing
Referrer-Policy: strict-origin-when-cross-origin
robots: noindex, nofollow                // Blocks search engines
```

### Best Practices

1. ✅ **Separate Deployment** - Deploy admin panel separately from main app
2. ✅ **Minimal Dependencies** - Only essential packages included
3. ✅ **No Admin Logic in Main App** - Complete separation
4. ✅ **Token-Based API Auth** - Secure communication with backend
5. ✅ **Server Components** - Better performance and security

---

## 📊 Features

### Dashboard (`/dashboard`)

**Metrics Overview:**
- Email quota usage (200/day limit)
- Ably connection count (200 concurrent limit)
- Notifications sent
- Emails sent/deferred/failed
- Dead letter queue count
- Outbox pending count
- 7-day email history

**Visual Indicators:**
- 🟢 Green: < 80% usage
- 🟡 Yellow: 80-90% usage
- 🔴 Red: > 90% usage

### Dead Letter Queue (`/dashboard/dlq`)

**Failed Job Management:**
- View all failed jobs
- Filter by queue (notifications, send-email)
- Filter by error type (transient, permanent)
- View error details
- Requeue failed jobs with one click
- See failure timestamps

**Job Information:**
- Queue name
- Error type (transient/permanent)
- HTTP status code
- Error message
- Failed timestamp
- Requeue action

### Health Checks (`/dashboard/health`)

**System Status:**
- Database connection (PostgreSQL)
- Redis connection
- BullMQ queue health
- Overall system status
- Troubleshooting guidance

**Status Indicators:**
- ✅ All systems operational
- ⚠️ Some systems down (with details)

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from admin directory
cd apps/admin
vercel

# Production deployment
vercel --prod
```

**Vercel Configuration:**
- Framework: Next.js
- Root Directory: `apps/admin`
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Environment Variables:**
Add all variables from `.env.local` in Vercel dashboard.

### Option 2: Docker

```bash
# Build image
docker build -t tresta-admin -f apps/admin/Dockerfile .

# Run container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... \
  -e CLERK_SECRET_KEY=sk_test_... \
  -e NEXT_PUBLIC_API_URL=https://api.tresta.app \
  tresta-admin
```

### Option 3: Traditional Hosting

```bash
# Build for production
cd apps/admin
pnpm build

# Start production server
pnpm start

# Or use PM2
pm2 start npm --name "tresta-admin" -- start
```

---

## 🧪 Testing

### Test Admin Access

1. **Sign in with admin user**
   - Go to http://localhost:3001
   - Sign in with Clerk
   - Should see dashboard

2. **Test non-admin user**
   - Sign in with user without admin role
   - Should see "Access Denied" page

3. **Test API integration**
   - Dashboard should load metrics
   - DLQ should show failed jobs
   - Health should show system status

### Test Requeue Functionality

1. Go to DLQ page
2. Click "Requeue" on a failed job
3. Confirm action
4. Job should disappear from list
5. Check API logs for requeue confirmation

---

## 📝 Development

### Adding New Pages

1. Create page in `src/app/dashboard/`
2. Add navigation link in `layout.tsx`
3. Fetch data using `createApiClient()`
4. Use Server Components by default

**Example:**

```typescript
// src/app/dashboard/new-page/page.tsx
import { createApiClient } from '@/lib/api';

async function getData() {
  const api = await createApiClient();
  const response = await api.get('/admin/new-endpoint');
  return response.data;
}

export default async function NewPage() {
  const data = await getData();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Page</h2>
      {/* Your content */}
    </div>
  );
}

export const dynamic = 'force-dynamic';
```

### Adding Client Components

Only use `'use client'` when needed (forms, buttons, etc.):

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export function InteractiveComponent() {
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  
  // Your interactive logic
}
```

---

## 🔧 Troubleshooting

### "Access Denied" Error

**Problem:** User sees access denied page

**Solution:**
1. Check Clerk Dashboard → Users → Metadata
2. Ensure `publicMetadata.role === "admin"`
3. User must sign out and sign back in for changes to take effect

### API Connection Failed

**Problem:** Dashboard shows "Failed to load metrics"

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Ensure API is running: `pnpm --filter api dev`
3. Check API logs for errors
4. Verify network connectivity

### Middleware Not Working

**Problem:** Non-admin users can access dashboard

**Solution:**
1. Check `src/middleware.ts` is present
2. Verify middleware config matcher
3. Check Clerk environment variables
4. Clear browser cache and cookies

### Build Errors

**Problem:** `pnpm build` fails

**Solution:**
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `pnpm install`
4. Try build again: `pnpm build`

---

## 📊 Monitoring

### Metrics to Watch

1. **Email Quota**
   - Alert at 80% (160 emails)
   - Critical at 90% (180 emails)
   - Locked at 100% (200 emails)

2. **Dead Letter Queue**
   - Investigate if count > 0
   - Check error types
   - Requeue transient errors

3. **System Health**
   - All checks should be green
   - Investigate any red status immediately

### Logs

```bash
# Development
pnpm admin:dev

# Production (Vercel)
vercel logs

# Production (PM2)
pm2 logs tresta-admin
```

---

## 🔗 Related Documentation

- [Admin Middleware Setup](apps/api/ADMIN_SETUP.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Notification System](docs/NOTIFICATION_SYSTEM.md)
- [Admin App README](apps/admin/README.md)

---

## ✅ Checklist

Before going to production:

- [ ] Admin user configured in Clerk
- [ ] Environment variables set
- [ ] API accessible from admin panel
- [ ] Health checks passing
- [ ] Metrics loading correctly
- [ ] DLQ functionality tested
- [ ] Access denied page tested
- [ ] Security headers verified
- [ ] HTTPS enabled
- [ ] Monitoring set up
- [ ] Backup admin user created

---

**Admin Panel Port:** 3001  
**Main App Port:** 3000  
**API Port:** 8000

