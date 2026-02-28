"use client";

import { cn } from "@workspace/ui/lib/utils";

interface BorderBeamProps {
  className?: string;
  /** Size of the beam dot in pixels */
  size?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Animation delay in seconds */
  delay?: number;
  /** Start color of the beam gradient */
  colorFrom?: string;
  /** End color of the beam gradient */
  colorTo?: string;
}

/**
 * BorderBeam — An animated light beam that orbits a container's border.
 *
 * Place inside a `position: relative; overflow: hidden;` container.
 * The beam uses CSS `offset-path` to trace the container's rectangle,
 * creating a satellite-like orbit effect.
 */
export function BorderBeam({
  className,
  size = 80,
  duration = 4,
  delay = 0,
  colorFrom = "#60a5fa",
  colorTo = "#3b82f680",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          maskImage: `conic-gradient(from 0deg, transparent 0%, #000 8%, transparent 16%)`,
          WebkitMaskImage: `conic-gradient(from 0deg, transparent 0%, #000 8%, transparent 16%)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
          padding: "1px",
          background: `conic-gradient(from calc(var(--beam-angle, 0deg)), transparent 0%, ${colorFrom} 10%, ${colorTo} 20%, transparent 30%)`,
          animation: `border-beam-rotate ${duration}s linear ${delay}s infinite`,
          zIndex: -1
        }}
      >
        <div
          style={{
            borderRadius: "inherit",
            width: "100%",
            height: "100%",
            background: "var(--background, #08090d)",
          }}
        />
      </div>
    </div>
  );
}

/*
 * We need a CSS-only rotation using @property for the angle.
 * Since Tailwind v4 uses @theme inline, we inject the keyframe
 * via a small <style> tag rendered once.
 */
export function BorderBeamStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@property --beam-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes border-beam-rotate {
  0% { --beam-angle: 0deg; }
  100% { --beam-angle: 360deg; }
}
        `.trim(),
      }}
    />
  );
}
