import Link from "next/link";
import { ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.06]">
        <div className="absolute inset-0 bg-amber-500 rounded-full blur-[130px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-md w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-medium text-white">
              Sign in required
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You need to be signed in to access this area. Please log in with
              your workspace account to continue.
            </p>
          </div>

          {/* Tip box */}
          <div className="rounded-lg border border-white/8 bg-white/5 p-4 text-sm text-zinc-400">
            Tip: If you just signed out, signing back in will return you to this
            page automatically.
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Go to sign in
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              size="lg"
              className="flex-1 text-zinc-300 hover:text-white hover:bg-white/5 border border-white/10"
            >
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
