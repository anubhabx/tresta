/**
 * Widget Configuration Validation
 * Validates widget config against the shared WidgetConfig type
 */

import { z } from "zod";
import type { WidgetConfig } from "@workspace/types";

/**
 * Zod schema for WidgetConfig validation
 */
export const WidgetConfigSchema = z
  .object({
    layout: z.enum(["carousel", "grid"]).default("grid"),
    theme: z.enum(["light", "dark", "auto"]).default("light"),
    primaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .default("#0066FF"),
    showRating: z.boolean().optional(),
    showAvatar: z.boolean().optional(),
    maxTestimonials: z.number().int().min(1).max(20).optional(),
    autoRotate: z.boolean().optional(),
    rotateInterval: z.number().int().min(2000).max(10000).optional(),
  })
  .strict() satisfies z.ZodType<Partial<WidgetConfig>>;

/**
 * Validate widget configuration
 */
export function validateWidgetConfig(config: unknown): WidgetConfig {
  return WidgetConfigSchema.parse(config);
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
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
