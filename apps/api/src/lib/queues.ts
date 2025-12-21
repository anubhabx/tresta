import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Singleton Queue Manager
 * Prevents Redis connection leaks by reusing Queue instances
 */
class QueueManager {
    private static instance: QueueManager;
    private queues: Map<string, Queue> = new Map();

    private constructor() { }

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    /**
     * Get a queue instance by name (cached)
     */
    public getQueue(name: string): Queue {
        if (this.queues.has(name)) {
            return this.queues.get(name)!;
        }

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is required');
        }

        // Reuse shared connection config
        const connection = {
            url: redisUrl,
            ...(redisUrl.startsWith('rediss://') && {
                tls: { rejectUnauthorized: false },
            }),
        };

        const queue = new Queue(name, { connection });
        this.queues.set(name, queue);

        console.log(`Initialized queue: ${name} (Active queues: ${this.queues.size})`);

        return queue;
    }

    /**
     * Close all queues gracefully
     */
    public async closeAll(): Promise<void> {
        const closePromises = Array.from(this.queues.values()).map(queue => queue.close());
        await Promise.all(closePromises);
        this.queues.clear();
        console.log('All queues closed');
    }
}

export const queueManager = QueueManager.getInstance();

export const getQueue = (name: string) => queueManager.getQueue(name);
export const closeAllQueues = () => queueManager.closeAll();
