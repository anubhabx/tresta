"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  LayoutGrid,
  Shield,
  Zap,
  Star,
  Check,
  X,
  Grid3X3,
  LayoutList,
  Columns3,
  GalleryVerticalEnd,
  Layers,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { BentoGrid } from "@/components/ui/bento-grid";
import {
  SpotlightCard,
  type SpotlightVariant,
} from "@/components/landing/spotlight-card";
import { SectionHeader } from "./section-header";

/* ==========================================================================
   ANIMATED HEADER COMPONENTS — one per bento item
   Each header is a self-contained "mini UI" with hover / timed animation.
   ========================================================================== */

/**
 * Header 1: "Embed Anywhere" — High-fidelity code window
 * Mac-style window chrome + syntax-highlighted embed code + shimmer sweep
 */
function CodeWindowHeader() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-950">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-[10px] text-zinc-600 font-mono">
          index.html
        </span>
      </div>

      {/* Code content */}
      <div className="relative px-4 py-3">
        <pre className="text-xs font-mono leading-relaxed">
          <code>
            <span className="text-zinc-600">{"<!-- Tresta Widget -->"}</span>
            {"\n"}
            <span className="text-zinc-500">&lt;</span>
            <span className="text-pink-400">script</span>
            {"\n  "}
            <span className="text-sky-400">src</span>
            <span className="text-zinc-500">=</span>
            <span className="text-amber-300">
              &quot;tresta.app/widget.js&quot;
            </span>
            {"\n  "}
            <span className="text-sky-400">data-project</span>
            <span className="text-zinc-500">=</span>
            <span className="text-amber-300">&quot;my-saas&quot;</span>
            {"\n  "}
            <span className="text-sky-400">data-layout</span>
            <span className="text-zinc-500">=</span>
            <span className="text-emerald-400">&quot;carousel&quot;</span>
            {"\n  "}
            <span className="text-sky-400">data-theme</span>
            <span className="text-zinc-500">=</span>
            <span className="text-violet-400">&quot;dark&quot;</span>
            {"\n"}
            <span className="text-zinc-500">/&gt;</span>
          </code>
        </pre>

        {/* Shimmer sweep — uses animate-shimmer from global theme */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>
    </div>
  );
}

/**
 * Header 2: "6 Layouts" — Icon grid with staggered hover glow
 */
const layoutItems = [
  { icon: Grid3X3, label: "Grid" },
  { icon: Columns3, label: "Carousel" },
  { icon: Layers, label: "Wall" },
  { icon: GalleryVerticalEnd, label: "Masonry" },
  { icon: LayoutList, label: "List" },
  { icon: Zap, label: "Marquee" },
] as const;

