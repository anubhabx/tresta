import crypto from 'crypto';
import { getRedisClient } from '../lib/redis.js';

const SETTINGS_CHANGE_CHANNEL = 'settings:changes';
const SETTINGS_HMAC_SECRET = process.env.SETTINGS_HMAC_SECRET || 'default-secret-change-in-production';

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
        console.error('Invalid settings change event signature - possible tampering detected');
        return;
      }

      console.log('Received verified settings change event:', event);

      // Call the callback
      await callback(event);
    } catch (error) {
      console.error('Error processing settings change event:', error);
    }
  });

  console.log('Subscribed to settings change events');
}

/**
 * Example consumer that updates local cache
 */
export async function startSettingsChangeConsumer(): Promise<void> {
  await subscribeToSettingsChanges(async (event) => {
    console.log(`Settings updated to version ${event.version} by ${event.updatedBy}`);
    console.log('Changes:', event.changes);

    // Here you could:
    // - Update local cache
    // - Trigger dependent services
    // - Send notifications
    // - Update metrics
  });
}
