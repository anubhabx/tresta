import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.ts';
import { NotificationType } from '@workspace/database/prisma';
import { ResponseHandler } from '../lib/response.ts';
import { BadRequestError } from '../lib/errors.ts';

const router: Router = Router();

/**
 * POST /api/test/create-notification
 * Create a test notification for the authenticated user
 * 
 * Body:
 * - type: NotificationType (optional, defaults to NEW_TESTIMONIAL)
 * - title: string (optional)
 * - message: string (optional)
 * - link: string (optional)
 * 
 * This endpoint is for testing purposes only
 * Remove or protect in production
 */
router.post(
  '/create-notification',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId;
      
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

      return ResponseHandler.success(res, {
        message: 'Test notification created successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/test/create-multiple-notifications
 * Create multiple test notifications for testing pagination
 * 
 * Body:
 * - count: number (default: 10, max: 50)
 */
router.post(
  '/create-multiple-notifications',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId;
      
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      const { count = 10 } = req.body;
      const actualCount = Math.min(Math.max(1, count), 50);

      const notifications = [];
      
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

      return ResponseHandler.success(res, {
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
);

/**
 * DELETE /api/test/clear-notifications
 * Delete all test notifications for the authenticated user
 */
router.delete(
  '/clear-notifications',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.userId;
      
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

      return ResponseHandler.success(res, {
        message: `Deleted ${result.count} test notifications`,
        data: {
          count: result.count,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
