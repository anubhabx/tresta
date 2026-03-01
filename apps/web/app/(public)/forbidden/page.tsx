import Link from "next/link";
import { LockKeyhole, ArrowLeftRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default function ForbiddenPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-[0.06]">
        <div className="absolute inset-0 bg-destructive rounded-full blur-[130px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-md w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-destructive/40 to-transparent" />

        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
              <LockKeyhole className="h-10 w-10" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-medium text-white">
              Access restricted
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              You found an area that exists, but your account doesn&apos;t have
              the required permissions. Reach out to your workspace admin if you
              need access.
            </p>
          </div>

          {/* Next steps box */}
          <div className="rounded-lg border border-white/8 bg-white/5 p-4 text-sm text-zinc-400 text-left">
            <p className="font-medium text-zinc-200 mb-2">Next steps:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Return to the dashboard to continue working</li>
              <li>Ask an admin to grant additional permissions</li>
              <li>Contact support if you believe this is an error</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              <Link href="/dashboard">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              size="lg"
              className="flex-1 text-zinc-300 hover:text-white hover:bg-white/5 border border-white/10"
            >
              <a href="mailto:support@tresta.app">Contact support</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
