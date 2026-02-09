"use client";

import React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GridBackground } from "@/components/ui/grid-background";

export function PageWrapper({
  children,
  className,
  gridVariant = "grid-small"
}: {
  children: React.ReactNode;
  className?: string;
  gridVariant?: "grid" | "grid-small" | "dot";
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background layer — fixed behind everything */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GridBackground variant={gridVariant} className="opacity-50" />

        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
