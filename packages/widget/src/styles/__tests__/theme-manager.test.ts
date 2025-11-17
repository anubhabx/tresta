/**
 * Unit tests for ThemeManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager } from '../theme-manager';
import type { ThemeConfig } from '../../types';

describe('ThemeManager', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with default theme', () => {
      const themeManager = new ThemeManager();
      const theme = themeManager.getTheme();

      expect(theme.mode).toBe('light');
      expect(theme.primaryColor).toBe('#3b82f6');
      expect(theme.secondaryColor).toBe('#64748b');
      expect(theme.cardStyle).toBe('default');
      expect(theme.fontFamily).toBeUndefined();
    });

    it('should initialize with custom theme', () => {
      const customTheme: ThemeConfig = {
        mode: 'dark',
        primaryColor: '#9333ea',
        secondaryColor: '#ec4899',
        fontFamily: 'Georgia, serif',
        cardStyle: 'bordered',
      };

      const themeManager = new ThemeManager({ theme: customTheme });
      const theme = themeManager.getTheme();

      expect(theme).toEqual(customTheme);
    });

    it('should log initialization in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const customTheme: ThemeConfig = {
        mode: 'light',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        cardStyle: 'default',
      };

      new ThemeManager({ theme: customTheme, debug: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] ThemeManager initialized with theme:'),
        customTheme
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Theme Mode Application', () => {
    it('should apply light theme mode', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      expect(container.getAttribute('data-theme')).toBe('light');
    });

    it('should apply dark theme mode', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'dark', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      expect(container.getAttribute('data-theme')).toBe('dark');
    });

    it('should detect system preference for auto mode', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'auto', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      const appliedTheme = container.getAttribute('data-theme');
      expect(['light', 'dark']).toContain(appliedTheme);
    });
  });

  describe('Color Application', () => {
    it('should apply primary color via CSS custom property', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#9333ea', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      expect(container.style.getPropertyValue('--tresta-primary-color')).toBe('#9333ea');
    });

    it('should apply secondary color via CSS custom property', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#ec4899', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      expect(container.style.getPropertyValue('--tresta-secondary-color')).toBe('#ec4899');
    });

    it('should apply both colors correctly', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#10b981', secondaryColor: '#14b8a6', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      expect(container.style.getPropertyValue('--tresta-primary-color')).toBe('#10b981');
      expect(container.style.getPropertyValue('--tresta-secondary-color')).toBe('#14b8a6');
    });
  });

  describe('Font Family Application', () => {
    it('should apply custom font family with fallback', () => {
      const themeManager = new ThemeManager({
        theme: {
          mode: 'light',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          fontFamily: 'Georgia',
          cardStyle: 'default',
        },
      });

      themeManager.applyTheme(container);

      const fontFamily = container.style.getPropertyValue('--tresta-font-family');
      expect(fontFamily).toContain('Georgia');
      expect(fontFamily).toContain('sans-serif'); // Fallback
    });

    it('should not set font family property when not provided', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      const fontFamily = container.style.getPropertyValue('--tresta-font-family');
      expect(fontFamily).toBe('');
    });

    it('should include system font fallbacks', () => {
      const themeManager = new ThemeManager({
        theme: {
          mode: 'light',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          fontFamily: 'Custom Font',
          cardStyle: 'default',
        },
      });

      themeManager.applyTheme(container);

      const fontFamily = container.style.getPropertyValue('--tresta-font-family');
      expect(fontFamily).toContain('-apple-system');
      expect(fontFamily).toContain('BlinkMacSystemFont');
      expect(fontFamily).toContain('Segoe UI');
    });
  });

  describe('Card Style Application', () => {
    it('should apply default card style', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.applyTheme(container);

      expect(container.getAttribute('data-card-style')).toBe('default');
    });

    it('should apply minimal card style', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'minimal' },
      });

      themeManager.applyTheme(container);

      expect(container.getAttribute('data-card-style')).toBe('minimal');
    });

    it('should apply bordered card style', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'bordered' },
      });

      themeManager.applyTheme(container);

      expect(container.getAttribute('data-card-style')).toBe('bordered');
    });
  });

  describe('Theme Update', () => {
    it('should update theme configuration', () => {
      const themeManager = new ThemeManager();
      
      themeManager.updateTheme({ mode: 'dark', primaryColor: '#9333ea' });
      const theme = themeManager.getTheme();

      expect(theme.mode).toBe('dark');
      expect(theme.primaryColor).toBe('#9333ea');
      expect(theme.secondaryColor).toBe('#64748b'); // Should keep original
    });

    it('should partially update theme', () => {
      const themeManager = new ThemeManager({
        theme: { mode: 'light', primaryColor: '#3b82f6', secondaryColor: '#64748b', cardStyle: 'default' },
      });

      themeManager.updateTheme({ cardStyle: 'bordered' });
      const theme = themeManager.getTheme();

      expect(theme.mode).toBe('light');
      expect(theme.cardStyle).toBe('bordered');
    });

    it('should log update in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const themeManager = new ThemeManager({ debug: true });

      themeManager.updateTheme({ mode: 'dark' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Theme updated:'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Parse Theme from Element', () => {
    it('should parse theme mode from data attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-theme-mode', 'dark');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.mode).toBe('dark');
    });

    it('should parse primary color from data attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-primary-color', '#9333ea');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.primaryColor).toBe('#9333ea');
    });

    it('should parse secondary color from data attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-secondary-color', '#ec4899');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.secondaryColor).toBe('#ec4899');
    });

    it('should parse font family from data attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-font-family', 'Georgia, serif');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.fontFamily).toBe('Georgia, serif');
    });

    it('should parse card style from data attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-card-style', 'bordered');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.cardStyle).toBe('bordered');
    });

    it('should parse all theme attributes', () => {
      const element = document.createElement('div');
      element.setAttribute('data-theme-mode', 'dark');
      element.setAttribute('data-primary-color', '#9333ea');
      element.setAttribute('data-secondary-color', '#ec4899');
      element.setAttribute('data-font-family', 'Georgia, serif');
      element.setAttribute('data-card-style', 'minimal');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.mode).toBe('dark');
      expect(theme.primaryColor).toBe('#9333ea');
      expect(theme.secondaryColor).toBe('#ec4899');
      expect(theme.fontFamily).toBe('Georgia, serif');
      expect(theme.cardStyle).toBe('minimal');
    });

    it('should return empty object when no attributes present', () => {
      const element = document.createElement('div');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(Object.keys(theme).length).toBe(0);
    });

    it('should ignore invalid theme mode values', () => {
      const element = document.createElement('div');
      element.setAttribute('data-theme-mode', 'invalid');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.mode).toBeUndefined();
    });

    it('should ignore invalid card style values', () => {
      const element = document.createElement('div');
      element.setAttribute('data-card-style', 'invalid');

      const theme = ThemeManager.parseThemeFromElement(element);

      expect(theme.cardStyle).toBeUndefined();
    });
  });

  describe('Complete Theme Application', () => {
    it('should apply all theme properties at once', () => {
      const themeManager = new ThemeManager({
        theme: {
          mode: 'dark',
          primaryColor: '#9333ea',
          secondaryColor: '#ec4899',
          fontFamily: 'Georgia, serif',
          cardStyle: 'bordered',
        },
      });

      themeManager.applyTheme(container);

      expect(container.getAttribute('data-theme')).toBe('dark');
      expect(container.getAttribute('data-card-style')).toBe('bordered');
      expect(container.style.getPropertyValue('--tresta-primary-color')).toBe('#9333ea');
      expect(container.style.getPropertyValue('--tresta-secondary-color')).toBe('#ec4899');
      expect(container.style.getPropertyValue('--tresta-font-family')).toContain('Georgia');
    });

    it('should log theme application in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const themeManager = new ThemeManager({ debug: true });

      themeManager.applyTheme(container);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TrestaWidget] Theme applied to root element')
      );

      consoleSpy.mockRestore();
    });
  });
});
