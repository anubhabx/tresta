"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, ChevronRight, StarsIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Spotlight } from "@/components/landing/ui/spotlight";

const WidgetPreview = dynamic(
  () =>
    import("@/components/widgets/widget-preview").then(
      (mod) => mod.WidgetPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center text-zinc-500 animate-pulse bg-zinc-900/50 rounded-lg" />
    ),
  },
);

type LayoutType = "carousel" | "grid" | "masonry" | "wall" | "list" | "marquee";

export function HeroSection() {
  const [layout, setLayout] = useState<LayoutType>("carousel");

  return (
    <section className="relative bg-transparent overflow-hidden w-full pt-32 md:pt-40 pb-20">
      <Spotlight />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* MVP Pill */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-md border border-white/10 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <span className="text-sm font-medium tracking-tight text-zinc-300 flex items-center">
              <span className="text-primary mr-2">
                <StarsIcon size={16} />
              </span>
              Tresta MVP is Live
            </span>
          </div>

          {/* Headline - Using explicitly imported serif or system serif fallback */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight text-white leading-[1.1]">
              Social proof <br className="hidden md:block" />
              <span className="text-zinc-500 italic">on autopilot.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
              Collect, moderate, and embed beautiful testimonials in minutes.
              Engineered for performance, designed for conversion.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <Button
              size="lg"
              className="rounded-md w-full sm:w-auto px-8 h-12 bg-primary hover:bg-primary/90 text-white font-medium transition-all"
            >
              <Link href="/sign-up" className="flex items-center">
                Start For Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-md w-full sm:w-auto px-8 h-12 text-zinc-300 hover:text-white hover:border border-transparent hover:border-white/10 transition-all"
              asChild
            >
              <Link href="/pricing" className="flex items-center">
                View Pricing
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Widget Theater - Floating 3D Component */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.4,
            type: "spring",
            stiffness: 40,
            damping: 20,
          }}
          className="mt-20 md:mt-32 max-w-5xl mx-auto"
          style={{ perspective: "1000px" }}
        >
          <div className="relative rounded-lg border border-white/10  backdrop-blur-xl p-2 shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {/* Fake IDE Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-3 border-b border-white/5 gap-4">
              <div className="flex w-full lg:w-1/4 items-center justify-center lg:justify-start space-x-2">
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                <div className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] sm:text-[11px] font-mono tracking-wider w-full lg:w-2/4">
                <button
                  onClick={() => setLayout("carousel")}
                  className={cn(
                    "transition-colors uppercase hover:text-white",
                    layout === "carousel"
                      ? "text-primary font-bold"
                      : "text-zinc-500",
                  )}
                >
                  Carousel
                </button>
                <span className="text-zinc-800 hidden sm:inline">|</span>
                <button
                  onClick={() => setLayout("grid")}
                  className={cn(
                    "transition-colors uppercase hover:text-white",
                    layout === "grid"
                      ? "text-primary font-bold"
                      : "text-zinc-500",
                  )}
                >
                  Grid
                </button>
                <span className="text-zinc-800 hidden sm:inline">|</span>
                <button
                  onClick={() => setLayout("masonry")}
                  className={cn(
                    "transition-colors uppercase hover:text-white",
                    layout === "masonry"
                      ? "text-primary font-bold"
                      : "text-zinc-500",
                  )}
                >
                  Masonry
                </button>
                <span className="text-zinc-800 hidden sm:inline">|</span>
                <button
                  onClick={() => setLayout("list")}
                  className={cn(
                    "transition-colors uppercase hover:text-white",
                    layout === "list"
                      ? "text-primary font-bold"
                      : "text-zinc-500",
                  )}
                >
                  List
                </button>
                <span className="text-zinc-800 hidden sm:inline">|</span>
                <button
                  onClick={() => setLayout("wall")}
                  className={cn(
                    "transition-colors uppercase hover:text-white",
                    layout === "wall"
                      ? "text-primary font-bold"
                      : "text-zinc-500",
                  )}
                >
                  Wall of Love
                </button>
                <span className="text-zinc-800 hidden sm:inline">|</span>
                <button
                  onClick={() => setLayout("marquee")}
                  className={cn(
                    "transition-colors uppercase hover:text-white",
                    layout === "marquee"
                      ? "text-primary font-bold"
                      : "text-zinc-500",
                  )}
                >
                  Marquee
                </button>
              </div>
              <div className="hidden lg:block w-1/4" />{" "}
              {/* Spacer for balance */}
            </div>

            {/* The "Widget" Content */}
            <div className="p-0 sm:p-4 md:p-8 min-h-[400px] flex items-center justify-center bg-background relative overflow-hidden overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={layout}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full h-full transform scale-90 sm:scale-100 origin-top"
                >
                  <WidgetPreview
                    hideHeader
                    transparentBackground
                    config={{
                      layout: layout,
                      theme: "dark",
                      primaryColor: "#2563eb",
                      showRating: true,
                      showAvatar: true,
                      showBranding: false,
                      maxTestimonials: 6,
                      autoRotate: true,
                      rotateInterval: 4,
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
