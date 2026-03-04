"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * HeroGlow — A very subtle radial gradient "glow" positioned behind the hero.
 * This is a lightweight alternative to the full Aurora Background:
 * pure CSS, no animations, no layout shift, just a soft color accent.
 */
export function HeroGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Primary glow — top-left, blue */}
      <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-primary/[0.07] blur-[120px]" />
      {/* Secondary glow — bottom-right, violet */}
      <div className="absolute -right-[20%] -bottom-[20%] h-[60%] w-[50%] rounded-full bg-violet-500/[0.05] blur-[120px]" />
      {/* Center accent — very faint cyan */}
      <div className="absolute top-[20%] left-[30%] h-[40%] w-[40%] rounded-full bg-cyan-400/[0.03] blur-[100px]" />
    </div>
  );
}
