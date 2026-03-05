import { Router } from 'express';
import { auditLog } from '../../middleware/audit-log.middleware.js';
import { getSettings, updateSettings } from '../../controllers/admin/settings.controller.js';
import {
	adminReadRateLimitMiddleware,
	adminWriteRateLimitMiddleware,
} from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/settings
 * Get current system settings
 */
router.get('/settings', adminReadRateLimitMiddleware, getSettings);

/**
 * PUT /admin/settings
 * Update system settings with optimistic locking
 */
router.put('/settings', adminWriteRateLimitMiddleware, auditLog, updateSettings);

export default router;
