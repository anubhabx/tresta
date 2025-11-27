import { prisma } from '@workspace/database/prisma';
import type { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotFoundError } from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';

/**
 * GET /api/notifications
 * List notifications with cursor-based pagination
 */
export const listNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const { cursor, limit = '20' } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);

    let where: any = { userId };

    // Parse cursor if provided
    if (cursor && typeof cursor === 'string') {
      const [createdAt, id] = cursor.split('_');
      if (createdAt && id) {
        where = {
          ...where,
          OR: [
            { createdAt: { lt: new Date(createdAt) } },
            {
              createdAt: new Date(createdAt),
              id: { lt: id },
            },
          ],
        };
      }
    }

    // Fetch one extra to check if there are more results
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limitNum + 1,
    });

    const hasMore = notifications.length > limitNum;
    const data = hasMore ? notifications.slice(0, limitNum) : notifications;

    const lastItem = data[data.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? `${lastItem.createdAt.toISOString()}_${lastItem.id}`
        : null;

    return ResponseHandler.success(res, {
      data: {
        notifications: data,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return ResponseHandler.success(res, {
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id
 * Mark a notification as read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const { id } = req.params;
    const { isRead } = req.body;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new BadRequestError('Unauthorized to update this notification');
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: isRead ?? true },
    });

    return ResponseHandler.success(res, {
      message: 'Notification updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return ResponseHandler.success(res, {
      message: 'All notifications marked as read',
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/preferences
 * Get notification preferences
 */
export const getPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    // Get or create preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
          emailEnabled: true,
        },
      });
    }

    return ResponseHandler.success(res, {
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
export const updatePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const { emailEnabled } = req.body;

    if (typeof emailEnabled !== 'boolean') {
      throw new BadRequestError('emailEnabled must be a boolean');
    }

    // Upsert preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: { emailEnabled },
      create: {
        userId,
        emailEnabled,
      },
    });

    return ResponseHandler.success(res, {
      message: 'Preferences updated successfully',
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};
