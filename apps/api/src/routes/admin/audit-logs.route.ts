import { Router } from 'express';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.js';
import { getAuditLogs } from '../../controllers/admin/audit-logs.controller.js';

const router: Router = Router();

/**
 * GET /admin/audit-logs
 * Get paginated list of audit logs with filters
 */
router.get('/audit-logs', adminReadRateLimitMiddleware, getAuditLogs);

export default router;
