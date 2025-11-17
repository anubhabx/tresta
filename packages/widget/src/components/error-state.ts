/**
 * Error and Empty State Components
 * Provides user-friendly UI for error and empty states with ARIA support
 */

export interface ErrorStateConfig {
  message?: string;
  type: 'error' | 'empty';
  widgetId?: string;
  version?: string;
}

/**
 * Create an error state component
 */
export function createErrorState(config: ErrorStateConfig): HTMLElement {
  const container = document.createElement('div');
  container.className = `tresta-widget-${config.type}-state`;
  container.setAttribute('role', 'alert');
  container.setAttribute('aria-live', 'polite');

  const message = document.createElement('p');
  message.className = 'tresta-widget-state-message';
  
  // Use custom message or default based on type
  if (config.message) {
    message.textContent = config.message;
  } else if (config.type === 'error') {
    message.textContent = 'Unable to load testimonials. Please try again later.';
  } else {
    message.textContent = 'No testimonials yet';
  }

  container.appendChild(message);

  return container;
}

/**
 * Create an empty state component
 */
export function createEmptyState(message?: string): HTMLElement {
  return createErrorState({
    type: 'empty',
    message,
  });
}
