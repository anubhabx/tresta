import { Router } from 'express';
import { getMetrics } from '../../controllers/admin/metrics.controller.js';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/metrics
 * Get system metrics and quota information
 */
router.get('/metrics', adminReadRateLimitMiddleware, getMetrics);

export default router;
