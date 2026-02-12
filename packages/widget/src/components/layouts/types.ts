/**
 * Shared Layout Props
 *
 * Every layout component receives the same props. The layout is responsible
 * for arranging TestimonialCards; individual card rendering is delegated
 * to <TestimonialCard />.
 */

import type {
  Testimonial,
  DisplayOptions,
  ThemeConfig,
  LayoutConfig,
} from "@/types";

export interface LayoutProps {
  testimonials: Testimonial[];
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
  layout: LayoutConfig;
}
