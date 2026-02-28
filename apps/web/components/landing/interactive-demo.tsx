"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@workspace/ui/components/button";
import {
  Moon,
  Sun,
  LayoutGrid,
  List,
  Columns,
  GalleryHorizontal,
  Heart,
  Star,
  MoveRight,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { BorderBeam, BorderBeamStyles } from "./border-beam";

/* ── Sample Testimonials ──────────────────────────────────────────── */

const sampleTestimonials = [
  {
    id: 1,
    initials: "JD",
    name: "Jane D.",
    role: "Developer",
    content:
      "Super easy to set up. Had testimonials on my site in under 5 minutes.",
    rating: 5,
  },
  {
    id: 2,
    initials: "AS",
    name: "Alex S.",
    role: "Founder",
    content:
      "The widget layouts look great and match our brand perfectly. Love the dark mode!",
    rating: 5,
  },
  {
    id: 3,
    initials: "MK",
    name: "Maria K.",
    role: "Designer",
    content:
      "Finally a testimonial tool that doesn't look like it's from 2010. Beautiful design.",
    rating: 5,
  },
  {
    id: 4,
    initials: "RJ",
    name: "Raj J.",
    role: "Product Manager",
    content:
      "The AI moderation saved us so much time. No more spam testimonials.",
    rating: 4,
  },
];

/* ── Layout Options ───────────────────────────────────────────────── */

type LayoutType = "grid" | "list" | "carousel" | "masonry" | "wall" | "marquee";

const layoutOptions: {
  id: LayoutType;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "carousel", label: "Carousel", icon: GalleryHorizontal },
  { id: "masonry", label: "Masonry", icon: Columns },
  { id: "wall", label: "Wall", icon: Heart },
  { id: "marquee", label: "Marquee", icon: MoveRight },
];

/* ── Star Rating ──────────────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-400 text-amber-400" : "text-[#2a2e38]",
          )}
        />
      ))}
    </div>
  );
}

/* ── Embed Code Block ─────────────────────────────────────────────── */

function EmbedCode() {
  const [copied, setCopied] = useState(false);

  const code = `<script src="https://api.tresta.app/widget/tresta-widget.js"
  data-tresta-widget="your-widget-id"
  data-api-key="your-api-key">
</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-[#2a2e38] bg-[#0c0e12] p-4 font-mono text-xs text-[#8b8f99]">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-[#2a2e38] bg-[#111318] px-2 py-1 text-[10px] text-[#8b8f99] transition-colors hover:text-[#e8eaed] hover:border-[#3a3e48]"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
      <pre className="overflow-x-auto pr-20">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ── Interactive Demo (Widget Theater) ────────────────────────────── */

export function InteractiveDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [layout, setLayout] = useState<LayoutType>("grid");
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;

  const getGridClasses = () => {
    switch (layout) {
      case "grid":
        return "grid-cols-1 md:grid-cols-2";
      case "list":
        return "grid-cols-1 max-w-2xl mx-auto";
      case "carousel":
        return "grid-cols-1 md:grid-cols-3 overflow-x-auto";
      case "masonry":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "wall":
        return "grid-cols-2 md:grid-cols-4";
      case "marquee":
        return "grid-cols-1 md:grid-cols-3 overflow-x-hidden";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <section
      id="interactive-demo"
      className="bg-[#08090d] px-4 py-24 md:px-8 md:py-32"
    >
      <BorderBeamStyles />

      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl font-bold tracking-tighter text-[#e8eaed] sm:text-4xl md:text-5xl">
            See it in action
          </h2>
          <p className="max-w-[600px] text-lg text-[#8b8f99]">
            Choose a layout, toggle themes, and see exactly how your
            testimonials will look.
          </p>
        </div>

        {/* Widget Theater Container — center-stage with border beam */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.32, 0.72, 0, 1] }
          }
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-[#2a2e38] bg-[#111318] shadow-2xl shadow-black/40"
        >
          {/* Border Beam — orbits the widget theater */}
          <BorderBeam
            size={100}
            duration={5}
            colorFrom="#60a5fa"
            colorTo="rgba(96,165,250,0.2)"
          />

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a2e38] bg-[#0c0e12] p-3 sm:p-4 sm:gap-4">
            {/* Live badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-[#8b8f99]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live Preview
              </span>
            </div>

            {/* Layout Selector */}
            <div className="flex items-center gap-0.5 overflow-x-auto">
              {layoutOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLayout(option.id)}
                  className={cn(
                    "h-7 gap-1.5 text-xs",
                    layout === option.id
                      ? "bg-[#60a5fa]/10 text-[#60a5fa] hover:bg-[#60a5fa]/20 hover:text-[#60a5fa]"
                      : "text-[#8b8f99] hover:text-[#e8eaed] hover:bg-[#1a1d25]",
                  )}
                >
                  <option.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              ))}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-7 gap-2 text-xs text-[#8b8f99] hover:text-[#e8eaed] hover:bg-[#1a1d25]"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>
          </div>

          {/* Preview Area */}
          <div
            className="min-h-[400px] p-6 transition-colors duration-300"
            style={
              {
                backgroundColor: theme === "dark" ? "#0c0e12" : "#f8f9fa",
                "--preview-bg": theme === "dark" ? "#111318" : "#ffffff",
                "--preview-border": theme === "dark" ? "#2a2e38" : "#e5e5e5",
                "--preview-fg": theme === "dark" ? "#e8eaed" : "#0a0a0a",
                "--preview-muted": theme === "dark" ? "#8b8f99" : "#737373",
              } as React.CSSProperties
            }
          >
            <div className={cn("grid gap-4", getGridClasses())}>
              {sampleTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="rounded-lg border p-5 transition-all duration-300"
                  style={{
                    borderColor: "var(--preview-border)",
                    backgroundColor: "var(--preview-bg)",
                  }}
                >
                  <StarRating rating={testimonial.rating} />
                  <p
                    className="my-4 text-sm leading-relaxed"
                    style={{ color: "var(--preview-muted)" }}
                  >
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(96,165,250,0.1)"
                            : "rgba(59,130,246,0.1)",
                        color: theme === "dark" ? "#60a5fa" : "#3b82f6",
                      }}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--preview-fg)" }}
                      >
                        {testimonial.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--preview-muted)" }}
                      >
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Embed Code below the theater */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mt-6 max-w-2xl"
        >
          <EmbedCode />
        </motion.div>

        {/* Call to action */}
        <p className="mt-8 text-center text-sm text-[#8b8f99]">
          All 6 layouts are available in the free plan
        </p>
      </div>
    </section>
  );
}
