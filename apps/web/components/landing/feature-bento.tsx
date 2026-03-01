"use client";

import { CardSpotlight } from "@/components/landing/card-spotlight";
import { LayoutGrid, Shield, ActivitySquare, Palette } from "lucide-react";

export function FeatureBento() {
  return (
    <section id="features" className="py-32 relative bg-[#050505]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-6">
            Powerful features, <br /> beautiful execution.
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto font-sans">
            Tresta provides an end-to-end toolkit. Every detail has been
            engineered to look premium and convert seamlessly.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Block - Embed Layouts */}
          <CardSpotlight
            className="md:col-span-2 min-h-[400px] flex flex-col"
            color="rgba(37,99,235,0.15)"
            revealColors={[[37, 99, 235]]}
          >
            <div className="p-8 flex flex-col h-full z-10 relative">
              <div className="mb-auto">
                <div className="flex items-center space-x-2 text-primary mb-4">
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    6 Layout Engines
                  </span>
                </div>
                <h3 className="text-2xl font-medium text-zinc-100 mb-2">
                  Embed anywhere instantly.
                </h3>
                <p className="text-zinc-400 max-w-md">
                  Carousel, Masonry, Grid, Wall, List, and Marquee. Swap layouts
                  on the fly without changing a single line of code.
                </p>
              </div>

              {/* Visual Abstract - Tabs representing layouts */}
              <div className="mt-8 flex gap-2 overflow-hidden items-end h-32 opacity-80 border-t border-white/5 pt-6">
                <div className="w-1/3 h-full bg-zinc-900 rounded-t-lg border-x border-t border-white/5 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2 p-4 w-full h-full opacity-50">
                    <div className="bg-zinc-800 rounded w-full h-full" />
                    <div className="bg-zinc-800 rounded w-full h-full" />
                  </div>
                </div>
                <div className="w-1/3 h-3/4 bg-zinc-900 rounded-t-lg border-x border-t border-white/5 flex items-center justify-center relative translate-y-4">
                  <div className="flex flex-col gap-2 p-4 w-full h-full opacity-40">
                    <div className="bg-zinc-800 rounded w-full h-4" />
                    <div className="bg-zinc-800 rounded w-full h-4" />
                  </div>
                </div>
                <div className="w-1/3 h-1/2 bg-zinc-900 rounded-t-lg border-x border-t border-white/5 flex items-center justify-center relative translate-y-8">
                  <div className="flex gap-2 p-2 w-full h-full opacity-30">
                    <div className="bg-zinc-800 rounded w-8 h-8" />
                    <div className="bg-zinc-800 rounded w-full h-8" />
                  </div>
                </div>
              </div>
            </div>
          </CardSpotlight>

          {/* Medium Block - OAuth Badge */}
          <CardSpotlight
            className="min-h-[400px] flex flex-col"
            color="rgba(34,197,94,0.1)"
            revealColors={[[34, 197, 94]]}
          >
            <div className="p-8 flex flex-col h-full z-10 relative items-center justify-center text-center">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-6 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
                  <Shield className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-zinc-100 mb-2">
                  Verified Authentic.
                </h3>
                <p className="text-zinc-400 text-sm">
                  Every testimonial can be verified via Google OAuth, proving
                  your social proof is real to your buyers.
                </p>
              </div>
            </div>
          </CardSpotlight>

          {/* Small Block 1 - Auto-Moderation */}
          <CardSpotlight
            className="min-h-[300px]"
            color="rgba(239,68,68,0.1)"
            revealColors={[[239, 68, 68]]}
          >
            <div className="p-8 h-full z-10 relative">
              <div className="flex items-center space-x-2 text-rose-500 mb-4">
                <ActivitySquare className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  AI Moderation
                </span>
              </div>
              <h3 className="text-xl font-medium text-zinc-100 mb-2">
                Spam is dead.
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                Built-in sentiment analysis and risk scoring catches spam before
                it hits your dashboard.
              </p>

              {/* Media Element: Abstract glowing chart */}
              <div className="w-full h-24 bg-zinc-900 rounded-lg border border-white/5 relative overflow-hidden flex items-end p-2 gap-1 px-4">
                <div className="w-full bg-rose-500/20 h-[30%] rounded-t-sm" />
                <div className="w-full bg-rose-500/40 h-[60%] rounded-t-sm" />
                <div className="w-full bg-green-500/60 h-[90%] rounded-t-sm shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                <div className="w-full bg-green-500/80 h-[100%] rounded-t-sm shadow-[0_0_20px_rgba(34,197,94,0.8)]" />
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ActivitySquare className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </CardSpotlight>

          {/* Small Block 2 - Customization */}
          <CardSpotlight
            className="md:col-span-2 min-h-[300px]"
            color="rgba(168,85,247,0.1)"
            revealColors={[[168, 85, 247]]}
          >
            <div className="p-8 h-full z-10 relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-purple-500 mb-4">
                  <Palette className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Deep Theming
                  </span>
                </div>
                <h3 className="text-xl font-medium text-zinc-100 mb-2">
                  Matches your brand effortlessly.
                </h3>
                <p className="text-zinc-400 text-sm">
                  Customize colors, radius, fonts, and dark mode behavior via
                  data attributes. It drops into your existing design system
                  like it was natively built.
                </p>
              </div>
              <div className="flex-1 w-full bg-background rounded-lg border border-white/10 p-4 shadow-xl">
                <div className="flex gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-500 ring-2 ring-white/20 ring-offset-2 ring-offset-black" />
                  <div className="w-6 h-6 rounded-full bg-emerald-500" />
                  <div className="w-6 h-6 rounded-full bg-rose-500" />
                  <div className="w-6 h-6 rounded-full bg-purple-500" />
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full mb-2" />
                <div className="h-2 w-2/3 bg-zinc-800 rounded-full" />
              </div>
            </div>
          </CardSpotlight>
        </div>
      </div>
    </section>
  );
}
