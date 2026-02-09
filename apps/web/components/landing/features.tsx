"use client";

import { useState } from "react";
import {
  Link2,
  Code2,
  LayoutGrid,
  Palette,
  Zap,
  Shield,
  Check,
  Star,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { SectionHeader } from "./section-header";

/**
 * Features Bento Grid - Stability First
 *
 * All content visible by default (opacity-100).
 * CSS-only animations as enhancements.
 * Zinc color palette with proper contrast.
 */

const layouts = ["grid", "carousel", "wall", "masonry", "list"] as const;

/**
 * Card wrapper with hover effects (CSS-only)
 */
function BentoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-zinc-900 border border-zinc-800",
        "transition-all duration-300",
        "hover:border-zinc-700 hover:bg-zinc-900/80",
        className,
      )}
    >
      {/* Subtle glow on hover - CSS only */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Card 1: Collect Link
 */
function CollectCard() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Collect</h3>
          <p className="text-sm text-zinc-400">Share a link. Get feedback.</p>
        </div>
      </div>

      {/* URL display - always visible */}
      <div className="mt-auto rounded-lg border border-zinc-700 bg-zinc-800 p-4 font-mono text-sm">
        <span className="text-zinc-500">tresta.app/</span>
        <span className="text-primary">your-project</span>
      </div>
    </div>
  );
}

/**
 * Card 2: Embed Anywhere with high-contrast code
 */
function EmbedCard() {
  const [selectedLayout, setSelectedLayout] =
    useState<(typeof layouts)[number]>("carousel");

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Embed anywhere</h3>
          <p className="text-sm text-zinc-400">
            One script tag. That&apos;s it.
          </p>
        </div>
      </div>

      {/* Layout selector */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {layouts.map((layout) => (
          <button
            key={layout}
            onClick={() => setSelectedLayout(layout)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200",
              selectedLayout === layout
                ? "bg-primary text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300",
            )}
          >
            {layout}
          </button>
        ))}
      </div>

      {/* High-contrast code block */}
      <pre className="mt-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-xs font-mono overflow-x-auto">
        <code>
          <span className="text-zinc-500">&lt;</span>
          <span className="text-emerald-400">script</span>
          {"\n  "}
          <span className="text-sky-400">src</span>
          <span className="text-zinc-500">=</span>
          <span className="text-amber-300">
            &quot;tresta.app/widget.js&quot;
          </span>
          {"\n  "}
          <span className="text-sky-400">data-project</span>
          <span className="text-zinc-500">=</span>
          <span className="text-amber-300">&quot;demo&quot;</span>
          {"\n  "}
          <span className="text-sky-400">data-layout</span>
          <span className="text-zinc-500">=</span>
          <span className="text-amber-300">&quot;{selectedLayout}&quot;</span>
          {"\n"}
          <span className="text-zinc-500">&gt;&lt;/</span>
          <span className="text-emerald-400">script</span>
          <span className="text-zinc-500">&gt;</span>
        </code>
      </pre>
    </div>
  );
}

/**
 * Card 3: 5 Layouts - CSS hover highlight
 */
