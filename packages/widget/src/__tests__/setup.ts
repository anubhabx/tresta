/**
 * Test setup file
 * Mocks CSS imports for vitest
 */

import { vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock CSS imports with ?inline suffix
vi.mock('../styles/base.css?inline', () => {
  const cssPath = resolve(__dirname, '../styles/base.css');
  const cssContent = readFileSync(cssPath, 'utf-8');
  return { default: cssContent };
});

vi.mock('../components/testimonial-card.css?inline', () => {
  const cssPath = resolve(__dirname, '../components/testimonial-card.css');
  const cssContent = readFileSync(cssPath, 'utf-8');
  return { default: cssContent };
});

vi.mock('../layouts/carousel.css?inline', () => {
  const cssPath = resolve(__dirname, '../layouts/carousel.css');
  const cssContent = readFileSync(cssPath, 'utf-8');
  return { default: cssContent };
});
