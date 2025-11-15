import { Router } from 'express';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.ts';
import { getAuditLogs } from '../../controllers/admin/audit-logs.controller.ts';

const router: Router = Router();

/**
 * GET /admin/audit-logs
 * Get paginated list of audit logs with filters
 */
router.get('/audit-logs', adminReadRateLimitMiddleware, getAuditLogs);

export default router;
