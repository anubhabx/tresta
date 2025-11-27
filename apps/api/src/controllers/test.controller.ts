/**
 * Test Controller
 * Handles test endpoints for development and testing purposes
 * 
 * WARNING: These endpoints should be removed or protected in production
 */

import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { NotificationType } from '@workspace/database/prisma';
import { ResponseHandler } from '../lib/response.js';
import { BadRequestError } from '../lib/errors.js';

/**
 * Create a test notification for the authenticated user
 * POST /api/test/create-notification
 */
export async function createTestNotification(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).auth?.userId;

        if (!userId) {
            throw new BadRequestError('User ID is required');
        }

        const {
            type = NotificationType.NEW_TESTIMONIAL,
            title = 'Test Notification',
            message = 'This is a test notification created for testing purposes',
            link = '/dashboard',
        } = req.body;

        // Create notification
        const notification = await NotificationService.create({
            userId,
            type,
            title,
            message,
            link,
            metadata: {
                test: true,
                createdAt: new Date().toISOString(),
            },
        });

        ResponseHandler.success(res, {
            message: 'Test notification created successfully',
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Create multiple test notifications for testing pagination
 * POST /api/test/create-multiple-notifications
 */
export async function createMultipleTestNotifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).auth?.userId;

        if (!userId) {
            throw new BadRequestError('User ID is required');
        }

        const { count = 10 } = req.body;
        const actualCount = Math.min(Math.max(1, count), 50);

        const notifications: any[] = [];

        for (let i = 0; i < actualCount; i++) {
            const notification = await NotificationService.create({
                userId,
                type: NotificationType.NEW_TESTIMONIAL,
                title: `Test Notification #${i + 1}`,
                message: `This is test notification number ${i + 1} for testing pagination and list display`,
                link: '/dashboard',
                metadata: {
                    test: true,
                    index: i + 1,
                },
            });

            notifications.push(notification);

            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        ResponseHandler.success(res, {
            message: `Created ${actualCount} test notifications`,
            data: {
                count: actualCount,
                notifications: notifications.slice(0, 5), // Return first 5
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete all test notifications for the authenticated user
 * DELETE /api/test/clear-notifications
 */
export async function clearTestNotifications(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as any).auth?.userId;

        if (!userId) {
            throw new BadRequestError('User ID is required');
        }

        const { prisma } = await import('@workspace/database/prisma');

        // Delete test notifications (those with test: true in metadata)
        const result = await prisma.notification.deleteMany({
            where: {
                userId,
                metadata: {
                    path: ['test'],
                    equals: true,
                },
            },
        });

        ResponseHandler.success(res, {
            message: `Deleted ${result.count} test notifications`,
            data: {
                count: result.count,
            },
        });
    } catch (error) {
        next(error);
    }
}
