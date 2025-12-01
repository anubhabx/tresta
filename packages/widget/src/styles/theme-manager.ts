/**
 * Theme Manager - Handles theme configuration and CSS custom properties
 */

import type { ThemeConfig } from '../types/index.js';

export interface ThemeManagerConfig {
  theme?: ThemeConfig;
  debug?: boolean;
}

export class ThemeManager {
  private theme: ThemeConfig;
  private debug: boolean;

  constructor(config: ThemeManagerConfig = {}) {
    this.theme = config.theme ?? this.getDefaultTheme();
    this.debug = config.debug ?? false;

    if (this.debug) {
      console.log('[TrestaWidget] ThemeManager initialized with theme:', this.theme);
    }
  }

  /**
   * Get default theme configuration
   */
  private getDefaultTheme(): ThemeConfig {
    return {
      mode: 'light',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      cardStyle: 'default',
    };
  }

  /**
   * Apply theme to a root element
   */
  applyTheme(root: HTMLElement): void {
    // Apply theme mode
    this.applyThemeMode(root);

    // Apply colors
    this.applyColors(root);

    // Apply font family
    this.applyFontFamily(root);

    // Apply card style
    this.applyCardStyle(root);

    if (this.debug) {
      console.log('[TrestaWidget] Theme applied to root element');
    }
  }

  /**
   * Apply theme mode (light/dark/auto)
   */
  private applyThemeMode(root: HTMLElement): void {
    let effectiveMode = this.theme.mode;

    // Handle auto mode
    if (effectiveMode === 'auto') {
      effectiveMode = this.detectPreferredColorScheme();
    }

    root.setAttribute('data-theme', effectiveMode);
  }

  /**
   * Detect user's preferred color scheme
   */
  private detectPreferredColorScheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Apply primary and secondary colors via CSS custom properties
   */
  private applyColors(root: HTMLElement): void {
    root.style.setProperty('--tresta-primary-color', this.theme.primaryColor);
    root.style.setProperty('--tresta-secondary-color', this.theme.secondaryColor);
  }

  /**
   * Apply custom font family with fallback
   */
  private applyFontFamily(root: HTMLElement): void {
    if (this.theme.fontFamily) {
      // Add fallback fonts for better compatibility
      const fontFamilyWithFallback = `${this.theme.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
      root.style.setProperty('--tresta-font-family', fontFamilyWithFallback);
    }
  }

  /**
   * Apply card style
   */
  private applyCardStyle(root: HTMLElement): void {
    root.setAttribute('data-card-style', this.theme.cardStyle);
  }

  /**
   * Update theme configuration
   */
  updateTheme(theme: Partial<ThemeConfig>): void {
    this.theme = {
      ...this.theme,
      ...theme,
    };

    if (this.debug) {
      console.log('[TrestaWidget] Theme updated:', this.theme);
    }
  }

  /**
   * Get current theme configuration
   */
  getTheme(): ThemeConfig {
    return { ...this.theme };
  }

  /**
   * Parse theme configuration from data attributes
   */
  static parseThemeFromElement(element: HTMLElement): Partial<ThemeConfig> {
    const theme: Partial<ThemeConfig> = {};

    // Parse theme mode
    const mode = element.getAttribute('data-theme-mode');
    if (mode === 'light' || mode === 'dark' || mode === 'auto') {
      theme.mode = mode;
    }

    // Parse primary color
    const primaryColor = element.getAttribute('data-primary-color');
    if (primaryColor) {
      theme.primaryColor = primaryColor;
    }

    // Parse secondary color
    const secondaryColor = element.getAttribute('data-secondary-color');
    if (secondaryColor) {
      theme.secondaryColor = secondaryColor;
    }

    // Parse font family
    const fontFamily = element.getAttribute('data-font-family');
    if (fontFamily) {
      theme.fontFamily = fontFamily;
    }

    // Parse card style
    const cardStyle = element.getAttribute('data-card-style');
    if (cardStyle === 'default' || cardStyle === 'minimal' || cardStyle === 'bordered') {
      theme.cardStyle = cardStyle;
    }

    return theme;
  }
}
