"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@workspace/ui/lib/utils";

interface MorphingTextProps {
  /** Array of words to cycle through */
  words: string[];
  /** Interval between word changes in ms */
  interval?: number;
  /** Additional className for the container span */
  className?: string;
}

/**
 * MorphingText — Cycles through an array of words with a blur/fade transition.
 *
 * The outgoing word blurs out + fades down, the incoming word blurs in + fades up.
 * Respects `prefers-reduced-motion` by disabling animation.
 */
export function MorphingText({
  words,
  interval = 2800,
  className,
}: MorphingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval]);

  return (
    <span className={cn("relative inline-block", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentIndex]}
          initial={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 8, filter: "blur(6px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -8, filter: "blur(6px)" }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
          }
          className="inline-block"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
