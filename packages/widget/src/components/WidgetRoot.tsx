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
      className={`tresta-widget-root ${theme.mode === "dark" ? "tresta-widget-root--dark" : ""}`}
    >
      {renderLayout()}

      {/* Branding Badge — hidden when showBranding is false (Pro feature) */}
      {config.display?.showBranding !== false && (
        <div className="tresta-branding">
          <a
            href="https://tresta.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="tresta-branding__link"
          >
            Powered by Tresta
          </a>
        </div>
      )}

      {/* Custom CSS Injection */}
      {display.customCss && (
        <style dangerouslySetInnerHTML={{ __html: display.customCss }} />
      )}
    </div>
  );
}
