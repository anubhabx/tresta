import { Router } from 'express';
import { getSessions, revokeSession } from '../../controllers/admin/sessions.controller.ts';

const router: Router = Router();

/**
 * GET /admin/sessions
 * Get list of active admin sessions
 */
router.get('/sessions', getSessions);

/**
 * POST /admin/sessions/:sessionId/revoke
 * Revoke an admin session
 */
router.post('/sessions/:sessionId/revoke', revokeSession);

export default router;
