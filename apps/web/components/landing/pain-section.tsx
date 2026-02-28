"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Star, Check } from "lucide-react";

/**
 * Pain Section — "Screenshot Scatter → Collapse"
 *
 * Shows 4 mock screenshot thumbnails (slightly rotated, overlapping, low opacity)
 * representing "the old way." When the section scrolls 30% into view, they
 * collapse to center (translate + scale(0) + opacity(0)), staggered 60ms.
 * A clean Tresta widget card then fades in from scale(0.9).
 *
 * Tech: Motion whileInView (not GSAP). Duration-based, 800ms.
 */

const screenshots = [
  {
    id: 1,
    rotate: -12,
    x: -120,
    y: -30,
    label: "screenshot_tweet_01.png",
  },
  {
    id: 2,
    rotate: 6,
    x: 80,
    y: -50,
    label: "review_slack_dm.png",
  },
  {
    id: 3,
    rotate: -4,
    x: -60,
    y: 40,
    label: "email_feedback_03.png",
  },
  {
    id: 4,
    rotate: 10,
    x: 100,
    y: 30,
    label: "twitter_mention.png",
  },
];

function ScreenshotThumbnail({
  rotate,
  x,
  y,
  label,
  index,
  collapsed,
  reduced,
}: {
  rotate: number;
  x: number;
  y: number;
  label: string;
  index: number;
  collapsed: boolean;
  reduced: boolean;
}) {
  const scatteredState = {
    x,
    y,
    rotate,
    scale: 1,
    opacity: 0.6,
  };

  const collapsedState = {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 0,
    opacity: 0,
  };

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -ml-[80px] -mt-[60px] sm:-ml-[100px] sm:-mt-[75px] w-[160px] sm:w-[200px] aspect-[4/3] rounded-lg border border-[#2a2e38] bg-[#1a1d25] overflow-hidden"
      animate={collapsed && !reduced ? collapsedState : scatteredState}
      transition={
        reduced
          ? { duration: 0 }
          : {
              duration: 0.8,
              delay: collapsed ? index * 0.06 : 0,
              ease: [0.32, 0.72, 0, 1],
            }
      }
    >
      {/* Simulated screenshot content */}
      <div className="flex items-center gap-1.5 border-b border-[#2a2e38] px-3 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500/50" />
        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50" />
        <div className="h-1.5 w-1.5 rounded-full bg-green-500/50" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-2 w-3/4 rounded bg-[#2a2e38]" />
        <div className="h-2 w-1/2 rounded bg-[#2a2e38]" />
        <div className="h-2 w-2/3 rounded bg-[#2a2e38]" />
      </div>
      <div className="absolute bottom-2 left-3 text-[9px] font-mono text-[#8b8f99]/50">
        {label}
      </div>
    </motion.div>
  );
}

export function PainSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;

  return (
    <section className="bg-[#08090d] py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#e8eaed] sm:text-4xl">
            You&apos;ve shipped the product.
            <br />
            <span className="text-[#8b8f99]">Now you need social proof.</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-[#8b8f99]">
            Stop hoarding screenshots. Let Tresta handle it.
          </p>
        </div>

        {/* Scatter → Collapse Area */}
        <div
          ref={ref}
          className="relative mx-auto max-w-2xl"
          style={{ height: "360px" }}
        >
          {/* Scattered screenshots */}
          {screenshots.map((s, i) => (
            <ScreenshotThumbnail
              key={s.id}
              rotate={s.rotate}
              x={s.x}
              y={s.y}
              label={s.label}
              index={i}
              collapsed={isInView}
              reduced={reduced}
            />
          ))}

          {/* Clean Tresta widget card — fades in after collapse */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 0.6,
                    delay: isInView ? 0.5 : 0,
                    ease: [0.32, 0.72, 0, 1],
                  }
            }
          >
            <div className="w-full max-w-sm rounded-xl border border-[#2a2e38] bg-[#111318] p-5 shadow-2xl shadow-black/30">
              <div className="mb-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-4 text-sm text-[#e8eaed] leading-relaxed">
                &ldquo;Set it up in 10 minutes. Haven&apos;t touched it since.
                It just works.&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#60a5fa]/10 flex items-center justify-center text-xs font-medium text-[#60a5fa]">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e8eaed]">
                      @shipfast_dev
                    </p>
                    <p className="text-xs text-[#8b8f99]">Indie Hacker</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Caption below */}
        <motion.p
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.4, delay: isInView ? 1.0 : 0 }
          }
          className="mt-8 text-center text-sm text-[#8b8f99]"
        >
          From scattered chaos to polished social proof — in one line of code.
        </motion.p>
      </div>
    </section>
  );
}
