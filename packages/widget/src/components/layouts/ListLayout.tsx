/**
 * List Layout
 *
 * Single-column, full-width cards. Clean, minimal.
 * Ideal for sidebars or narrow containers.
 */

import { TestimonialCard } from "../TestimonialCard";
import type { LayoutProps } from "./types";

export function ListLayout({
  testimonials,
  displayOptions,
  theme,
}: LayoutProps) {
  return (
    <div className="tresta-list">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="tresta-list-item">
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
