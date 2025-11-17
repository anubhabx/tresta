/**
 * Sampling logic for telemetry
 */

export class TelemetrySampler {
  private samplingRate: number;

  constructor(samplingRate: number = 0.01) {
    // Default to 1% sampling
    this.samplingRate = Math.max(0, Math.min(1, samplingRate));
  }

  /**
   * Determine if this event should be sampled
   */
  shouldSample(): boolean {
    return Math.random() < this.samplingRate;
  }

  /**
   * Update the sampling rate
   */
  setSamplingRate(rate: number): void {
    this.samplingRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Get the current sampling rate
   */
  getSamplingRate(): number {
    return this.samplingRate;
  }
}
