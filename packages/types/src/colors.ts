/**
 * Shared Color Constants
 * Used across API, Web App, and Widget packages for plan-based color gating.
 */

/**
 * A preset color available to all users (Free and Pro).
 */
export interface FreeColorPreset {
  /** Unique identifier */
  id: string;
  /** Human-readable label */
  label: string;
  /** Hex color code (uppercase, 6-digit) */
  hex: string;
  /** Tailwind bg class for swatch rendering */
  bg: string;
  /** Tailwind text class for contrast rendering */
  text: string;
}

/**
 * Curated palette of 5 colors available to Free-tier users.
 * All colors meet WCAG AA contrast on both light (#fafafa) and dark (#0a0a0a) backgrounds.
 */
export const FREE_COLOR_PALETTE: readonly FreeColorPreset[] = [
  {
    id: "brand-blue",
    label: "Brand Blue",
    hex: "#3B82F6",
    bg: "bg-blue-500",
    text: "text-blue-500",
  },
  {
    id: "soft-gray",
    label: "Soft Gray",
    hex: "#64748B",
    bg: "bg-slate-500",
    text: "text-slate-500",
  },
  {
    id: "charcoal",
    label: "Charcoal",
    hex: "#374151",
    bg: "bg-gray-700",
    text: "text-gray-700",
  },
  {
    id: "forest-green",
    label: "Forest Green",
    hex: "#10B981",
    bg: "bg-emerald-500",
    text: "text-emerald-500",
  },
  {
    id: "crimson",
    label: "Crimson",
    hex: "#EF4444",
    bg: "bg-red-500",
    text: "text-red-500",
  },
] as const;

/**
 * Just the hex values for quick backend validation.
 */
export const FREE_COLOR_HEX_VALUES: readonly string[] = FREE_COLOR_PALETTE.map(
  (c) => c.hex.toUpperCase(),
);

/**
 * Check if a hex color is in the free palette (case-insensitive).
 */
export function isFreeColor(hex: string): boolean {
  return FREE_COLOR_HEX_VALUES.includes(hex.toUpperCase());
}
