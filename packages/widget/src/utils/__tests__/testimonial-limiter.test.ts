/**
 * Unit tests for Testimonial Limiter
 * 
 * Tests Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import { describe, it, expect } from 'vitest';
import { limitTestimonials } from '../testimonial-limiter';
import type { Testimonial } from '../../types';

describe('limitTestimonials', () => {
  // Helper to create mock testimonials with specific dates
  const createTestimonial = (id: string, createdAt: string): Testimonial => ({
    id,
    content: `Testimonial ${id}`,
    rating: 5,
    createdAt,
    isPublished: true,
    isApproved: true,
    isOAuthVerified: false,
    author: {
      name: `Author ${id}`,
    },
  });

  describe('Basic limiting functionality', () => {
    it('should limit testimonials to specified maxTestimonials', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-02T00:00:00Z'),
        createTestimonial('3', '2025-01-03T00:00:00Z'),
        createTestimonial('4', '2025-01-04T00:00:00Z'),
        createTestimonial('5', '2025-01-05T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 3);

      expect(result).toHaveLength(3);
    });

    it('should default to 100 testimonials when maxTestimonials is not specified', () => {
      // Create 150 testimonials
      const testimonials = Array.from({ length: 150 }, (_, i) =>
        createTestimonial(`${i + 1}`, `2025-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`)
      );

      const result = limitTestimonials(testimonials);

      expect(result).toHaveLength(100);
    });

    it('should default to 100 testimonials when maxTestimonials is undefined', () => {
      // Create 150 testimonials
      const testimonials = Array.from({ length: 150 }, (_, i) =>
        createTestimonial(`${i + 1}`, `2025-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`)
      );

      const result = limitTestimonials(testimonials, undefined);

      expect(result).toHaveLength(100);
    });
  });

  describe('Sorting by createdAt descending', () => {
    it('should prioritize most recent testimonials (sort by createdAt desc)', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-05T00:00:00Z'), // Most recent
        createTestimonial('3', '2025-01-03T00:00:00Z'),
        createTestimonial('4', '2025-01-02T00:00:00Z'),
        createTestimonial('5', '2025-01-04T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 3);

      // Should return the 3 most recent: 2, 5, 3
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('2'); // 2025-01-05
      expect(result[1].id).toBe('5'); // 2025-01-04
      expect(result[2].id).toBe('3'); // 2025-01-03
    });

    it('should sort all testimonials by createdAt desc even when not limiting', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-03T00:00:00Z'),
        createTestimonial('3', '2025-01-02T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 10); // Limit higher than count

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('2'); // 2025-01-03
      expect(result[1].id).toBe('3'); // 2025-01-02
      expect(result[2].id).toBe('1'); // 2025-01-01
    });
  });

  describe('Edge cases', () => {
    it('should handle empty array', () => {
      const result = limitTestimonials([], 5);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle null/undefined testimonials array gracefully', () => {
      const result = limitTestimonials(null as any, 5);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle fewer testimonials than limit', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-02T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 10);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2'); // Still sorted
      expect(result[1].id).toBe('1');
    });

    it('should handle maxTestimonials of 0', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-02T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 0);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle negative maxTestimonials', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-02T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, -5);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle maxTestimonials of 1', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-02T00:00:00Z'),
        createTestimonial('3', '2025-01-03T00:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3'); // Most recent
    });
  });

  describe('Array immutability', () => {
    it('should not mutate the original testimonials array', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00Z'),
        createTestimonial('2', '2025-01-03T00:00:00Z'),
        createTestimonial('3', '2025-01-02T00:00:00Z'),
      ];

      const originalOrder = testimonials.map(t => t.id);
      limitTestimonials(testimonials, 2);

      // Original array should remain unchanged
      expect(testimonials.map(t => t.id)).toEqual(originalOrder);
    });
  });

  describe('Date parsing', () => {
    it('should handle various ISO date formats', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T00:00:00.000Z'),
        createTestimonial('2', '2025-01-03T12:30:45Z'),
        createTestimonial('3', '2025-01-02T08:15:30.500Z'),
      ];

      const result = limitTestimonials(testimonials, 10);

      expect(result[0].id).toBe('2'); // 2025-01-03
      expect(result[1].id).toBe('3'); // 2025-01-02
      expect(result[2].id).toBe('1'); // 2025-01-01
    });

    it('should handle same dates with different times', () => {
      const testimonials = [
        createTestimonial('1', '2025-01-01T08:00:00Z'),
        createTestimonial('2', '2025-01-01T12:00:00Z'), // Later in the day
        createTestimonial('3', '2025-01-01T10:00:00Z'),
      ];

      const result = limitTestimonials(testimonials, 10);

      expect(result[0].id).toBe('2'); // 12:00
      expect(result[1].id).toBe('3'); // 10:00
      expect(result[2].id).toBe('1'); // 08:00
    });
  });

  describe('Large datasets', () => {
    it('should handle large number of testimonials efficiently', () => {
      // Create 1000 testimonials
      const testimonials = Array.from({ length: 1000 }, (_, i) =>
        createTestimonial(`${i + 1}`, `2025-01-01T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`)
      );

      const result = limitTestimonials(testimonials, 50);

      expect(result).toHaveLength(50);
      // Should be sorted by date descending
      for (let i = 0; i < result.length - 1; i++) {
        const dateA = new Date(result[i].createdAt).getTime();
        const dateB = new Date(result[i + 1].createdAt).getTime();
        expect(dateA).toBeGreaterThanOrEqual(dateB);
      }
    });
  });
});
