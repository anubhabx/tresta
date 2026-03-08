import Ably from 'ably';
import { logger } from '../lib/logger.js';

let ablyInstance: Ably.Realtime | null = null;
const ablyServiceLogger = logger.child({ module: 'ably-service' });

export class AblyService {
    /**
     * Get Ably instance (singleton)
     */
    static getInstance(): Ably.Realtime | null {
        if (!process.env.ABLY_API_KEY) {
            ablyServiceLogger.warn('ABLY_API_KEY is not set. Real-time features disabled.');
            return null;
        }

        if (!ablyInstance) {
            ablyInstance = new Ably.Realtime(process.env.ABLY_API_KEY);
        }
        return ablyInstance;
    }

    /**
     * Publish a message to a channel
     */
    static async publish(channelName: string, eventName: string, data: any): Promise<void> {
        const ably = this.getInstance();
        if (!ably) return;

        try {
            const channel = ably.channels.get(channelName);
            await channel.publish(eventName, data);
        } catch (error) {
            ablyServiceLogger.error({ channelName, eventName, error }, 'Failed to publish to Ably channel');
        }
    }
}
