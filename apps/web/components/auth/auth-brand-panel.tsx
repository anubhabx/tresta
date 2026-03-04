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
      {/* Animated gradient mesh background */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, hsl(var(--primary) / 0.18) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 80% 80%, hsl(var(--primary) / 0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 50% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Subtle animated orbs */}
      <div
        className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ background: "hsl(var(--primary))", animationDuration: "6s" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[20%] right-[8%] w-56 h-56 rounded-full blur-3xl opacity-10 animate-pulse"
        style={{
          background: "hsl(var(--primary))",
          animationDuration: "9s",
          animationDelay: "2s",
        }}
        aria-hidden="true"
      />

      {/* Grid dot overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex flex-col h-full px-10 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-auto">
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

        {/* Hero text */}
        <div className="my-auto max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-4">
            Testimonial collection, simplified
          </p>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-foreground mb-5">
            Turn happy customers into your best{" "}
            <span
              className="relative inline-block"
              style={{ color: "hsl(var(--primary))" }}
            >
              marketing
            </span>
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
        <p className="text-xs text-muted-foreground/60 mt-auto">
          Free forever · No credit card · Cancel anytime
        </p>
      </div>
    </div>
  );
}
