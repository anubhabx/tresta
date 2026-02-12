import { TestimonialCard } from "./TestimonialCard";
import type { WidgetData } from "@/types";

interface WidgetRootProps {
  data: WidgetData;
}

/**
 * Resolve CSS grid classes based on the configured layout type.
 * Phase 2 will swap these with dedicated layout components.
 */
function getLayoutClasses(type: string, columns: number = 3): string {
  switch (type) {
    case "list":
      return "grid grid-cols-1 gap-4";
    case "masonry":
      // Phase 2: CSS columns / masonry component
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 3)} gap-4`;
    case "carousel":
      // Phase 2: Horizontal slider with auto-rotate
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 3)} gap-4`;
    case "wall":
      // Phase 2: Dense overlapping cards
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-3`;
    case "marquee":
      // Phase 2: Infinite horizontal scroll
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 3)} gap-4`;
    case "grid":
    default:
      return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 3)} gap-4`;
  }
}

export function WidgetRoot({ data }: WidgetRootProps) {
  const { testimonials, config } = data;
  const { layout, display, theme } = config;

  const layoutClasses = getLayoutClasses(layout.type, layout.columns);

  return (
    <div
      className={`tresta-widget-root w-full ${theme.mode === "dark" ? "dark" : ""}`}
    >
      <div className={layoutClasses}>
        {testimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            displayOptions={display}
            theme={theme}
          />
        ))}
      </div>

      {/* Branding Badge */}
      <div className="mt-4 flex justify-center">
        <a
          href="https://tresta.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#00796b] transition-colors"
        >
          Powered by Tresta
        </a>
      </div>
    </div>
  );
}
