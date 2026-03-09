import { describe, expect, it } from 'vitest';

import { sanitizeCss } from '../css-sanitizer.js';

describe('sanitizeCss', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeCss('')).toBe('');
  });

  it('preserves safe CSS declarations', () => {
    const input = '.card { color: #111; background: #fff; border-radius: 8px; }';
    const output = sanitizeCss(input);

    expect(output).toContain('color: #111');
    expect(output).toContain('background: #fff');
    expect(output).toContain('border-radius: 8px');
  });

  it('blocks dangerous CSS constructs', () => {
    const input = [
      '@import url(https://evil.test/x.css);',
      '.x { background-image: url(javascript:alert(1)); }',
      '.y { width: expression(alert(1)); }',
      '.z { behavior: url(test.htc); }',
      '<style>.a{color:red;}</style>',
    ].join('\n');

    const output = sanitizeCss(input);

    expect(output).toContain('/* [blocked] */');
    expect(output).not.toContain('@import');
    expect(output).not.toContain('javascript:');
    expect(output).not.toContain('expression(');
    expect(output).not.toContain('behavior:');
    expect(output).not.toContain('<style>');
  });
});
