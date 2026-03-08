import crypto from 'crypto';
import { getRedisClient } from '../lib/redis.js';
import { SETTINGS_HMAC_SECRET } from '../config/secrets.js';
import { logger } from '../lib/logger.js';

const SETTINGS_CHANGE_CHANNEL = 'settings:changes';
const settingsEventsLogger = logger.child({ module: 'settings-events' });

export interface SettingsChangeEvent {
  version: number;
  changes: {
    emailQuotaLimit?: number;
    ablyConnectionLimit?: number;
    autoModerationEnabled?: boolean;
  };
  timestamp: string;
  updatedBy: string;
  signature: string;
}

/**
 * Verify the signature of a settings change event
 */
export function verifySettingsEventSignature(event: SettingsChangeEvent): boolean {
  const { signature, ...eventData } = event;

  const expectedSignature = crypto
    .createHmac('sha256', SETTINGS_HMAC_SECRET)
    .update(JSON.stringify(eventData))
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Subscribe to settings change events
 * Consumers should verify signatures before applying changes
 */
export async function subscribeToSettingsChanges(
  callback: (event: SettingsChangeEvent) => void | Promise<void>
): Promise<void> {
  const redis = getRedisClient();
  const subscriber = redis.duplicate();

  await subscriber.connect();

  await subscriber.subscribe(SETTINGS_CHANGE_CHANNEL);

  subscriber.on('message', async (channel, message) => {
    if (channel !== SETTINGS_CHANGE_CHANNEL) return;

    try {
      const event: SettingsChangeEvent = JSON.parse(message);

      // Verify signature
      if (!verifySettingsEventSignature(event)) {
        settingsEventsLogger.error('Invalid settings change event signature - possible tampering detected');
        return;
      }

      settingsEventsLogger.info({ event }, 'Received verified settings change event');

      // Call the callback
      await callback(event);
    } catch (error) {
      settingsEventsLogger.error({ error }, 'Error processing settings change event');
    }
  });

  settingsEventsLogger.info('Subscribed to settings change events');
}

/**
 * Example consumer that updates local cache
 */
export async function startSettingsChangeConsumer(): Promise<void> {
  await subscribeToSettingsChanges(async (event) => {
    settingsEventsLogger.info(
      { version: event.version, updatedBy: event.updatedBy, changes: event.changes },
      'Settings updated from event stream',
    );

    // Here you could:
    // - Update local cache
    // - Trigger dependent services
    // - Send notifications
    // - Update metrics
  });
}
