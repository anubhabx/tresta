/**
 * Theme Detector - Auto-detect host page colors and theme
 */

export interface DetectedTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  cardBackgroundColor?: string;
  fontFamily?: string;
  isDarkMode?: boolean;
}

/**
 * Detects the host page's theme by analyzing CSS variables and computed styles
 */
export function detectHostTheme(container: HTMLElement): DetectedTheme {
  const detectedTheme: DetectedTheme = {};

  // Get computed styles from the container and body
  const containerStyles = window.getComputedStyle(container);
  const bodyStyles = window.getComputedStyle(document.body);
  const rootStyles = window.getComputedStyle(document.documentElement);

  // Try to detect primary/brand color from common CSS variable names
  const primaryColorVars = [
    '--primary-color',
    '--brand-color',
    '--accent-color',
    '--theme-primary',
    '--color-primary',
    '--primary',
  ];

  for (const varName of primaryColorVars) {
    const color = rootStyles.getPropertyValue(varName).trim();
    if (color && isValidColor(color)) {
      detectedTheme.primaryColor = color;
      break;
    }
  }

  // Detect background color
  const bgColor = containerStyles.backgroundColor || bodyStyles.backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    detectedTheme.backgroundColor = bgColor;
  }

  // Detect text color
  const textColor = containerStyles.color || bodyStyles.color;
  if (textColor) {
    detectedTheme.textColor = textColor;
  }

  // Detect if dark mode
  if (detectedTheme.backgroundColor) {
    detectedTheme.isDarkMode = isColorDark(detectedTheme.backgroundColor);
  }

  // Auto-generate card background based on page background
  if (detectedTheme.backgroundColor) {
    detectedTheme.cardBackgroundColor = detectedTheme.isDarkMode
      ? lightenColor(detectedTheme.backgroundColor, 10)
      : darkenColor(detectedTheme.backgroundColor, 3);
  }

  // Detect font family
  const fontFamily = containerStyles.fontFamily || bodyStyles.fontFamily;
  if (fontFamily && fontFamily !== 'serif' && fontFamily !== 'sans-serif') {
    detectedTheme.fontFamily = fontFamily;
  }

  return detectedTheme;
}

/**
 * Check if a string is a valid CSS color
 */
function isValidColor(color: string): boolean {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
}

/**
 * Determine if a color is dark (for auto dark mode detection)
 */
function isColorDark(color: string): boolean {
  // Convert color to RGB
  const rgb = getRGBFromColor(color);
  if (!rgb) return false;

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

/**
 * Extract RGB values from a CSS color string
 */
function getRGBFromColor(color: string): { r: number; g: number; b: number } | null {
  // Create a temporary element to compute the color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  // Parse rgb/rgba format
  const match = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match && match[1] && match[2] && match[3]) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }

  return null;
}

/**
 * Lighten a color by a percentage
 */
function lightenColor(color: string, percent: number): string {
  const rgb = getRGBFromColor(color);
  if (!rgb) return color;

  const amount = (percent / 100) * 255;
  const r = Math.min(255, Math.round(rgb.r + amount));
  const g = Math.min(255, Math.round(rgb.g + amount));
  const b = Math.min(255, Math.round(rgb.b + amount));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Darken a color by a percentage
 */
function darkenColor(color: string, percent: number): string {
  const rgb = getRGBFromColor(color);
  if (!rgb) return color;

  const amount = (percent / 100) * 255;
  const r = Math.max(0, Math.round(rgb.r - amount));
  const g = Math.max(0, Math.round(rgb.g - amount));
  const b = Math.max(0, Math.round(rgb.b - amount));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Check if user prefers dark color scheme
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
