import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/testimonial(.*)"];
const PROTECTED_ROUTES = [
  "/dashboard(.*)",
  "/settings(.*)",
  "/products(.*)",
  "/projects(.*)"
];
const AUTH_ROUTES = ["/sign-in(.*)", "/sign-up(.*)", "/sso-callback(.*)"];

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isProtectedRoute = createRouteMatcher(PROTECTED_ROUTES);
const isAuthRoute = createRouteMatcher(AUTH_ROUTES);

export default clerkMiddleware(async (auth, req) => {
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
    "/(api|trpc)(.*)"
  ]
};
