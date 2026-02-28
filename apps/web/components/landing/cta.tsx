"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BorderBeam, BorderBeamStyles } from "./border-beam";

export function CTA() {
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;

  return (
    <section className="relative overflow-hidden bg-[#08090d] px-4 py-24 md:px-8 md:py-32">
      <BorderBeamStyles />

      {/* Breathing background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(96,165,250,0.06) 0%, transparent 70%)",
          animation: reduced ? "none" : "breathe 6s ease-in-out infinite",
        }}
      />

      <div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* CTA Card with border beam */}
        <div className="relative w-full rounded-2xl border border-border bg-card p-10 md:p-14">
          <BorderBeam
            size={80}
            duration={6}
            colorFrom="#60a5fa"
            colorTo="rgba(96,165,250,0.15)"
          />

          <motion.h2
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-4 font-display text-3xl italic text-foreground sm:text-4xl md:text-5xl"
          >
            Ready to stop screenshotting tweets?
          </motion.h2>

          <motion.p
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.5, delay: 0.1 }
            }
            viewport={{ once: true }}
            className="mb-8 max-w-xl mx-auto text-lg text-muted-foreground"
          >
            Free for your first 10 testimonials. No credit card required.
          </motion.p>

          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.5, delay: 0.2 }
            }
            viewport={{ once: true }}
            className="flex flex-col gap-3 sm:flex-row items-center justify-center"
          >
            {/* Primary CTA — signal red underline accent */}
            <Link
              href="/sign-up"
              className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-white transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Start collecting
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/#interactive-demo"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-transparent px-8 text-base font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-border"
            >
              See the demo
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
