"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GridBackground } from "@/components/ui/grid-background";

/**
 * PageWrapper — Atmospheric background container for the landing page.
 *
 * Combines two layers:
 *   1. A subtle grid pattern with radial fade (Variant B — "Blueprint" feel)
 *   2. Animated SVG beams that trace paths across the viewport (Variant A — "Linear/Vercel" feel)
 *
 * Both layers sit behind content via negative z-index.
 * Content is rendered with `relative z-10` to always stay on top.
 *
 * Props:
 *   - variant: "beams" | "grid" | "combined" (default: "combined")
 *   - gridVariant: "grid" | "grid-small" | "dot" (default: "grid-small")
 */
export function PageWrapper({
  children,
  className,
  variant = "combined",
  gridVariant = "grid-small",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "beams" | "grid" | "combined";
  gridVariant?: "grid" | "grid-small" | "dot";
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background layer — fixed behind everything */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Variant B: Grid / Dot pattern with radial fade */}
        {(variant === "grid" || variant === "combined") && (
          <GridBackground variant={gridVariant} />
        )}

        {/* Variant A: Animated SVG beams */}
        {(variant === "beams" || variant === "combined") && (
          <BackgroundBeams className="opacity-40" />
        )}

        {/* Top gradient vignette — adds depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Content layer — always on top */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
