import { Router } from 'express';
import { getMetrics } from '../../controllers/admin/metrics.controller.ts';

const router: Router = Router();

/**
 * GET /admin/metrics
 * Get system metrics and quota information
 */
router.get('/metrics', getMetrics);

export default router;
