"use client";

import { Button } from "@workspace/ui/components/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Code2 } from "lucide-react";
import { CodeBlock } from "@workspace/ui/components/code-block";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { HeroGlow } from "@/components/ui/hero-glow";

/**
 * Sample testimonials that rotate in the hero
 * These demonstrate the product working in real-time
 */
const testimonials = [
  {
    id: 1,
    content:
      "Set it up in 10 minutes. Haven't touched it since. It just works.",
    author: "@shipfast_dev",
    badge: "GitHub",
    rating: 5,
    time: "2 seconds ago"
  },
  {
    id: 2,
    content:
      "Finally, testimonials that don't look like they're from the 2015 era.",
    author: "@indie_maker",
    badge: "Google",
    rating: 5,
    time: "just now"
  },
  {
    id: 3,
    content:
      "One script tag. Zero CSS headaches. This is how tools should work.",
    author: "@frontend_dev",
    badge: "GitHub",
    rating: 5,
    time: "5 seconds ago"
  },
  {
    id: 4,
    content: "The embed just works. Dark mode, light mode, any framework.",
    author: "@saas_founder",
    badge: "Google",
    rating: 5,
    time: "just now"
  }
];

function LiveTestimonialCard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonial = testimonials[currentIndex]!;

  return (
    <div className="relative w-full">
      {/* Notification-style incoming indicator */}
      <motion.div
        key={testimonial.id}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 1
        }}
        className="absolute -top-3 left-4 z-10"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          New testimonial
        </span>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg h-[200px]"
        >
          <div className="flex gap-1 mb-3">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
          </div>
          <p className="text-foreground text-lg leading-relaxed mb-4">
            &ldquo;{testimonial.content}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {testimonial.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-xs text-muted-foreground">
                  Verified via {testimonial.badge}
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {testimonial.time}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Timeline dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-transparent px-4 py-24 md:px-8 md:py-32">
      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-start text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Stop building your own
              <br />
              <span className="text-primary">testimonial slider.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 flex items-center gap-4 text-lg text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                Collect feedback
              </span>
              <span className="text-border">→</span>
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  2
                </span>
                One line of code
              </span>
              <span className="text-border">→</span>
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  3
                </span>
                Done
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Start collecting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="#integration">
                  <Code2 className="mr-2 h-4 w-4" />
                  See the code
                </Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              Free for your first 10 testimonials. No credit card required.
            </motion.p>
          </div>

          {/* Right Column - Live Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="relative"
          >
            <LiveTestimonialCard />

            {/* Code Snippet below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6"
            >
              <CodeBlock
                code={`<script src="https://tresta.app/widget.js"
  data-project="your-project"
  data-layout="carousel">
</script>`}
                language="html"
                copyable
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Atmospheric hero glow — subtle radial gradients behind the hero */}
      <HeroGlow />

      {/* Bottom edge divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
