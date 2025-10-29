/**
 * Widget Configuration Validation
 * Validates widget config against the shared WidgetConfig type
 */

import { z } from 'zod';
import type { WidgetConfig } from '@workspace/types';

/**
 * Zod schema for WidgetConfig validation
 */
export const WidgetConfigSchema = z.object({
  // Layout & Theme
  layout: z.enum(['carousel', 'grid', 'masonry', 'wall', 'list']).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  
  // Colors
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  
  // Content Visibility
  showRating: z.boolean().optional(),
  showDate: z.boolean().optional(),
  showAvatar: z.boolean().optional(),
  showAuthorRole: z.boolean().optional(),
  showAuthorCompany: z.boolean().optional(),
  
  // Display Settings
  maxTestimonials: z.number().int().min(1).max(100).optional(),
  columns: z.number().int().min(1).max(6).optional(),
  gap: z.number().int().min(0).max(100).optional(),
  
  // Styling
  cardStyle: z.enum(['default', 'minimal', 'bordered']).optional(),
  animation: z.enum(['fade', 'slide', 'none']).optional(),
  
  // Carousel Behavior
  autoRotate: z.boolean().optional(),
  rotateInterval: z.number().int().min(1000).max(30000).optional(),
}) satisfies z.ZodType<Partial<WidgetConfig>>;

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
