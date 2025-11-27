import { Router } from 'express';
import {
  createTestNotification,
  createMultipleTestNotifications,
  clearTestNotifications,
} from '../controllers/test.controller.js';

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
 * WARNING: This endpoint is for testing purposes only
 * Remove or protect in production
 */
router.post('/create-notification', createTestNotification);

/**
 * POST /api/test/create-multiple-notifications
 * Create multiple test notifications for testing pagination
 * 
 * Body:
 * - count: number (default: 10, max: 50)
 * 
 * WARNING: This endpoint is for testing purposes only
 * Remove or protect in production
 */
router.post('/create-multiple-notifications', createMultipleTestNotifications);

/**
 * DELETE /api/test/clear-notifications
 * Delete all test notifications for the authenticated user
 * 
 * WARNING: This endpoint is for testing purposes only
 * Remove or protect in production
 */
router.delete('/clear-notifications', clearTestNotifications);

export default router;