function LayoutSwitcherHeader() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % layoutItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="grid grid-cols-5 gap-3">
        {layoutItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={item.label}
              className="flex flex-col items-center justify-between"
              animate={{
                scale: isActive ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg border transition-all duration-300",
                  isActive
                    ? "border-cyan-500/50 bg-slate-800 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-500",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-cyan-400" : "text-zinc-600",
                )}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Header 3: "Moderation" — Mock testimonial with approve/reject overlay
 */
function ModerationHeader() {
  const [isApproved, setIsApproved] = useState(false);

  return (
    <div className="relative flex h-full items-center justify-center px-4">
      {/* Mock testimonial card */}
      <div className="relative w-full max-w-[220px] rounded-lg border border-zinc-700/50 bg-zinc-800 p-3">
        {/* Stars */}
        <div className="mb-2 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-3 w-3 fill-amber-400/50 text-amber-400/50"
            />
          ))}
        </div>
        {/* Blurred "inappropriate" text */}
        <div className="mb-3 space-y-1">
          <div className="h-2 w-full rounded bg-zinc-600/40 blur-[2px]" />
          <div className="h-2 w-3/4 rounded bg-zinc-600/40 blur-[2px]" />
          <div className="h-2 w-1/2 rounded bg-red-500/20 blur-[3px]" />
        </div>
        <div className="text-[10px] text-red-400/70 font-mono">
          ⚠ Flagged for review
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <motion.button
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors",
              isApproved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-emerald-500/10 text-emerald-400/70 border border-zinc-700 hover:bg-emerald-500/20",
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsApproved(!isApproved)}
          >
            <Check className="h-3 w-3" />
            {isApproved ? "Approved" : "Approve"}
          </motion.button>
          <motion.button
            className="flex flex-1 items-center justify-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-3 w-3" />
            Reject
          </motion.button>
        </div>
      </div>

      {/* Approval badge overlay */}
      <AnimatePresence>
        {isApproved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-2 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
          >
            <Check className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Header 4: "Realtime" — Live feed with items popping in from top
 */
const realtimeFeed = [
  { initials: "JD", text: "Amazing tool! Saved me hours.", stars: 5 },
  { initials: "SK", text: "Works perfectly with Next.js", stars: 5 },
  { initials: "AL", text: "Love the dark mode support", stars: 4 },
  { initials: "MR", text: "Best testimonial widget ever", stars: 5 },
  { initials: "TP", text: "Setup took 30 seconds flat", stars: 5 },
];

function RealtimeFeedHeader() {
  const [visibleItems, setVisibleItems] = useState([0]);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % realtimeFeed.length;
      setVisibleItems((prev) => {
        const next = [current, ...prev];
        return next.slice(0, 3); // keep max 3 visible
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col px-3 py-2">
      {/* Live indicator bar */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Notifications
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">3 new</span>
      </div>

      {/* Feed items */}
      <div className="flex-1 space-y-1.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((itemIndex, i) => {
            const item = realtimeFeed[itemIndex]!;
            return (
              <motion.div
                key={`${itemIndex}-${i}`}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  duration: 1,
                }}
                className="flex items-center gap-2 rounded-md border border-zinc-700/50 bg-zinc-800 p-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(item.stars)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-2 w-2 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="truncate text-[10px] text-zinc-400">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ==========================================================================
   BENTO ITEM WRAPPER — Combines SpotlightCard with BentoGridItem layout
   ========================================================================== */

function BentoFeatureCard({
  className,
  title,
  description,
  header,
  icon,
  spotlightVariant = "default",
}: {
  className?: string;
  title: string;
  description: string;
  header: React.ReactNode;
  icon: React.ReactNode;
  spotlightVariant?: SpotlightVariant;
}) {
  return (
    <SpotlightCard variant={spotlightVariant} className={cn("p-0", className)}>
      <div className="flex h-full flex-col justify-between p-4">
        {/* Header visual — the main graphic area */}
        <div className="mb-4 min-h-0 flex-1">{header}</div>

        {/* Text content — slides right on hover */}
        <div className="transition duration-200 group-hover/spotlight:translate-x-2">
          {icon}
          <div className="mt-2 mb-1 font-sans text-base font-bold text-zinc-100">
            {title}
          </div>
          <div className="font-sans text-sm font-normal leading-relaxed text-zinc-400">
            {description}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

/* ==========================================================================
   FEATURES SECTION — Main export
   ========================================================================== */

export function Features() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeader
          title="Everything you need. Nothing you don't."
          description="Collect, moderate, and display testimonials. No complexity, no bloat."
        />

        {/* Bento Grid — 3-column layout with SpotlightCard + CanvasReveal */}
        <BentoGrid className="md:auto-rows-[22rem]">
          {/* Item 1 (wide): Embed Anywhere — Code Window */}
          <BentoFeatureCard
            className="md:col-span-2"
            spotlightVariant="default"
            title="Embed anywhere"
            description="One script tag. Any framework. React, Vue, Svelte, plain HTML — it just works."
            icon={<Code2 className="h-5 w-5 text-primary" />}
            header={<CodeWindowHeader />}
          />

          {/* Item 2: 6 Layouts — Visual Switcher */}
          <BentoFeatureCard
            className="md:col-span-1"
            spotlightVariant="info"
            title="6 Layouts"
            description="Grid, carousel, wall, masonry, list, or marquee. One prop change."
            icon={<LayoutGrid className="h-5 w-5 text-cyan-400" />}
            header={<LayoutSwitcherHeader />}
          />

          {/* Item 3: Moderation — Approve Action */}
          <BentoFeatureCard
            className="md:col-span-1"
            spotlightVariant="action"
            title="Auto-moderation"
            description="Heuristic content filtering with spam and profanity detection. One-click approve or reject."
            icon={<Shield className="h-5 w-5 text-amber-400" />}
            header={<ModerationHeader />}
          />

          {/* Item 4 (wide): Notifications — Live Feed */}
          <BentoFeatureCard
            className="md:col-span-2"
            spotlightVariant="pulse"
            title="Instant notifications"
            description="Get notified when new testimonials arrive via in-app alerts. Never miss a review."
            icon={<Zap className="h-5 w-5 text-emerald-400" />}
            header={<RealtimeFeedHeader />}
          />
        </BentoGrid>
      </div>
    </section>
  );
}
