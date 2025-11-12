# Tresta Admin Panel

A secure, standalone Next.js 15 application for managing the Tresta notification and testimonial system.

## Features

- 🔐 **Secure Authentication** - Clerk-based authentication with admin role verification
- 🛡️ **Role-Based Access Control** - Only users with admin role can access
- 🚫 **Access Denied Page** - Friendly error page for non-admin users
- 🔒 **Security Headers** - X-Frame-Options, X-Content-Type-Options, X-Request-ID
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` file (use `.env.local.example` as template):

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

**Option A: First User (Automatic)**

The first user to sign up will be automatically promoted to admin.

**Option B: Manual Setup**

For additional admin users:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users** → Select your user
3. Click **Metadata** tab
4. Click **Edit** next to "Public metadata"
5. Add:
   ```json
   {
     "role": "admin"
   }
   ```
6. Click **Save**
7. User must sign out and sign back in

### 4. Start Development Server

```bash
pnpm dev
```

The admin panel will be available at: **http://localhost:3001**

## Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── sign-in/            # Sign-in page
│   │   ├── sign-up/            # Sign-up page
│   │   ├── unauthorized/       # Access denied page
│   │   ├── layout.tsx          # Root layout with Clerk
│   │   └── page.tsx            # Redirects to dashboard
│   └── middleware.ts           # Auth & role check middleware
├── .env.local.example          # Environment variables template
└── package.json
```

## Security Features

### Authentication & Authorization

- ✅ Clerk authentication required for all routes
- ✅ Admin role verification via `publicMetadata.role === "admin"`
- ✅ Automatic redirect to sign-in for unauthenticated users
- ✅ Access denied page for non-admin users

### Security Headers

The middleware automatically adds these security headers to all responses:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `X-Robots-Tag: noindex, nofollow` - Blocks search engine indexing
- `X-Request-ID: <uuid>` - Unique request identifier for tracing

## Development

### Adding New Pages

1. Create page in `src/app/dashboard/`
2. Add navigation link (will be implemented in Task 2)
3. Use Server Components by default for better security

Example:

```typescript
// src/app/dashboard/new-page/page.tsx
import { auth } from '@clerk/nextjs/server';

export default async function NewPage() {
  const { userId } = await auth();
  
  return (
    <div>
      <h1>New Page</h1>
      {/* Your content */}
    </div>
  );
}
```

### Using Client Components

Only use `'use client'` when needed (forms, interactive elements):

```typescript
'use client';

import { useState } from 'react';

export function InteractiveComponent() {
  const [state, setState] = useState(false);
  
  return (
    <button onClick={() => setState(!state)}>
      Toggle
    </button>
  );
}
```

## Troubleshooting

### "Access Denied" Error

**Problem:** User sees access denied page after signing in

**Solution:**

1. Check Clerk Dashboard → Users → Your User → Metadata
2. Ensure `publicMetadata` contains `{ "role": "admin" }`
3. Sign out and sign back in for changes to take effect

### Middleware Not Working

**Problem:** Non-admin users can access dashboard

**Solution:**

1. Verify `src/middleware.ts` exists
2. Check Clerk environment variables in `.env.local`
3. Clear browser cache and cookies
4. Restart development server

### Build Errors

**Problem:** `pnpm build` fails

**Solution:**

1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `pnpm install`
4. Try build again: `pnpm build`

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables:**

Add all variables from `.env.local` in Vercel dashboard.

### Docker

```bash
# Build image
docker build -t tresta-admin .

# Run container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... \
  -e CLERK_SECRET_KEY=sk_test_... \
  -e NEXT_PUBLIC_API_URL=https://api.tresta.app \
  tresta-admin
```

## Related Documentation

- [Admin Panel Setup Guide](../../ADMIN_PANEL_SETUP.md)
- [Admin Panel Spec](.kiro/specs/admin-panel/)
- [API Documentation](../../docs/API_DOCUMENTATION.md)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Authentication:** Clerk
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **TypeScript:** Strict mode

## License

Private - Tresta Project
