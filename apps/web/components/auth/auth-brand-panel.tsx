"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Spotlight } from "@/components/landing/ui/spotlight";

const FEATURES = [
  "Collect testimonials with a custom-branded form",
  "Auto-moderate with spam detection & sentiment analysis",
  "Embed anywhere with a single line of code",
  "Real-time analytics to track what's working",
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col h-full bg-background overflow-hidden">
      {/* Spotlight sweep */}
      <Spotlight
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.05) 50%, transparent 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 80%, transparent 100%)"
        translateY={-200}
        width={480}
        height={900}
        smallWidth={180}
        duration={9}
        xOffset={60}
      />

      {/* Right-edge gradient fade into the form panel */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(var(--background)))",
        }}
        aria-hidden="true"
      />

      {/* Grid dot overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-10 py-10">
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

        {/* Hero text — vertically centered */}
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

          {/* Feature list */}
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

        {/* Footer trust line */}
        <p className="text-xs text-muted-foreground/60">
          Free forever · No credit card · Cancel anytime
        </p>
      </div>
    </div>
  );
}
