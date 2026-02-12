/**
 * Masonry Layout
 *
 * Pinterest-style waterfall layout using CSS columns.
 * Cards have natural (variable) height; columns pack dynamically.
 */

import { TestimonialCard } from "../TestimonialCard";
import type { LayoutProps } from "./types";

export function MasonryLayout({
  testimonials,
  displayOptions,
  theme,
  layout,
}: LayoutProps) {
  const cols = Math.min(layout.columns ?? 3, 4);

  return (
    <div
      className="tresta-masonry"
      data-cols={cols}
      style={{
        columnCount: 1,
        columnGap: "16px",
      }}
    >
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="tresta-masonry-item"
          style={{
            breakInside: "avoid",
            marginBottom: "16px",
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
