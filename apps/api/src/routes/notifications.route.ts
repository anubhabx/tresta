import { Router } from 'express';
import { rateLimitMiddleware } from '../middleware/rate-limiter.js';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
} from '../controllers/notification.controller.js';

const router: Router = Router();

// Apply rate limiting to all notification routes
router.use(rateLimitMiddleware);

// Notification routes
router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

export default router;
