/**
 * Testimonial Limiter Utility
 * 
 * Handles limiting and sorting of testimonials based on configuration.
 * Implements Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import type { Testimonial } from '../types';

/**
 * Limits testimonials to the specified maximum count, prioritizing most recent.
 * 
 * @param testimonials - Array of testimonials to limit
 * @param maxTestimonials - Maximum number of testimonials to return (default: 100)
 * @returns Limited array of testimonials, sorted by createdAt descending
 */
export function limitTestimonials(
  testimonials: Testimonial[],
  maxTestimonials?: number
): Testimonial[] {
  // Handle empty or invalid input
  if (!testimonials || testimonials.length === 0) {
    return [];
  }

  // Default to 100 if not specified
  const limit = maxTestimonials ?? 100;

  // If limit is 0 or negative, return empty array
  if (limit <= 0) {
    return [];
  }

  // If we have fewer testimonials than the limit, just sort and return all
  if (testimonials.length <= limit) {
    return sortByCreatedAtDesc(testimonials);
  }

  // Sort by createdAt descending and take the first 'limit' items
  return sortByCreatedAtDesc(testimonials).slice(0, limit);
}

/**
 * Sorts testimonials by createdAt in descending order (most recent first)
 * 
 * @param testimonials - Array of testimonials to sort
 * @returns Sorted array (does not mutate original)
 */
function sortByCreatedAtDesc(testimonials: Testimonial[]): Testimonial[] {
  // Create a copy to avoid mutating the original array
  return [...testimonials].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    
    // Sort descending (most recent first)
    return dateB - dateA;
  });
}
