import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/access-denied', '/debug']);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes (sign-in, sign-up, access-denied)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    // Not authenticated - redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has admin role in publicMetadata
  const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const role = publicMetadata?.role;
  
  if (role !== 'admin') {
    // User is authenticated but not admin - show access denied
    console.log(`Access denied for user ${userId} with role: ${role}`);
    return NextResponse.redirect(new URL('/access-denied', req.url));
  }

  // User is admin - allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
