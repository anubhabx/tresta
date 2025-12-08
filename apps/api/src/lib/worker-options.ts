
import { WorkerOptions } from 'bullmq';

/**
 * Optimized worker options for Free Tier Redis
 * Reduces the frequency of Redis commands for idle workers
 */
export const POP_WORKER_OPTIONS: Partial<WorkerOptions> = {
    // Check for stalled jobs every 5 minutes instead of every 30 seconds
    // Reduces "stalled check" Redis commands by 10x
    stalledInterval: 300000, // 5 minutes

    // Reduce concurrency to 1 to minimize active connections and command throughput
    // (We don't need high concurrency for this app magnitude yet)
    concurrency: 1,

    // If no jobs are available, how long to wait before checking delayed jobs again?
    // Default is 5s. Increasing this reduces "zadd/zrange" checks for delayed jobs.
    drainDelay: 30, // 30 seconds
};
