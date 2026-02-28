"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  Code2,
  LayoutGrid,
  Shield,
  Zap,
  Palette,
  BarChart3,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/* ── Feature Data ─────────────────────────────────────────────────── */

const features = [
  {
    number: "01",
    title: "Embed Anywhere",
    description:
      "One script tag. Any framework — React, Vue, Svelte, plain HTML. Drop it in, it just works.",
    icon: Code2,
  },
  {
    number: "02",
    title: "6 Stunning Layouts",
    description:
      "Grid, carousel, wall, masonry, list, or marquee. Switch with a single prop. All responsive, all beautiful.",
    icon: LayoutGrid,
  },
  {
    number: "03",
    title: "Smart Moderation",
    description:
      "Heuristic content filtering catches spam and profanity before you see it. One-click approve or reject.",
    icon: Shield,
  },
  {
    number: "04",
    title: "Realtime Updates",
    description:
      "New testimonials appear instantly. No page refresh, no manual update. Your social proof stays current.",
    icon: Zap,
  },
  {
    number: "05",
    title: "Custom Branding",
    description:
      "Match your brand perfectly. Custom colors, fonts, border radius, dark mode — all via simple configuration.",
    icon: Palette,
  },
  {
    number: "06",
    title: "Analytics & Insights",
    description:
      "See which testimonials drive the most engagement. Track views, clicks, and conversions per widget.",
    icon: BarChart3,
  },
];

/* ── Spotlight Hover Effect ───────────────────────────────────────── */

function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return {
    ref,
    position,
    isHovered,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  };
}

/* ── Feature Item ─────────────────────────────────────────────────── */

function FeatureItem({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;
  const spotlight = useSpotlight();
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.5, delay: index * 0.08, ease: [0.32, 0.72, 0, 1] }
      }
    >
      <div
        ref={spotlight.ref}
        {...spotlight.handlers}
        className="group relative overflow-hidden rounded-xl border border-[#2a2e38] bg-[#111318] p-6 transition-colors duration-300 hover:border-[#3a3e48]"
      >
        {/* Spotlight radial gradient */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: spotlight.isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${spotlight.position.x}px ${spotlight.position.y}px, rgba(96,165,250,0.06), transparent 60%)`,
          }}
        />

        <div className="relative z-10 flex items-start gap-5">
          {/* Number — Cormorant Garamond */}
          <span className="flex-shrink-0 font-editorial text-5xl leading-none text-[#60a5fa]/20 transition-colors duration-300 group-hover:text-[#60a5fa]/40 md:text-6xl">
            {feature.number}
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
              <h3 className="text-lg font-semibold text-[#e8eaed]">
                {feature.title}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-[#8b8f99]">
              {feature.description}
            </p>

            {/* Accent bar — extends on hover */}
            <div className="mt-4 h-[2px] w-8 rounded-full bg-[#60a5fa]/20 transition-all duration-500 group-hover:w-16 group-hover:bg-[#60a5fa]/50" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Features Section ─────────────────────────────────────────────── */

export function Features() {
  return (
    <section id="features" className="relative bg-[#08090d] py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header — Observatory styled */}
        <div className="mb-16 flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl font-bold tracking-tighter text-[#e8eaed] sm:text-4xl md:text-5xl">
            Everything you need.{" "}
            <span className="text-[#8b8f99]">Nothing you don&apos;t.</span>
          </h2>
          <p className="max-w-[600px] text-lg text-[#8b8f99]">
            Collect, moderate, and display testimonials with zero complexity.
          </p>
        </div>

        {/* Numbered Editorial List */}
        <div className="mx-auto max-w-3xl space-y-4">
          {features.map((feature, i) => (
            <FeatureItem key={feature.number} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom gradient divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2e38] to-transparent" />
    </section>
  );
}
