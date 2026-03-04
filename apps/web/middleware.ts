import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import routePolicy from "@/config/route-policy.json";

const PUBLIC_ROUTES = routePolicy.publicRoutes;
const PROTECTED_ROUTES = routePolicy.protectedRoutes;
const AUTH_ROUTES = routePolicy.authRoutes;

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isProtectedRoute = createRouteMatcher(PROTECTED_ROUTES);
const isAuthRoute = createRouteMatcher(AUTH_ROUTES);

export default clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;

  if (nextUrl.pathname.startsWith("/sso-callback")) {
    const hasOAuthCallbackParams =
      nextUrl.searchParams.has("code") ||
      nextUrl.searchParams.has("state") ||
      nextUrl.searchParams.has("__clerk_ticket") ||
      nextUrl.searchParams.has("__clerk_status") ||
      nextUrl.searchParams.has("rotating_token_nonce") ||
      nextUrl.searchParams.has("saml_response");

    if (!hasOAuthCallbackParams && !(await auth()).isAuthenticated) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", "/dashboard");
      return NextResponse.redirect(signInUrl);
    }
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req) && (await auth()).isAuthenticated) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req) && !(await auth()).isAuthenticated) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute(req) && (await auth()).isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
