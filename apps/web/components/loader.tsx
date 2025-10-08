"use client";

import type { SVGProps } from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Loader2 } from "lucide-react";

type LoadingStarsProps = SVGProps<SVGSVGElement> & {
  width?: number;
  height?: number;
  strokeWidth?: number;
  "aria-label"?: string;
};

export function LoadingStars({
  width = 152,
  height = 24,
  strokeWidth = 1.5,
  className,
  "aria-label": ariaLabel = "Loading",
  ...props
}: LoadingStarsProps) {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Select all outline and fill elements
    const outlines = gsap.utils.toArray<SVGPathElement>(
      containerRef.current.querySelectorAll(".star-outline")
    );
    const fills = gsap.utils.toArray<SVGPathElement>(
      containerRef.current.querySelectorAll(".star-fill")
    );

    // Initial state: all hidden
    gsap.set(outlines, {
      opacity: 0,
      strokeDasharray: 100,
      strokeDashoffset: 100,
    });
    gsap.set(fills, {
      opacity: 0,
    });

    // Create the animation timeline
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power2.inOut" },
    });

    // Animation timing
    const stagger = 0.15;
    const drawDuration = 0.3;
    const fillDuration = 0.2;
    const holdDuration = 0.5;
    const fadeOutDuration = 0.4;

    // Animate each star sequentially
    outlines.forEach((outline, i) => {
      const startTime = i * stagger;
      const fill = fills[i];

      // Draw outline stroke
      tl.to(
        outline,
        {
          opacity: 1,
          strokeDashoffset: 0,
          duration: drawDuration,
        },
        startTime
      );

      // Fade in fill
      if (fill) {
        tl.to(
          fill,
          {
            opacity: 1,
            duration: fillDuration,
          },
          startTime + drawDuration * 0.5
        );
      }
    });

    // Hold all stars visible
    tl.to({}, { duration: holdDuration });

    // Fade out all stars
    tl.to(
      [...outlines, ...fills],
      {
        opacity: 0,
        duration: fadeOutDuration,
      }
    );

    // Reset stroke offsets for next loop
    tl.set(outlines, { strokeDashoffset: 100 });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 152 24"
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      <title>{ariaLabel}</title>
      
      {/* Render 5 stars */}
      {[0, 32, 64, 96, 128].map((x, i) => (
        <g key={i} transform={`translate(${x}, 0)`}>
          {/* Star outline (stroke) */}
          <path
            className="star-outline"
            d="M12 2 L14.95 8.09 L22 9.17 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.17 L9.05 8.09 Z"
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            pathLength="100"
            vectorEffect="non-scaling-stroke"
            style={{ color: "var(--muted-foreground)" }}
          />
          {/* Star fill */}
          <path
            className="star-fill"
            d="M12 2 L14.95 8.09 L22 9.17 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.17 L9.05 8.09 Z"
            fill="var(--primary)"
            style={{ color: "hsl(var(--primary))" }}
          />
        </g>
      ))}
    </svg>
  );
}

export function InlineLoader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`inline-block align-middle ${className}`} {...props}>
      <Loader2 className="animate-spin w-full h-full" />
    </div>
  );
}
