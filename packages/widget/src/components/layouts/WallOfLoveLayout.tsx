/**
 * Wall of Love Layout
 *
 * Dense, multi-column card layout with subtle random rotations
 * and varied sizes to create a "wall of sticky notes" effect.
 */

import { TestimonialCard } from "../TestimonialCard";
import type { LayoutProps } from "./types";

/** Deterministic pseudo-random based on index for consistent renders */
function getRotation(index: number): number {
  const seed = ((index * 7 + 3) % 11) - 5; // Range: -5 to 5
  return seed * 0.4; // Range: -2deg to 2deg
}

function getScale(index: number): number {
  // Subtle scale variation: 0.97 to 1.03
  return 1 + (((index * 13 + 5) % 7) - 3) * 0.01;
}

export function WallOfLoveLayout({
  testimonials,
  displayOptions,
  theme,
  layout,
}: LayoutProps) {
  const cols = Math.min(layout.columns ?? 3, 4);

  return (
    <div
      className="tresta-wall"
      data-cols={cols}
      style={{
        columnCount: 1,
        columnGap: "12px",
      }}
    >
      {testimonials.map((testimonial, idx) => (
        <div
          key={testimonial.id}
          className="tresta-wall-item"
          style={{
            breakInside: "avoid",
            marginBottom: "12px",
            transform: `rotate(${getRotation(idx)}deg) scale(${getScale(idx)})`,
            transition: "transform 0.3s ease",
          }}
        >
          <TestimonialCard
            testimonial={testimonial}
            displayOptions={displayOptions}
            theme={theme}
          />
        </div>
      ))}
    </div>
  );
}
