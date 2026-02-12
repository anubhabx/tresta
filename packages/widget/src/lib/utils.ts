import { type ClassValue, clsx } from "clsx";

/**
 * Lightweight class name merger.
 * Widget doesn't need tailwind-merge — just clsx for conditional joining.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
