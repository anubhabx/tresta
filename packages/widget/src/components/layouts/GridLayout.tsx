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
    <div className="tresta-grid" data-cols={cols} role="list" aria-label="Customer testimonials">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="tresta-grid-item" role="listitem">
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
