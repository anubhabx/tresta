/**
 * Unit tests for Error State components
 */

import { describe, it, expect } from 'vitest';
import { createErrorState, createEmptyState } from '../error-state';

describe('Error State Components', () => {
  describe('createErrorState', () => {
    it('should create error state with default message', () => {
      const errorState = createErrorState({
        type: 'error',
      });

      expect(errorState.className).toBe('tresta-widget-error-state');
      expect(errorState.getAttribute('role')).toBe('alert');
      expect(errorState.getAttribute('aria-live')).toBe('polite');
      expect(errorState.textContent).toContain('Unable to load testimonials');
    });

    it('should create error state with custom message', () => {
      const customMessage = 'Custom error message';
      const errorState = createErrorState({
        type: 'error',
        message: customMessage,
      });

      expect(errorState.textContent).toContain(customMessage);
    });

    it('should create empty state with default message', () => {
      const emptyState = createErrorState({
        type: 'empty',
      });

      expect(emptyState.className).toBe('tresta-widget-empty-state');
      expect(emptyState.getAttribute('role')).toBe('alert');
      expect(emptyState.getAttribute('aria-live')).toBe('polite');
      expect(emptyState.textContent).toContain('No testimonials yet');
    });

    it('should create empty state with custom message', () => {
      const customMessage = 'Custom empty message';
      const emptyState = createErrorState({
        type: 'empty',
        message: customMessage,
      });

      expect(emptyState.textContent).toContain(customMessage);
    });

    it('should have proper ARIA attributes', () => {
      const errorState = createErrorState({
        type: 'error',
      });

      expect(errorState.getAttribute('role')).toBe('alert');
      expect(errorState.getAttribute('aria-live')).toBe('polite');
    });

    it('should contain message in paragraph element', () => {
      const errorState = createErrorState({
        type: 'error',
      });

      const message = errorState.querySelector('.tresta-widget-state-message');
      expect(message).toBeDefined();
      expect(message?.tagName).toBe('P');
    });
  });

  describe('createEmptyState', () => {
    it('should create empty state with default message', () => {
      const emptyState = createEmptyState();

      expect(emptyState.className).toBe('tresta-widget-empty-state');
      expect(emptyState.textContent).toContain('No testimonials yet');
    });

    it('should create empty state with custom message', () => {
      const customMessage = 'No reviews available';
      const emptyState = createEmptyState(customMessage);

      expect(emptyState.textContent).toContain(customMessage);
    });

    it('should have proper ARIA attributes', () => {
      const emptyState = createEmptyState();

      expect(emptyState.getAttribute('role')).toBe('alert');
      expect(emptyState.getAttribute('aria-live')).toBe('polite');
    });
  });
});
