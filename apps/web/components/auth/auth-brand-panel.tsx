"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const FEATURES = [
  "Collect testimonials with a custom-branded form",
  "Auto-moderate with spam detection & sentiment analysis",
  "Embed anywhere with a single line of code",
  "Real-time analytics to track what's working",
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col h-full bg-background overflow-hidden">
      {/* Subtle radial glow — rgba avoids the hex-var hsl() parsing issue */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 5% 10%, rgba(59,130,246,0.22) 0%, transparent 65%)," +
            "radial-gradient(ellipse 55% 45% at 90% 85%, rgba(59,130,246,0.10) 0%, transparent 60%)",
        }}
      />

      {/* Right-edge fade into form panel */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-20"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--background))",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col h-full px-10 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/branding/tresta.svg"
            alt="Tresta"
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Tresta
          </span>
        </div>

        {/* Hero text — vertically centred */}
        <div className="my-auto max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-4">
            Testimonial collection, simplified
          </p>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-foreground mb-5">
            Turn happy customers into your best{" "}
            <span style={{ color: "hsl(var(--primary))" }}>marketing</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-9">
            Collect, curate, and embed testimonials — in minutes. No engineers
            required.
          </p>

          <ul className="space-y-3.5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-px" />
                <span className="text-sm text-foreground/80 leading-snug">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trust footnote */}
        <p className="text-xs text-muted-foreground/60">
          Free forever · No credit card · Cancel anytime
        </p>
      </div>
    </div>
  );
}
