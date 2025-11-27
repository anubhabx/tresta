# Telemetry Module

Privacy-first telemetry tracking for the Tresta Widget System.

## Overview

The telemetry module collects anonymous usage and performance metrics to help improve the widget experience. It is designed with privacy as the top priority.

## Privacy Guarantees

- **No PII Collected**: No personally identifiable information is ever collected
- **DNT Respected**: Automatically disabled when Do Not Track is enabled
- **Opt-Out Available**: Users can disable via `data-telemetry="false"`
- **1% Sampling**: Only 1% of events are sent by default to reduce server load
- **90-Day Retention**: All telemetry data is automatically deleted after 90 days

## What We Track

- **Widget ID**: Non-PII identifier for the widget instance
- **Version**: Widget version number
- **Load Time**: Time taken to load and render the widget (ms)
- **Layout Type**: Which layout is being used (carousel, grid, etc.)
- **Error Counts**: Aggregated error counts by error code

## What We DON'T Track

- Email addresses
- Names
- IP addresses
- User IDs
- Cookies
- Any personally identifiable information

## Usage

### Basic Usage

```typescript
import { TelemetryTracker } from './telemetry';

const tracker = new TelemetryTracker('widget-123', '1.0.0');

// Start tracking load time
tracker.startLoadTracking();

// Track successful load
tracker.trackLoad('grid');

// Track errors
tracker.trackError('API_ERROR');

// Track interactions
tracker.trackInteraction('carousel');
```

### Configuration

```typescript
const tracker = new TelemetryTracker('widget-123', '1.0.0', {
  enabled: true,           // Enable/disable telemetry
  samplingRate: 0.01,      // 1% sampling rate
  endpoint: 'https://api.tresta.app/telemetry',
});
```

### Opt-Out

Users can opt-out of telemetry in three ways:

1. **Browser DNT**: Enable Do Not Track in browser settings
2. **Data Attribute**: Add `data-telemetry="false"` to the widget element
3. **Programmatic**: Call `tracker.disable()`

### Per-Account Settings

The admin panel allows project owners to configure telemetry settings:

- **Off**: Completely disable telemetry for this account
- **Sampled** (default): 1% sampling rate
- **Opt-In**: Higher sampling rate for accounts that want more detailed analytics

## Implementation Details

### Sampling

The `TelemetrySampler` class implements probabilistic sampling:

```typescript
const sampler = new TelemetrySampler(0.01); // 1% sampling

if (sampler.shouldSample()) {
  // Send telemetry event
}
```

### Non-Blocking Sends

Telemetry uses `navigator.sendBeacon()` when available, which:

- Sends data asynchronously
- Doesn't block the main thread
- Survives page unload
- Falls back to `fetch()` with `keepalive: true`

### Error Handling

All telemetry operations are wrapped in try-catch blocks. Telemetry failures never affect widget functionality.

## Testing

Run tests with:

```bash
npm test src/telemetry
```

## Compliance

This implementation complies with:

- GDPR (no PII, opt-out available)
- CCPA (no sale of personal information)
- DNT (Do Not Track) standard
- Requirements 21.1-21.5 and 21.Telemetry.1-21.Telemetry.5

## Future Enhancements

- Real-time analytics dashboard
- Performance alerts
- A/B testing support
- Geographic distribution (without IP tracking)
