"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Star, Check, Zap } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/* ── Number Ticker ────────────────────────────────────────────────── */

function useNumberTicker(target: number, isInView: boolean, reduced: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView || reduced) {
      if (reduced) setValue(target);
      return;
    }

    const duration = 1500; // ms
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, target, reduced]);

  return value;
}

/* ── Testimonial Data ─────────────────────────────────────────────── */

const socialTestimonials = [
  {
    content:
      "Replaced our janky screenshot gallery with Tresta in 10 minutes. Conversion rate up 23%.",
    author: "@indie_saas",
    role: "SaaS Founder",
    rating: 5,
  },
  {
    content:
      "The OAuth verification alone is worth it. Our testimonials finally feel trustworthy.",
    author: "@product_lead",
    role: "Product Lead",
    rating: 5,
  },
  {
    content:
      "Dark mode, responsive, and works with my Next.js setup out of the box. Chef's kiss.",
    author: "@frontend_eng",
    role: "Frontend Engineer",
    rating: 5,
  },
];

/* ── Social Proof Section ─────────────────────────────────────────── */

export function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;

  // Dynamic count from env var, default to 50
  const founderCountRaw = process.env.NEXT_PUBLIC_FOUNDER_COUNT || "50";
  const founderCount = parseInt(founderCountRaw, 10) || 50;

  const tickerValue = useNumberTicker(founderCount, isInView, reduced);

  return (
    <section ref={ref} className="bg-[#0c0e12] py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        {/* Number Ticker Header */}
        <div className="mb-16 flex flex-col items-center text-center gap-4">
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={reduced ? { duration: 0 } : { duration: 0.5 }}
            className="flex items-baseline gap-2"
          >
            <span className="font-display text-6xl italic text-[#e8eaed] tabular-nums sm:text-7xl md:text-8xl">
              {tickerValue}+
            </span>
          </motion.div>
          <motion.p
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              reduced ? { duration: 0 } : { duration: 0.4, delay: 0.2 }
            }
            className="text-lg text-[#8b8f99]"
          >
            indie founders building trust with Tresta
          </motion.p>
        </div>

        {/* Testimonial Cards */}
        <div className="mx-auto grid max-w-4xl gap-4 grid-cols-1 md:grid-cols-3">
          {socialTestimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 0.5,
                      delay: 0.3 + i * 0.1,
                      ease: [0.32, 0.72, 0, 1],
                    }
              }
              className="rounded-xl border border-[#2a2e38] bg-[#111318] p-5"
            >
              <div className="mb-3 flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#8b8f99]">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#60a5fa]/10 text-[10px] font-medium text-[#60a5fa]">
                    {testimonial.author.slice(1, 3).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e8eaed]">
                      {testimonial.author}
                    </p>
                    <p className="text-[11px] text-[#8b8f99]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Meta badge */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.7 }}
          className="mt-10 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/5 px-4 py-2 text-sm text-[#60a5fa]">
            <Zap className="h-4 w-4" />
            This section is powered by Tresta
          </span>
        </motion.div>
      </div>
    </section>
  );
}
