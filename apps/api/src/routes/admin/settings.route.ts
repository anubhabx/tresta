import { Router } from 'express';
import { auditLog } from '../../middleware/audit-log.middleware.ts';
import { getSettings, updateSettings } from '../../controllers/admin/settings.controller.ts';

const router: Router = Router();

/**
 * GET /admin/settings
 * Get current system settings
 */
router.get('/settings', getSettings);

/**
 * PUT /admin/settings
 * Update system settings with optimistic locking
 */
router.put('/settings', auditLog, updateSettings);

export default router;
