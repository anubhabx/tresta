/**
 * Widget Configuration Validation
 * Validates widget config against the shared WidgetConfig type.
 *
 * Uses .passthrough() instead of .strict() so new fields added
 * to the types package don't require a simultaneous API deploy.
 */

import { z } from "zod";
import type { WidgetConfig } from "@workspace/types";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * Zod schema for WidgetConfig validation
 */
export const WidgetConfigSchema = z
  .object({
    // Layout & Theme
    layout: z
      .enum(["grid", "list", "masonry", "carousel", "wall", "marquee"])
      .default("grid"),
    theme: z.enum(["light", "dark", "auto"]).default("dark"),

    // Colors
    primaryColor: z.string().regex(hexColorRegex).default("#0066FF"),
    secondaryColor: z.string().regex(hexColorRegex).optional(),

    // Content Visibility
    showRating: z.boolean().optional(),
    showDate: z.boolean().optional(),
    showAvatar: z.boolean().optional(),
    showAuthorRole: z.boolean().optional(),
    showAuthorCompany: z.boolean().optional(),

    // Display Settings
    maxTestimonials: z.number().int().min(1).max(50).optional(),
    columns: z.number().int().min(1).max(4).optional(),
    gap: z.number().int().min(0).max(64).optional(),

    // Styling
    cardStyle: z.enum(["default", "minimal", "bordered", "glass"]).optional(),
    animation: z.enum(["none", "fadeIn", "slideUp", "scale"]).optional(),
    fontFamily: z.string().max(200).optional(),
    cardRadius: z.number().int().min(0).max(32).optional(),
    cardShadow: z.boolean().optional(),

    // Carousel Behavior
    autoRotate: z.boolean().optional(),
    rotateInterval: z.number().int().min(2000).max(15000).optional(),
    showNavigation: z.boolean().optional(),
    showDots: z.boolean().optional(),

    // Branding
    showBranding: z.boolean().optional(),
  })
  .passthrough();

/**
 * Validate widget configuration
 */
export function validateWidgetConfig(config: unknown): WidgetConfig {
  return WidgetConfigSchema.parse(config) as WidgetConfig;
}

/**
 * Validate widget configuration with safe parsing
 */
export function safeValidateWidgetConfig(config: unknown): {
  success: boolean;
  data?: WidgetConfig;
  error?: z.ZodError;
} {
  const result = WidgetConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data as WidgetConfig };
  }
  return { success: false, error: result.error };
}