function LayoutsCard() {
  const layoutIcons: Record<(typeof layouts)[number], React.ReactNode> = {
    grid: (
      <div className="grid grid-cols-2 gap-0.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-sm bg-current" />
        ))}
      </div>
    ),
    carousel: (
      <div className="flex items-center gap-0.5">
        <div className="h-3 w-0.5 rounded bg-current opacity-50" />
        <div className="h-3 w-3 rounded bg-current" />
        <div className="h-3 w-3 rounded bg-current" />
        <div className="h-3 w-0.5 rounded bg-current opacity-50" />
      </div>
    ),
    wall: (
      <div className="grid grid-cols-3 gap-0.5">
        <div className="col-span-2 h-2 rounded-sm bg-current" />
        <div className="h-2 rounded-sm bg-current" />
        <div className="h-2 rounded-sm bg-current" />
        <div className="col-span-2 h-2 rounded-sm bg-current" />
      </div>
    ),
    masonry: (
      <div className="grid grid-cols-2 gap-0.5">
        <div className="h-4 rounded-sm bg-current" />
        <div className="h-2 rounded-sm bg-current" />
        <div className="h-2 rounded-sm bg-current" />
        <div className="h-4 rounded-sm bg-current" />
      </div>
    ),
    list: (
      <div className="space-y-0.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-1.5 w-6 rounded bg-current" />
        ))}
      </div>
    ),
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-zinc-100">5 Layouts</h3>
      </div>

      <p className="mb-4 text-sm text-zinc-400">
        Grid, carousel, wall, masonry, or list.
      </p>

      {/* Layout icons - CSS hover highlight */}
      <div className="mt-auto grid grid-cols-5 gap-2">
        {layouts.map((layout) => (
          <div
            key={layout}
            className="group/layout flex flex-col items-center gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-500 transition-all duration-200 group-hover/layout:border-primary group-hover/layout:bg-primary/10 group-hover/layout:text-primary">
              {layoutIcons[layout]}
            </div>
            <span className="text-[10px] capitalize text-zinc-500 transition-colors group-hover/layout:text-zinc-300">
              {layout}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card 4: Brand Theming
 */
function BrandingCard() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-zinc-100">Theming</h3>
      </div>

      <p className="mb-4 text-sm text-zinc-400">
        Light, dark, or match your site.
      </p>

      {/* Theme preview - always visible */}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-zinc-950 border border-zinc-700 p-3 transition-all duration-200 hover:border-primary">
          <div className="text-xs font-medium text-zinc-100 mb-1">Dark</div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-zinc-400" />
            <div className="h-2 flex-1 rounded bg-zinc-700" />
          </div>
        </div>
        <div className="rounded-lg bg-white border border-zinc-300 p-3 transition-all duration-200 hover:border-primary">
          <div className="text-xs font-medium text-zinc-900 mb-1">Light</div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-zinc-500" />
            <div className="h-2 flex-1 rounded bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card 5: Realtime with CSS animation bubbles
 */
function RealtimeCard() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Realtime</h3>
          <p className="text-sm text-zinc-400">WebSocket updates</p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </div>

      {/* Simulated chat bubbles - visible by default, animation is enhancement */}
      <div className="mt-auto space-y-2 overflow-hidden">
        {[
          { initials: "JD", text: "Amazing tool!", delay: "0s" },
          { initials: "SK", text: "Works perfectly", delay: "3s" },
          { initials: "AL", text: "Love it!", delay: "6s" },
        ].map((bubble, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-2 animate-fade-in"
            style={{ animationDelay: bubble.delay }}
          >
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
              {bubble.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-2 w-2 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-300 truncate">
                &ldquo;{bubble.text}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card 6: OAuth Verified
 */
function OAuthCard() {
  const providers = [
    { name: "Google", abbr: "G", color: "text-red-400" },
    { name: "GitHub", abbr: "GH", color: "text-zinc-100" },
    { name: "LinkedIn", abbr: "in", color: "text-sky-400" },
  ];

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Verified Identity</h3>
          <p className="text-sm text-zinc-400">OAuth with major providers</p>
        </div>
      </div>

      {/* Provider icons - always visible */}
      <div className="mt-auto flex items-center justify-center gap-4">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex flex-col items-center gap-2 group/provider"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-400 transition-all duration-200 group-hover/provider:border-primary group-hover/provider:bg-primary/10 group-hover/provider:text-primary">
              {provider.abbr}
            </div>
            <span className="text-[10px] text-zinc-500">{provider.name}</span>
          </div>
        ))}

        {/* Checkmark */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Check className="h-5 w-5" />
          </div>
          <span className="text-[10px] text-emerald-400">Verified</span>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="bg-zinc-950 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeader
          title="Everything you need. Nothing you don't."
          description="Collect, moderate, and display testimonials. No complexity, no bloat."
        />

        {/* Bento Grid */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-[repeat(3,minmax(180px,auto))]">
            {/* Row 1: Collect (1x1) + Embed (1x2) */}
            <BentoCard>
              <CollectCard />
            </BentoCard>

            <BentoCard className="md:col-span-2">
              <EmbedCard />
            </BentoCard>

            {/* Row 2: Layouts (2x1) + Branding (1x1) + Realtime (1x1) */}
            <BentoCard className="md:row-span-2">
              <LayoutsCard />
            </BentoCard>

            <BentoCard>
              <BrandingCard />
            </BentoCard>

            <BentoCard>
              <RealtimeCard />
            </BentoCard>

            {/* Row 3: OAuth (1x2) */}
            <BentoCard className="md:col-span-2">
              <OAuthCard />
            </BentoCard>
          </div>
        </div>
      </div>

      {/* CSS animation keyframes */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
