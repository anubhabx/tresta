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
    <div
      className="tresta-list"
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
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
