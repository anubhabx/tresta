"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Problem/Solution Section - Slider Comparison
 *
 * Stability First: All content visible by default, slider is enhancement only.
 * Uses zinc color palette with proper contrast.
 */
export function PainSection() {
  const [sliderPosition, setSliderPosition] = useState(50);

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
            Drag the slider to see the difference.
          </p>
        </div>

        {/* Slider Comparison */}
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            style={{ height: "400px" }}
          >
            {/* OLD WAY - Left side (always visible underneath) */}
            <div className="absolute inset-0 p-6">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                The old way
              </div>
              <div className="space-y-4">
                {/* Ugly HTML mockup */}
                <pre className="rounded-lg bg-zinc-800 p-4 font-mono text-xs text-zinc-400 overflow-x-auto">
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
                    "Breaks on mobile",
                  ].map((issue) => (
                    <span
                      key={issue}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
                    >
                      <X className="h-3 w-3 text-red-400" />
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TRESTA WAY - Right side (clips based on slider) */}
            <div
              className="absolute inset-0 border-r-2 border-primary bg-zinc-950 p-6"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                The Tresta way
              </div>
              <div className="space-y-4">
                {/* Clean script tag */}
                <pre className="rounded-lg bg-zinc-900 border border-zinc-700 p-4 font-mono text-xs overflow-x-auto">
                  <code>
                    <span className="text-zinc-500">&lt;</span>
                    <span className="text-emerald-400">script</span>
                    {"\n  "}
                    <span className="text-sky-400">src</span>
                    <span className="text-zinc-500">=</span>
                    <span className="text-amber-400">
                      &quot;https://tresta.app/widget.js&quot;
                    </span>
                    {"\n  "}
                    <span className="text-sky-400">data-project</span>
                    <span className="text-zinc-500">=</span>
                    <span className="text-amber-400">
                      &quot;your-project&quot;
                    </span>
                    {"\n"}
                    <span className="text-zinc-500">&gt;&lt;/</span>
                    <span className="text-emerald-400">script</span>
                    <span className="text-zinc-500">&gt;</span>
                  </code>
                </pre>

                {/* Clean testimonial card preview */}
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
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
                    "Dark mode",
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

            {/* Slider Handle */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
              aria-label="Comparison slider"
            />
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-20 w-1 bg-primary"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-zinc-900 p-2">
                <div className="flex gap-0.5">
                  <div className="h-4 w-0.5 rounded-full bg-primary" />
                  <div className="h-4 w-0.5 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Labels below */}
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-zinc-500">← The old way</span>
            <span className="text-primary">The Tresta way →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
