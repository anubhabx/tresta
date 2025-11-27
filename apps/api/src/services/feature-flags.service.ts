import { prisma } from '@workspace/database/prisma';
import { getRedisClient } from '../lib/redis.js';

/**
 * Feature Flags Service
 * 
 * Provides feature flag management with Redis caching and pub/sub for instant updates
 */

const CACHE_PREFIX = 'feature_flag:';
const CACHE_TTL = 300; // 5 minutes
const PUBSUB_CHANNEL = 'feature_flags:updates';

/**
 * Get a feature flag value
 * Checks Redis cache first, falls back to database
 */
export async function getFeatureFlag(key: string): Promise<boolean> {
  const redis = getRedisClient();

  // Check cache first
  const cached = await redis.get(`${CACHE_PREFIX}${key}`);
  if (cached !== null) {
    return cached === '1';
  }

  // Fetch from database
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
  });

  if (!flag) {
    // Default to false if flag doesn't exist
    return false;
  }

  // Cache the result
  await redis.setex(`${CACHE_PREFIX}${key}`, CACHE_TTL, flag.enabled ? '1' : '0');

  return flag.enabled;
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<
  Array<{
    key: string;
    name: string;
    description: string | null;
    enabled: boolean;
    metadata: any;
  }>
> {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { name: 'asc' },
  });

  return flags.map((flag) => ({
    key: flag.key,
    name: flag.name,
    description: flag.description,
    enabled: flag.enabled,
    metadata: flag.metadata,
  }));
}

/**
 * Update a feature flag
 * Invalidates cache and publishes update event
 */
export async function updateFeatureFlag(
  key: string,
  enabled: boolean,
  updatedBy: string
): Promise<void> {
  const redis = getRedisClient();

  // Update in database
  await prisma.featureFlag.update({
    where: { key },
    data: {
      enabled,
      updatedBy,
    },
  });

  // Invalidate cache
  await redis.del(`${CACHE_PREFIX}${key}`);

  // Publish update event
  await redis.publish(
    PUBSUB_CHANNEL,
    JSON.stringify({
      key,
      enabled,
      updatedBy,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Create a new feature flag
 */
export async function createFeatureFlag(data: {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  metadata?: any;
  updatedBy?: string;
}): Promise<void> {
  await prisma.featureFlag.create({
    data: {
      key: data.key,
      name: data.name,
      description: data.description,
      enabled: data.enabled ?? false,
      metadata: data.metadata,
      updatedBy: data.updatedBy,
    },
  });
}

/**
 * Subscribe to feature flag updates
 * Call this on server startup to listen for flag changes
 */
export async function subscribeToFeatureFlagUpdates(): Promise<void> {
  const redis = getRedisClient();
  const subscriber = redis.duplicate();

  await subscriber.connect();

  await subscriber.subscribe(PUBSUB_CHANNEL);

  subscriber.on('message', (channel, message) => {
    if (channel !== PUBSUB_CHANNEL) return;

    try {
      const update = JSON.parse(message);
      console.log(`Feature flag updated: ${update.key} = ${update.enabled}`);

      // Cache is already invalidated by the publisher
      // Just log the update for monitoring
    } catch (error) {
      console.error('Error processing feature flag update:', error);
    }
  });

  console.log('Subscribed to feature flag updates');
}

/**
 * Initialize default feature flags
 * Call this on first deployment
 */
export async function initializeDefaultFeatureFlags(): Promise<void> {
  const defaultFlags = [
    {
      key: 'auto_moderation',
      name: 'Auto Moderation',
      description: 'Enable automatic moderation of testimonials',
      enabled: true,
    },
    {
      key: 'bulk_operations',
      name: 'Bulk Operations',
      description: 'Enable bulk operations in admin panel',
      enabled: true,
    },
    {
      key: 'csv_export',
      name: 'CSV Export',
      description: 'Enable CSV export functionality',
      enabled: true,
    },
    {
      key: 'email_notifications',
      name: 'Email Notifications',
      description: 'Enable email notifications for users',
      enabled: true,
    },
    {
      key: 'realtime_updates',
      name: 'Realtime Updates',
      description: 'Enable realtime updates via Ably',
      enabled: true,
    },
  ];

  for (const flag of defaultFlags) {
    const existing = await prisma.featureFlag.findUnique({
      where: { key: flag.key },
    });

    if (!existing) {
      await createFeatureFlag(flag);
      console.log(`Created feature flag: ${flag.key}`);
    }
  }
}

/**
 * Check if a feature is enabled (convenience wrapper)
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  return getFeatureFlag(key);
}
