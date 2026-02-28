"use client";

import { Button } from "@workspace/ui/components/button";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Star, Code2 } from "lucide-react";
import { CodeBlock } from "@workspace/ui/components/code-block";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { BorderBeam, BorderBeamStyles } from "./border-beam";
import { MorphingText } from "./morphing-text";

/* ── Testimonials Data ──────────────────────────────────────────── */

const testimonials = [
  {
    id: 1,
    content:
      "Set it up in 10 minutes. Haven't touched it since. It just works.",
    author: "@shipfast_dev",
    badge: "Google",
    rating: 5,
    time: "2 seconds ago",
  },
  {
    id: 2,
    content:
      "Finally, testimonials that don't look like they're from the 2015 era.",
    author: "@indie_maker",
    badge: "Google",
    rating: 5,
    time: "just now",
  },
  {
    id: 3,
    content:
      "One script tag. Zero CSS headaches. This is how tools should work.",
    author: "@frontend_dev",
    badge: "Google",
    rating: 5,
    time: "5 seconds ago",
  },
  {
    id: 4,
    content: "The embed just works. Dark mode, light mode, any framework.",
    author: "@saas_founder",
    badge: "Google",
    rating: 5,
    time: "just now",
  },
];

/* ── Word-by-Word Blur Reveal ───────────────────────────────────── */

function RevealWord({
  children,
  delay,
  reduced,
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
}) {
  return (
    <motion.span
      className="inline-block mr-[0.25em]"
      initial={
        reduced ? { opacity: 1 } : { opacity: 0, y: 8, filter: "blur(8px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              duration: 0.5,
              delay,
              ease: [0.32, 0.72, 0, 1],
            }
      }
    >
      {children}
    </motion.span>
  );
}

function RevealLine({
  words,
  baseDelay,
  className,
  reduced,
}: {
  words: string[];
  baseDelay: number;
  className?: string;
  reduced: boolean;
}) {
  return (
    <span className={cn("block", className)}>
      {words.map((word, i) => (
        <RevealWord key={i} delay={baseDelay + i * 0.12} reduced={reduced}>
          {word}
        </RevealWord>
      ))}
    </span>
  );
}

/* ── 3D Card Tilt ───────────────────────────────────────────────── */

function useTilt(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -6, y: x * 6 }); // ±3deg max
    },
    [enabled],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return { ref, tilt, handleMouseMove, handleMouseLeave };
}

/* ── Live Testimonial Card (Widget Theater) ─────────────────────── */

