/**
 * Test setup file
 * Mocks CSS imports for vitest
 */

import { vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock CSS imports with ?inline suffix used by the current style manager
vi.mock('../index.css?inline', () => {
  const cssPath = resolve(__dirname, '../index.css');
  const cssContent = readFileSync(cssPath, 'utf-8');
  return { default: cssContent };
});
