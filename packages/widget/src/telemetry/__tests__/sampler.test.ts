/**
 * Tests for TelemetrySampler
 */

import { describe, it, expect, vi } from 'vitest';
import { TelemetrySampler } from '../sampler.js';

describe('TelemetrySampler', () => {
  it('should initialize with default 1% sampling rate', () => {
    const sampler = new TelemetrySampler();
    expect(sampler.getSamplingRate()).toBe(0.01);
  });

  it('should initialize with custom sampling rate', () => {
    const sampler = new TelemetrySampler(0.5);
    expect(sampler.getSamplingRate()).toBe(0.5);
  });

  it('should clamp sampling rate to 0-1 range', () => {
    const sampler1 = new TelemetrySampler(-0.5);
    expect(sampler1.getSamplingRate()).toBe(0);

    const sampler2 = new TelemetrySampler(1.5);
    expect(sampler2.getSamplingRate()).toBe(1);
  });

  it('should update sampling rate', () => {
    const sampler = new TelemetrySampler(0.01);
    sampler.setSamplingRate(0.1);
    expect(sampler.getSamplingRate()).toBe(0.1);
  });

  it('should sample at 100% rate', () => {
    const sampler = new TelemetrySampler(1.0);

    // Test multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      expect(sampler.shouldSample()).toBe(true);
    }
  });

  it('should never sample at 0% rate', () => {
    const sampler = new TelemetrySampler(0);

    // Test multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      expect(sampler.shouldSample()).toBe(false);
    }
  });

  it('should sample probabilistically', () => {
    const sampler = new TelemetrySampler(0.5);

    // Mock Math.random to test sampling logic
    const mockRandom = vi.spyOn(Math, 'random');

    mockRandom.mockReturnValue(0.3);
    expect(sampler.shouldSample()).toBe(true);

    mockRandom.mockReturnValue(0.7);
    expect(sampler.shouldSample()).toBe(false);

    mockRandom.mockRestore();
  });
});
