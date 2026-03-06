import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, MountainSnow } from "lucide-react";

export function PricingCTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#050505]">
      {/* Aggressive radial glow pulling users to the CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-primary rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        <h2 className="text-5xl md:text-6xl font-display font-medium text-white mb-6">
          Ready to showcase your best feedback?
        </h2>
        <p className="text-zinc-400 font-sans max-w-2xl mx-auto text-lg mb-10">
          Get started for free. Upgrade to Pro when you need unlimited projects
          and custom branding.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            size="lg"
            className="rounded-md px-8 h-12 bg-primary hover:bg-primary/90 text-white font-medium transition-all"
          >
            <Link href="/sign-up">Start Free Trial</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="rounded-md px-8 h-12 text-zinc-300 hover:text-white hover:border border-white/10 transition-all"
          >
            <Link href="/pricing" className="flex items-center">
              View Pricing Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <MountainSnow className="h-5 w-5 text-primary" />
            <span className="font-bold text-zinc-300">Tresta</span>
            <span className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-500">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Product
              </span>
              <Link
                href="/pricing"
                className="hover:text-zinc-300 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/contact-us"
                className="hover:text-zinc-300 transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                Legal
              </span>
              <Link
                href="/privacy-policy"
                className="hover:text-zinc-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="hover:text-zinc-300 transition-colors"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="/cancellations-and-refunds"
                className="hover:text-zinc-300 transition-colors"
              >
                Cancellations &amp; Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
