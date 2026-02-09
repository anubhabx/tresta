"use client";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

/**
 * GridBackground — A subtle CSS grid pattern overlay.
 * Pure CSS, no JS animation overhead. Fades at edges via radial mask.
 *
 * Usage:
 *   <div className="relative">
 *     <GridBackground />
 *     <div className="relative z-10">...content...</div>
 *   </div>
 */
export function GridBackground({
  className,
  variant = "grid",
}: {
  className?: string;
  variant?: "grid" | "grid-small" | "dot";
}) {
  const patternClasses = {
    grid: cn(
      "[background-size:40px_40px]",
      "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
      "dark:[background-image:linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)]",
    ),
    "grid-small": cn(
      "[background-size:20px_20px]",
      "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
      "dark:[background-image:linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)]",
    ),
    dot: cn(
      "[background-size:20px_20px]",
      "[background-image:radial-gradient(#d4d4d8_1px,transparent_1px)]",
      "dark:[background-image:radial-gradient(#1a1a2e_1px,transparent_1px)]",
    ),
  };

  return (
    <>
      {/* The grid/dot pattern layer */}
      <div
        className={cn("absolute inset-0", patternClasses[variant], className)}
      />
      {/* Radial fade mask — makes the grid fade out toward center/edges */}
      <div className="pointer-events-none absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </>
  );
}
