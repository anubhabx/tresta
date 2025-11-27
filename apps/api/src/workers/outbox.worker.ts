import { Worker, Queue } from 'bullmq';
import { prisma } from '@workspace/database/prisma';
import { NotificationService } from '../services/notification.service.js';
import * as dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is required');
}

const redisConnection = {
  url: redisUrl,
  ...(redisUrl.startsWith('rediss://') && {
    tls: { rejectUnauthorized: false },
  }),
};

/**
 * Outbox worker - ensures reliable job enqueuing
 * 
 * Polls NotificationOutbox table for pending entries
 * Runs every 10 seconds to catch any missed enqueues
 * 
 * This worker implements the transactional outbox pattern to ensure
 * that notifications are never lost even if the worker dies before enqueuing
 */
export const outboxWorker = new Worker(
  'outbox-processor',
  async (job) => {
    const { outboxId } = job.data;

    const outboxEntry = await prisma.notificationOutbox.findUnique({
      where: { id: outboxId },
    });

    if (!outboxEntry || outboxEntry.status !== 'pending') {
      return; // Already processed or doesn't exist
    }

    try {
      await NotificationService.enqueueFromOutbox(outboxEntry.notificationId);
    } catch (error) {
      // Update attempts and status
      await prisma.notificationOutbox.update({
        where: { id: outboxId },
        data: {
          attempts: outboxEntry.attempts + 1,
          status: outboxEntry.attempts >= 4 ? 'failed' : 'pending', // 5 total attempts
        },
      });

      if (outboxEntry.attempts >= 4) {
        console.error(`Outbox entry ${outboxId} failed after 5 attempts:`, error);
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

outboxWorker.on('completed', (job) => {
  console.log(`Outbox entry ${job.id} processed successfully`);
});

outboxWorker.on('failed', (job, err) => {
  console.error(`Outbox entry ${job?.id} failed:`, err);
});

// Create queue for adding jobs
const outboxQueue = new Queue('outbox-processor', {
  connection: redisConnection,
});

// Poll outbox every 10 seconds
setInterval(async () => {
  try {
    const pendingEntries = await prisma.notificationOutbox.findMany({
      where: {
        status: 'pending',
        attempts: { lt: 5 },
      },
      take: 100,
      orderBy: { createdAt: 'asc' },
    });

    for (const entry of pendingEntries) {
      await outboxQueue.add('process-outbox', { outboxId: entry.id });
    }
  } catch (error) {
    console.error('Error polling outbox:', error);
  }
}, 10000);

console.log('Outbox worker started');
