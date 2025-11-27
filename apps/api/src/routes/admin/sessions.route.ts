import { Router } from 'express';
import { getSessions, revokeSession } from '../../controllers/admin/sessions.controller.js';
import { auditLog } from '../../middleware/audit-log.middleware.js';
import { adminReadRateLimitMiddleware, adminWriteRateLimitMiddleware } from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/sessions
 * Get list of active admin sessions
 */
router.get('/sessions', adminReadRateLimitMiddleware, getSessions);

/**
 * POST /admin/sessions/:sessionId/revoke
 * Revoke an admin session
 */
router.post('/sessions/:sessionId/revoke', adminWriteRateLimitMiddleware, auditLog, revokeSession);

export default router;
