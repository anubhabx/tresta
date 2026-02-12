/**
 * Grid Layout
 *
 * Responsive CSS Grid with configurable columns (1‑4).
 * Cards are equal height within each row.
 */

import { TestimonialCard } from "../TestimonialCard";
import type { LayoutProps } from "./types";

export function GridLayout({
  testimonials,
  displayOptions,
  theme,
  layout,
}: LayoutProps) {
  const cols = Math.min(layout.columns ?? 3, 4);

  return (
    <div
      className="tresta-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(1, 1fr)`,
        gap: "16px",
      }}
      data-cols={cols}
    >
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          displayOptions={displayOptions}
          theme={theme}
        />
      ))}
    </div>
  );
}
