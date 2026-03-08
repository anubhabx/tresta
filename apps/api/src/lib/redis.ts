import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const redisLogger = logger.child({ module: 'redis' });

/**
 * Shared Redis client - prevents connection explosion
 * Use this singleton across all services, workers, and routes
 * 
 * IMPORTANT: BullMQ workers should NOT use this shared client.
 * BullMQ manages its own connections internally. Provide connection URL instead.
 */
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      // TLS is automatically enabled for rediss:// URLs
      ...(redisUrl.startsWith('rediss://') && {
        tls: {
          rejectUnauthorized: false, // Required for Upstash
        },
      }),
    });

    redisClient.on('error', (err) => {
      redisLogger.error({ err }, 'Redis connection error');
    });

    redisClient.on('connect', () => {
      redisLogger.info('Redis connected');
    });

    redisClient.on('ready', () => {
      redisLogger.info('Redis ready');
    });

    redisClient.on('close', () => {
      redisLogger.warn('Redis connection closed');
    });
  }

  return redisClient;
}

/**
 * Graceful shutdown - call this on SIGTERM
 * Closes the Redis connection and cleans up resources
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    redisLogger.info('Disconnecting Redis');
    await redisClient.quit();
    redisClient = null;
    redisLogger.info('Redis disconnected');
  }
}
