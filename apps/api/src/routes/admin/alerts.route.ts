import { Router } from 'express';
import { auditLog } from '../../middleware/audit-log.middleware.ts';
import { getAlerts, updateAlertConfig } from '../../controllers/admin/alerts.controller.ts';

const router: Router = Router();

// Alert configuration keys in Redis
/**
 * GET /admin/alerts
 * Get alert configuration and recent alert history
 */
router.get('/alerts', getAlerts);

/**
 * PUT /admin/alerts/config
 * Update alert threshold configuration
 */
router.put('/alerts/config', auditLog, updateAlertConfig);

export default router;
