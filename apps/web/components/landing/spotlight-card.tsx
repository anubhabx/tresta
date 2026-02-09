"use client";

import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "./canvas-reveal-effect";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Spotlight color presets — themed variants for different feature card moods.
 */
const spotlightVariants = {
  /** Default blue/violet — tech, code, embedding */
  default: {
    color: "#1a1a2e",
    canvasColors: [
      [59, 130, 246],
      [139, 92, 246]
    ] as number[][]
  },
  /** Green pulse — realtime, live, active connections */
  pulse: {
    color: "#0a1a0a",
    canvasColors: [
      [34, 197, 94],
      [16, 185, 129]
    ] as number[][]
  },
  /** Amber action — moderation, approve/reject, warnings */
  action: {
    color: "#1a1508",
    canvasColors: [
      [245, 158, 11],
      [234, 88, 12]
    ] as number[][]
  },
  /** Cyan info — layouts, theming, configuration */
  info: {
    color: "#081a1a",
    canvasColors: [
      [6, 182, 212],
      [59, 130, 246]
    ] as number[][]
  },
  /** Rose — identity, verification, security */
  rose: {
    color: "#1a080e",
    canvasColors: [
      [244, 63, 94],
      [236, 72, 153]
    ] as number[][]
  }
} as const;

export type SpotlightVariant = keyof typeof spotlightVariants;

export const SpotlightCard = ({
  children,
  radius = 350,
  color,
  variant = "default",
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  variant?: SpotlightVariant;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const preset = spotlightVariants[variant];

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={cn(
        "group/spotlight relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-xl opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: color ?? preset.color,
          maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `
        }}
      >
        {isHovering && (
          <CanvasRevealEffect
            animationSpeed={5}
            containerClassName="bg-transparent absolute inset-0 pointer-events-none opacity-50"
            colors={preset.canvasColors}
            dotSize={3}
          />
        )}
      </motion.div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
