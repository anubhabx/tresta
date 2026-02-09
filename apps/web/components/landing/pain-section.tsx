"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Problem/Solution Section - Before / After Comparison
 *
 * A borderless, immersive before/after reveal. The cursor drives a subtle
 * divider that splits "The Old Way" (blurred, desaturated) from
 * "The Tresta Way" (vibrant, solid background). The divider is sticky —
 * it stays wherever the user leaves it.
 */
export function PainSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const calcPosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => calcPosition(e.clientX),
    [calcPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) calcPosition(touch.clientX);
    },
    [calcPosition]
  );

  return (
    <section className="bg-zinc-950 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            You&apos;ve shipped the product.
            <br />
            <span className="text-zinc-400">Now you need social proof.</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-zinc-400">
            Sweep your mouse across to see the difference.
          </p>
        </div>

        {/* Slider Comparison */}
        <div className="mx-auto max-w-4xl">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative cursor-ew-resize overflow-hidden"
            style={{ height: "400px" }}
          >
            {/* OLD WAY - Left side (always visible underneath) */}
            <div
              className="absolute inset-0 p-6"
              style={{ filter: "blur(0.5px) saturate(0.3)" }}
            >
              <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                The old way
              </div>
              <div className="space-y-4">
                {/* Ugly HTML mockup */}
                <pre className="rounded-lg bg-zinc-800/60 p-4 font-mono text-xs text-zinc-500 overflow-x-auto">
                  {`<!-- Your "testimonials" section -->
<div class="testimonials">
  <img src="/screenshots/tweet1.png" />
  <img src="/screenshots/tweet2.png" />
  <img src="/screenshots/tweet3.png" />
  <!-- TODO: remember to update these -->
</div>

<!-- CSS you'll never finish -->
<style>
  .testimonials img {
    /* it's fine for now... */
    margin: 10px;
  }
</style>`}
                </pre>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Manual updates",
                    "No verification",
                    "Looks dated",
                    "Breaks on mobile"
                  ].map((issue) => (
                    <span
                      key={issue}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-800/50 px-3 py-1 text-xs text-zinc-500"
                    >
                      <X className="h-3 w-3 text-red-400/60" />
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TRESTA WAY - Right side (clips based on slider) */}
            <div
              className="absolute inset-0 bg-zinc-950"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                transition: "clip-path 100ms ease-out"
              }}
            >
              {/* Subtle radial glow overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 60% 50%, rgba(20,184,166,0.06) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)"
                }}
              />
              <div className="relative p-6">
                <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  The Tresta way
                </div>
                <div className="space-y-4">
                  {/* Clean script tag */}
                  <pre className="rounded-lg bg-zinc-900/40 border border-cyan-900/30 p-4 font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-zinc-400">&lt;</span>
                      <span className="text-cyan-400">script</span>
                      {"\n  "}
                      <span className="text-violet-400">src</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-yellow-300">
                        &quot;https://tresta.app/widget.js&quot;
                      </span>
                      {"\n  "}
                      <span className="text-violet-400">data-project</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-yellow-300">
                        &quot;your-project&quot;
                      </span>
                      {"\n"}
                      <span className="text-zinc-400">&gt;&lt;/</span>
                      <span className="text-cyan-400">script</span>
                      <span className="text-zinc-400">&gt;</span>
                    </code>
                  </pre>

                  {/* Clean testimonial card preview */}
                  <div className="rounded-lg border border-cyan-800/30 bg-zinc-900/50 p-4">
                    <div className="mb-2 flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="mb-3 text-sm text-zinc-300">
                      &ldquo;Set it up in 10 minutes. It just works.&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">
                            @developer
                          </p>
                          <p className="text-xs text-zinc-500">Indie Hacker</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                        <Check className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Auto-updating",
                      "OAuth verified",
                      "5 layouts",
                      "Dark mode"
                    ].map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                      >
                        <Check className="h-3 w-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-20"
              style={{
                left: `${sliderPosition}%`,
                transition: "left 100ms ease-out"
              }}
            >
              {/* Thin vertical line */}
              <div className="absolute inset-y-0 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
            </div>
          </div>

          {/* Labels below */}
          <div className="mt-6 flex justify-between text-sm">
            <span className="text-zinc-600">← The old way</span>
            <span className="text-cyan-400">The Tresta way →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
