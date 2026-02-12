/**
 * WidgetRoot — Root component for the Tresta Widget.
 *
 * Delegates layout rendering to dedicated layout components.
 * Handles theme wrapper and branding badge.
 */

import type { WidgetData } from "@/types";
import {
  GridLayout,
  ListLayout,
  MasonryLayout,
  CarouselLayout,
  WallOfLoveLayout,
  MarqueeLayout,
} from "./layouts";

interface WidgetRootProps {
  data: WidgetData;
}

export function WidgetRoot({ data }: WidgetRootProps) {
  const { testimonials, config } = data;
  const { layout, display, theme } = config;

  const layoutProps = { testimonials, displayOptions: display, theme, layout };

  function renderLayout() {
    switch (layout.type) {
      case "list":
        return <ListLayout {...layoutProps} />;
      case "masonry":
        return <MasonryLayout {...layoutProps} />;
      case "carousel":
        return <CarouselLayout {...layoutProps} />;
      case "wall":
        return <WallOfLoveLayout {...layoutProps} />;
      case "marquee":
        return <MarqueeLayout {...layoutProps} />;
      case "grid":
      default:
        return <GridLayout {...layoutProps} />;
    }
  }

  return (
    <div
      className={`tresta-widget-root w-full ${theme.mode === "dark" ? "dark" : ""}`}
    >
      {renderLayout()}

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
