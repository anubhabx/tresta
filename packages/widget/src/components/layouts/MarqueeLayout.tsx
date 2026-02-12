/**
 * Marquee Layout
 *
 * Infinite horizontal scrolling testimonials (Aceternity-style).
 * Two rows scrolling in opposite directions, pauses on hover.
 * Pure CSS animation — no JS timers.
 */

import { TestimonialCard } from "../TestimonialCard";
import type { LayoutProps } from "./types";

export function MarqueeLayout({
  testimonials,
  displayOptions,
  theme,
}: LayoutProps) {
  if (testimonials.length === 0) return null;

  // Split testimonials into two rows
  const mid = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, mid);
  const row2 = testimonials.slice(mid);

  return (
    <div
      className="tresta-marquee"
      style={{ overflow: "hidden", width: "100%" }}
    >
      {/* Row 1: scrolls left */}
      <MarqueeRow
        items={row1}
        displayOptions={displayOptions}
        theme={theme}
        direction="left"
      />

      {/* Row 2: scrolls right (only if enough testimonials) */}
      {row2.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <MarqueeRow
            items={row2}
            displayOptions={displayOptions}
            theme={theme}
            direction="right"
          />
        </div>
      )}
    </div>
  );
}

interface MarqueeRowProps {
  items: LayoutProps["testimonials"];
  displayOptions: LayoutProps["displayOptions"];
  theme: LayoutProps["theme"];
  direction: "left" | "right";
}

function MarqueeRow({
  items,
  displayOptions,
  theme,
  direction,
}: MarqueeRowProps) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className={`tresta-marquee-row ${direction === "right" ? "tresta-marquee-reverse" : ""}`}
    >
      <div className="tresta-marquee-track">
        {doubled.map((testimonial, idx) => (
          <div key={`${testimonial.id}-${idx}`} className="tresta-marquee-item">
            <TestimonialCard
              testimonial={testimonial}
              displayOptions={displayOptions}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
