# Tresta Admin Panel

Minimal, secure admin panel for managing the Tresta notification system.

## Features

- 📊 **Dashboard** - System metrics and email quota monitoring
- 🔄 **Dead Letter Queue** - View and requeue failed jobs
- 💚 **Health Checks** - Monitor system component status
- 🔐 **Secure** - Admin role required (Clerk metadata)
- 📦 **Minimal Bundle** - Separate from main app, optimized for admin use

## Security

### Access Control

- **Authentication**: Clerk (same as main app)
- **Authorization**: Requires `role: "admin"` in Clerk publicMetadata
- **Middleware**: Checks admin role on every request
- **Access Denied**: Non-admin users see access denied page

### Security Headers

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `robots: noindex, nofollow` - Prevents search engine indexing

## Setup

### 1. Install Dependencies

```bash
cd apps/admin
pnpm install
```

### 2. Configure Environment

Create `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Set Up Admin User

In Clerk Dashboard:
1. Go to Users → Select user
2. Click Metadata tab
3. Edit Public Metadata
4. Add: `{ "role": "admin" }`
5. Save

### 4. Run Development Server

```bash
pnpm dev
```

Admin panel will be available at: http://localhost:3001

## Pages

### Dashboard (`/dashboard`)

- Email quota usage (daily limit: 200)
- Ably connection count
- Notification/email metrics
- Queue status (DLQ, Outbox)
- 7-day email history

### Dead Letter Queue (`/dashboard/dlq`)

- List of failed jobs
- Filter by queue/error type
- Requeue failed jobs
- View error details

### Health (`/dashboard/health`)

- Database connection status
- Redis connection status
- BullMQ queue health
- Troubleshooting guidance

## API Integration

### Server-Side (Recommended)

```typescript
import { createApiClient } from '@/lib/api';

// In Server Component
const api = await createApiClient();
const response = await api.get('/admin/metrics');
```

### Client-Side

```typescript
'use client';
import { useAuth } from '@clerk/nextjs';
import { createClientApiClient } from '@/lib/api';

const { getToken } = useAuth();
const token = await getToken();
const api = createClientApiClient(token);
const response = await api.get('/admin/metrics');
```

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Configure Build Settings**
   - Framework: Next.js
   - Root Directory: `apps/admin`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Set `NODE_ENV=production`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
```

## Bundle Size Optimization

### Current Optimizations

- ✅ Separate app (no main app code)
- ✅ Minimal dependencies (no shadcn/ui, no heavy libraries)
- ✅ Server Components by default
- ✅ Client Components only where needed
- ✅ Tree-shaking enabled
- ✅ Package imports optimized (date-fns)

### Bundle Analysis

```bash
# Analyze bundle size
pnpm build
npx @next/bundle-analyzer
```

## Monitoring

### Logs

```bash
# Development
pnpm dev

# Production (Vercel)
vercel logs

# Production (Docker)
docker logs <container-id>
```

### Metrics

Monitor these in the dashboard:
- Email quota usage (alert at 80%)
- DLQ count (investigate if > 0)
- Outbox pending (should be low)
- Failed emails (investigate spikes)

## Troubleshooting

### "Access Denied" Error

**Cause**: User doesn't have admin role

**Solution**:
1. Check Clerk Dashboard → Users → Metadata
2. Ensure `publicMetadata.role === "admin"`
3. User must sign out and sign back in

### API Connection Failed

**Cause**: API URL incorrect or API not running

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Ensure API is running on correct port
3. Check network/firewall settings

### Health Checks Failing

**Cause**: Database, Redis, or BullMQ not accessible

**Solution**:
1. Check API logs for connection errors
2. Verify environment variables in API
3. Ensure services are running
4. Check network connectivity

## Development

### Adding New Pages

1. Create page in `src/app/dashboard/`
2. Add navigation link in `layout.tsx`
3. Create API endpoint if needed
4. Test with admin user

### Adding New Components

1. Create in `src/components/`
2. Use `'use client'` if interactive
3. Keep minimal (no heavy dependencies)
4. Test bundle size impact

## Security Best Practices

1. ✅ **Never expose admin logic in main app**
2. ✅ **Always check admin role on backend**
3. ✅ **Use HTTPS in production**
4. ✅ **Rotate Clerk secrets regularly**
5. ✅ **Monitor admin access logs**
6. ✅ **Limit admin users to trusted personnel**
7. ✅ **Use environment variables for secrets**
8. ✅ **Enable 2FA for admin users**

## Related Documentation

- [Admin Middleware Setup](../api/ADMIN_SETUP.md)
- [API Documentation](../../docs/API_DOCUMENTATION.md)
- [Notification System](../../docs/NOTIFICATION_SYSTEM.md)

