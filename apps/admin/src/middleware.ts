import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache for Clerk user metadata (avoids API call on every request)
const userRoleCache = new Map<string, { role: string | undefined; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 60 seconds

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/unauthorized',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();

  // Allow public routes (sign-in, sign-up, unauthorized) without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in for all protected routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check for admin role in publicMetadata (cached for 60s)
  const now = Date.now();
  let role: string | undefined;
  const cached = userRoleCache.get(userId);

  if (cached && cached.expiresAt > now) {
    role = cached.role;
  } else {
    const publicMetadata = (await (await clerkClient()).users.getUser(userId)).publicMetadata;
    role = publicMetadata.role as string | undefined;
    userRoleCache.set(userId, { role, expiresAt: now + CACHE_TTL_MS });

    // Prune expired entries
    if (userRoleCache.size > 50) {
      for (const [key, entry] of userRoleCache) {
        if (entry.expiresAt <= now) userRoleCache.delete(key);
      }
    }
  }

  if (role !== 'admin') {
    // Redirect non-admin users to unauthorized page
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('X-Request-ID', crypto.randomUUID());

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
