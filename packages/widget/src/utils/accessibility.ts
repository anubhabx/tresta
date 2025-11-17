/**
 * Accessibility Utilities
 * 
 * Provides helper functions for implementing WCAG 2.1 AA compliant accessibility features.
 * Includes keyboard navigation, focus management, and ARIA attribute helpers.
 */

/**
 * Keyboard key codes for navigation
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Focus trap for modal-like components
 */
export class FocusTrap {
  private element: HTMLElement;
  private previouslyFocused: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * Activates the focus trap
   */
  activate(): void {
    // Store the currently focused element
    this.previouslyFocused = document.activeElement as HTMLElement;

    // Get all focusable elements
    this.updateFocusableElements();

    // Focus the first focusable element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0]?.focus();
    }

    // Add event listener for Tab key
    this.element.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Deactivates the focus trap
   */
  deactivate(): void {
    this.element.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus to previously focused element
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }

  /**
   * Updates the list of focusable elements
   */
  private updateFocusableElements(): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    this.focusableElements = Array.from(
      this.element.querySelectorAll<HTMLElement>(selector)
    ).filter((el) => {
      // Filter out hidden elements
      return el.offsetParent !== null;
    });
  }

  /**
   * Handles Tab key navigation
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== Keys.TAB) return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
}

/**
 * Gets all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => {
      // Filter out hidden elements
      return el.offsetParent !== null;
    }
  );
}

/**
 * Manages focus for a roving tabindex pattern (e.g., for carousels, tabs)
 */
export class RovingTabIndex {
  private elements: HTMLElement[];
  private currentIndex: number = 0;

  constructor(elements: HTMLElement[]) {
    this.elements = elements;
    this.updateTabIndices();
  }

  /**
   * Updates the elements in the roving tabindex
   */
  updateElements(elements: HTMLElement[]): void {
    this.elements = elements;
    this.updateTabIndices();
  }

  /**
   * Sets the current focused element by index
   */
  setCurrentIndex(index: number): void {
    if (index < 0 || index >= this.elements.length) return;

    this.currentIndex = index;
    this.updateTabIndices();
    this.elements[index]?.focus();
  }

  /**
   * Moves focus to the next element
   */
  next(): void {
    const nextIndex = (this.currentIndex + 1) % this.elements.length;
    this.setCurrentIndex(nextIndex);
  }

  /**
   * Moves focus to the previous element
   */
  previous(): void {
    const prevIndex =
      (this.currentIndex - 1 + this.elements.length) % this.elements.length;
    this.setCurrentIndex(prevIndex);
  }

  /**
   * Moves focus to the first element
   */
  first(): void {
    this.setCurrentIndex(0);
  }

  /**
   * Moves focus to the last element
   */
  last(): void {
    this.setCurrentIndex(this.elements.length - 1);
  }

  /**
   * Updates tabindex attributes for all elements
   */
  private updateTabIndices(): void {
    this.elements.forEach((el, index) => {
      if (index === this.currentIndex) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-selected', 'true');
      } else {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-selected', 'false');
      }
    });
  }
}

/**
 * Announces a message to screen readers using an ARIA live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Create or get the live region
  let liveRegion = document.getElementById('tresta-widget-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'tresta-widget-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'tresta-sr-only';
    document.body.appendChild(liveRegion);
  }

  // Update the live region with the message
  liveRegion.textContent = message;

  // Clear the message after a delay to allow for repeated announcements
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }, 1000);
}

/**
 * Creates a visually hidden element for screen readers
 */
export function createScreenReaderOnly(text: string): HTMLElement {
  const element = document.createElement('span');
  element.className = 'tresta-sr-only';
  element.textContent = text;
  return element;
}

/**
 * Checks if an element is visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Sets up keyboard navigation for a list of items
 */
export function setupKeyboardNavigation(
  container: HTMLElement,
  options: {
    onEnter?: (index: number) => void;
    onEscape?: () => void;
    orientation?: 'horizontal' | 'vertical';
  } = {}
): () => void {
  const { onEnter, onEscape, orientation = 'horizontal' } = options;

  const handleKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    const items = getFocusableElements(container);
    const currentIndex = items.indexOf(target);

    if (currentIndex === -1) return;

    let handled = false;

    switch (e.key) {
      case Keys.ARROW_RIGHT:
        if (orientation === 'horizontal') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex]?.focus();
          handled = true;
        }
        break;

      case Keys.ARROW_LEFT:
        if (orientation === 'horizontal') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex]?.focus();
          handled = true;
        }
        break;

      case Keys.ARROW_DOWN:
        if (orientation === 'vertical') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex]?.focus();
          handled = true;
        }
        break;

      case Keys.ARROW_UP:
        if (orientation === 'vertical') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex]?.focus();
          handled = true;
        }
        break;

      case Keys.HOME:
        e.preventDefault();
        items[0]?.focus();
        handled = true;
        break;

      case Keys.END:
        e.preventDefault();
        items[items.length - 1]?.focus();
        handled = true;
        break;

      case Keys.ENTER:
      case Keys.SPACE:
        if (onEnter) {
          e.preventDefault();
          onEnter(currentIndex);
          handled = true;
        }
        break;

      case Keys.ESCAPE:
        if (onEscape) {
          e.preventDefault();
          onEscape();
          handled = true;
        }
        break;
    }

    if (handled) {
      e.stopPropagation();
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Adds ARIA attributes for a loading state
 */
export function setLoadingState(
  element: HTMLElement,
  isLoading: boolean,
  label?: string
): void {
  if (isLoading) {
    element.setAttribute('aria-busy', 'true');
    if (label) {
      element.setAttribute('aria-label', label);
    }
  } else {
    element.removeAttribute('aria-busy');
    if (label) {
      element.removeAttribute('aria-label');
    }
  }
}

/**
 * Creates an ARIA live region element
 */
export function createLiveRegion(
  priority: 'polite' | 'assertive' = 'polite'
): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'tresta-sr-only';
  return liveRegion;
}
