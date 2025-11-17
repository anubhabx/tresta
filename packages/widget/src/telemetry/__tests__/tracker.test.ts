/**
 * Tests for TelemetryTracker
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelemetryTracker } from '../tracker';

describe('TelemetryTracker', () => {
  let tracker: TelemetryTracker;
  let sendBeaconSpy: any;
  let fetchSpy: any;
  let originalSendBeacon: any;
  let originalDoNotTrack: any;

  beforeEach(() => {
    // Save original values
    originalSendBeacon = navigator.sendBeacon;
    originalDoNotTrack = (navigator as any).doNotTrack;

    // Mock navigator.sendBeacon
    sendBeaconSpy = vi.fn().mockReturnValue(true);
    (navigator as any).sendBeacon = sendBeaconSpy;

    // Mock fetch
    fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchSpy;

    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    // Reset DNT
    delete (navigator as any).doNotTrack;
    delete (window as any).doNotTrack;
    delete (navigator as any).msDoNotTrack;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original values
    if (originalSendBeacon) {
      (navigator as any).sendBeacon = originalSendBeacon;
    } else {
      delete (navigator as any).sendBeacon;
    }
    if (originalDoNotTrack !== undefined) {
      (navigator as any).doNotTrack = originalDoNotTrack;
    }
  });

  it('should initialize with telemetry enabled by default', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0');
    expect(tracker.isEnabled()).toBe(true);
  });

  it('should respect opt-out via config', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { enabled: false });
    expect(tracker.isEnabled()).toBe(false);
  });

  it('should respect DNT (Do Not Track)', () => {
    // Mock DNT enabled
    (navigator as any).doNotTrack = '1';

    tracker = new TelemetryTracker('widget-123', '1.0.0');
    expect(tracker.isEnabled()).toBe(false);
  });

  it('should track load event with sampling', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    
    tracker.startLoadTracking();
    vi.spyOn(performance, 'now').mockReturnValue(2000);
    tracker.trackLoad('grid');

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    
    const call = sendBeaconSpy.mock.calls[0];
    expect(call[0]).toBe('https://api.tresta.com/telemetry');
    
    const blob = call[1];
    expect(blob).toBeInstanceOf(Blob);
  });

  it('should not track when sampling rate is 0', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 0 });
    
    tracker.startLoadTracking();
    tracker.trackLoad('grid');

    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('should track errors', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    
    tracker.trackError('API_ERROR');

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
  });

  it('should accumulate error counts', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 0 });
    
    tracker.trackError('API_ERROR');
    tracker.trackError('API_ERROR');
    tracker.trackError('NETWORK_ERROR');

    const data = tracker.getTelemetryData();
    expect(data.errorCounts).toEqual({
      API_ERROR: 2,
      NETWORK_ERROR: 1,
    });
  });

  it('should track interactions', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    
    tracker.trackInteraction('carousel');

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
  });

  it('should not track when telemetry is disabled', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { enabled: false });
    
    tracker.startLoadTracking();
    tracker.trackLoad('grid');
    tracker.trackError('API_ERROR');
    tracker.trackInteraction('carousel');

    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('should use fetch fallback when sendBeacon is not available', () => {
    // Remove sendBeacon
    delete (navigator as any).sendBeacon;

    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    tracker.trackLoad('grid');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.tresta.com/telemetry');
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      keepalive: true,
      credentials: 'omit',
    });
  });

  it('should update sampling rate', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 0 });
    
    tracker.setSamplingRate(1.0);
    tracker.trackLoad('grid');

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
  });

  it('should disable and enable telemetry', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0');
    
    expect(tracker.isEnabled()).toBe(true);
    
    tracker.disable();
    expect(tracker.isEnabled()).toBe(false);
    
    tracker.enable();
    expect(tracker.isEnabled()).toBe(true);
  });

  it('should not enable telemetry if DNT is set', () => {
    (navigator as any).doNotTrack = '1';

    tracker = new TelemetryTracker('widget-123', '1.0.0', { enabled: false });
    tracker.enable();
    
    expect(tracker.isEnabled()).toBe(false);
  });

  it('should get telemetry data summary', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    
    tracker.startLoadTracking();
    vi.spyOn(performance, 'now').mockReturnValue(2500);
    tracker.trackLoad('carousel');
    tracker.trackError('API_ERROR');

    const data = tracker.getTelemetryData();
    
    expect(data).toMatchObject({
      widgetId: 'widget-123',
      version: '1.0.0',
      loadTime: 1500,
      layoutType: 'carousel',
      errorCounts: {
        API_ERROR: 1,
      },
    });
  });

  it('should silently fail on send errors', () => {
    sendBeaconSpy.mockImplementation(() => {
      throw new Error('Network error');
    });

    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    
    // Should not throw
    expect(() => {
      tracker.trackLoad('grid');
    }).not.toThrow();
  });

  it('should not collect PII', () => {
    tracker = new TelemetryTracker('widget-123', '1.0.0', { samplingRate: 1.0 });
    
    tracker.startLoadTracking();
    tracker.trackLoad('grid');

    const call = sendBeaconSpy.mock.calls[0];
    const blob = call[1];
    
    // Read blob content
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);
      
      // Verify no PII fields
      expect(data).not.toHaveProperty('email');
      expect(data).not.toHaveProperty('name');
      expect(data).not.toHaveProperty('ip');
      expect(data).not.toHaveProperty('userId');
      
      // Verify only allowed fields
      expect(data).toHaveProperty('widgetId');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('eventType');
      expect(data).toHaveProperty('timestamp');
    };
    reader.readAsText(blob);
  });
});
