/**
 * Worker process entry point
 * 
 * Starts all BullMQ workers:
 * - Outbox worker (ensures reliable job enqueuing)
 * - Notification worker (sends via Ably + queues emails)
 * - Email worker (sends emails with quota management)
 * 
 * Run this as a separate process from the web server:
 * ts-node src/workers/index.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma, disconnectPrisma } from '@workspace/database/prisma';
import { disconnectRedis } from '../lib/redis.ts';
import { outboxWorker } from './outbox.worker.ts';
import { notificationWorker } from './notification.worker.ts';
import { emailWorker } from './email.worker.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from apps/api directory
dotenv.config();

console.log('Starting workers...');

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down workers...`);

  try {
    // Close all workers
    await Promise.all([
      outboxWorker.close(),
      notificationWorker.close(),
      emailWorker.close(),
    ]);
    console.log('Workers closed');

    // Disconnect from databases
    await disconnectPrisma();
    await disconnectRedis();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

console.log('Workers started successfully');
console.log('Press Ctrl+C to stop');
