"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

/**
 * SSO callback page — handles the OAuth redirect from Clerk.
 * Shows a branded loading state while Clerk processes the session,
 * then redirects to /dashboard (or the original redirect_url preserved
 * by the fallbackRedirectUrl on ClerkProvider).
 */
export default function SSOCallbackPage() {
  const router = useRouter();

  // Safety net: if AuthenticateWithRedirectCallback doesn't redirect
  // within 8 seconds (network timeout, config error), push to dashboard.
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/dashboard");
    }, 8000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-6">
      {/* Animated gradient orb */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full animate-pulse"
          style={{
            background:
              "radial-gradient(ellipse at 40% 40%, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.08))",
            boxShadow: "0 0 40px hsl(var(--primary) / 0.25)",
          }}
        />
        {/* Spinner ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/branding/tresta.svg"
          alt="Tresta"
          width={20}
          height={20}
          className="shrink-0 opacity-80"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground/70">
          Tresta
        </span>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Signing you in…</p>
        <p className="text-xs text-muted-foreground mt-1">
          Just a moment, setting up your session.
        </p>
      </div>

      {/* Clerk does the actual work — renders nothing visually */}
      <div className="hidden">
        <AuthenticateWithRedirectCallback
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