function LiveTestimonialCard({ reduced }: { reduced: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonial = testimonials[currentIndex]!;

  const cardVariants = reduced
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: 60 * direction, scale: 0.96 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: -60 * direction, scale: 0.96 },
      };

  return (
    <div className="relative w-full min-h-[220px]">
      {/* ── "New testimonial" pulse indicator ── */}
      <motion.div
        key={`badge-${testimonial.id}`}
        initial={reduced ? {} : { opacity: 0, y: -8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute -top-3 left-4 z-10"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          New testimonial
        </span>
      </motion.div>

      {/* ── Testimonial card ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={testimonial.id}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
            mass: 0.8,
          }}
          className="rounded-xl border border-[#2a2e38] bg-[#111318] p-6 shadow-lg"
        >
          <div className="mb-3 flex gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mb-4 min-h-[80px] text-lg leading-relaxed text-[#e8eaed]">
            &ldquo;{testimonial.content}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#60a5fa]/10 text-xs font-medium text-[#60a5fa]">
                {testimonial.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-[#e8eaed]">
                  {testimonial.author}
                </div>
                <div className="text-xs text-[#8b8f99]">
                  Verified via {testimonial.badge}
                </div>
              </div>
            </div>
            <span className="text-xs text-[#8b8f99]">{testimonial.time}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Timeline dots ── */}
      <div className="mt-4 flex justify-center gap-1.5">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentIndex
                ? "w-6 bg-[#60a5fa]"
                : "w-1.5 bg-[#8b8f99]/30 hover:bg-[#8b8f99]/50",
            )}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Code Block with Scan-Line Effect ───────────────────────────── */

function CodeBlockWithScanline({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <CodeBlock
        code={`<script src="https://api.tresta.app/widget/tresta-widget.js"
  data-tresta-widget="your-widget-id"
  data-api-key="your-api-key">
</script>`}
        language="html"
        copyable
      />

      {/* ── Scanning light effect ── */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-0 right-0 h-[2px] animate-scanline"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.5) 30%, rgba(96,165,250,0.7) 50%, rgba(96,165,250,0.5) 70%, transparent 100%)",
              boxShadow: "0 0 12px 3px rgba(96,165,250,0.15)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Shimmer Button Wrapper ─────────────────────────────────────── */

function ShimmerButton({
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <div className="group relative overflow-hidden rounded-md">
      <Button className={cn("relative z-10", className)} {...props}>
        {children}
      </Button>
      {/* Shimmer sweep on hover */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-md">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>
    </div>
  );
}

/* ── Hero Section ───────────────────────────────────────────────── */

export function Hero() {
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;

  const {
    ref: tiltRef,
    tilt,
    handleMouseMove,
    handleMouseLeave,
  } = useTilt(!reduced);

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#08090d] px-4 py-24 md:px-8 md:py-32">
      <BorderBeamStyles />

      <div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* ── Badge ── */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 200, damping: 18, delay: 0.1 }
          }
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2a2e38] bg-[#111318] px-4 py-1.5 text-sm text-[#8b8f99] shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free for your first 10 testimonials
          </span>
        </motion.div>

        {/* ── Headline — Instrument Serif italic ── */}
        <h1 className="mb-6 font-display text-4xl italic tracking-tight text-[#e8eaed] sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[1.08]">
          <RevealLine
            words={["Your", "customers", "are"]}
            baseDelay={0.2}
            reduced={reduced}
          />
          <RevealLine
            words={["already", "talking."]}
            baseDelay={0.6}
            reduced={reduced}
          />
          <RevealLine
            words={["Are", "you", "listening?"]}
            baseDelay={0.9}
            className="mt-2"
            reduced={reduced}
          />
        </h1>

        {/* ── Morphing text subheadline ── */}
        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.5, delay: 1.4, ease: [0.32, 0.72, 0, 1] }
          }
          className="mb-4 text-xl font-medium tracking-tight text-[#e8eaed]/80 sm:text-2xl"
        >
          Turn{" "}
          <MorphingText
            words={["screenshots", "tweets", "DMs"]}
            interval={2800}
            className="text-[#60a5fa]"
          />{" "}
          into revenue.
        </motion.p>

        {/* ── Description ── */}
        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 1.6 }}
          className="mb-8 max-w-xl text-lg text-[#8b8f99]"
        >
          Collect feedback, embed a widget, done. Works with React, Vue, Svelte,
          or plain HTML. No complexity, no bloat.
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 200, damping: 18, delay: 1.7 }
          }
          className="flex flex-col gap-3 sm:flex-row"
        >
          <ShimmerButton
            size="lg"
            className="h-12 px-8 text-base bg-[#60a5fa] hover:bg-[#60a5fa]/90 text-white"
            asChild
          >
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </ShimmerButton>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base border-[#2a2e38] text-[#e8eaed] hover:bg-[#1a1d25] hover:text-[#e8eaed]"
            asChild
          >
            <Link href="#interactive-demo">
              <Code2 className="mr-2 h-4 w-4" />
              See It Live ↓
            </Link>
          </Button>
        </motion.div>

        {/* ── Microcopy ── */}
        <motion.p
          initial={reduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 1.9 }}
          className="mt-4 text-sm text-[#8b8f99]/70"
        >
          No credit card required.
        </motion.p>
      </div>

      {/* ── Live Widget Theater ─────────────────────────────────── */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 100, damping: 16, delay: 2.0 }
        }
        className="container relative z-10 mx-auto mt-12 max-w-xl md:mt-16"
      >
        <div
          ref={tiltRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative transition-transform duration-200 ease-out rounded-xl overflow-hidden"
          style={{
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Border Beam — orbits the widget theater card */}
          <BorderBeam
            size={80}
            duration={4}
            colorFrom="#60a5fa"
            colorTo="rgba(96,165,250,0.3)"
          />

          <LiveTestimonialCard reduced={reduced} />

          {/* ── Code snippet with scan-line ── */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.5, delay: 2.4 }
            }
            className="mt-6"
          >
            <CodeBlockWithScanline reduced={reduced} />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Breathing Radial Glow ───────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-[60%] w-[60%] rounded-full blur-[120px]",
            !reduced && "animate-breathe",
          )}
          style={{ backgroundColor: "rgba(96, 165, 250, 0.04)" }}
        />
      </div>

      {/* ── Bottom edge divider ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2e38] to-transparent" />
    </section>
  );
}
