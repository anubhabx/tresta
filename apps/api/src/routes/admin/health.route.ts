import { Router } from 'express';
import { healthCheck, readinessCheck } from '../../controllers/admin/health.controller.js';

const router: Router = Router();

/**
 * GET /healthz
 * Liveness probe - is the service running?
 */
router.get('/healthz', healthCheck);

/**
 * GET /readyz
 * Readiness probe - is the service ready to accept traffic?
 */
router.get('/readyz', readinessCheck);

export default router;
