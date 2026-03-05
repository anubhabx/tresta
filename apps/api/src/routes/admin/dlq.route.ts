import { Router } from 'express';
import { listDLQJobs, requeueJob, getDLQStats } from '../../controllers/admin/dlq.controller.js';
import {
	adminHeavyRateLimitMiddleware,
	adminReadRateLimitMiddleware,
} from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/dlq
 * List failed jobs in Dead Letter Queue
 */
router.get('/dlq', adminReadRateLimitMiddleware, listDLQJobs);

/**
 * POST /admin/dlq/:id/requeue
 * Requeue a failed job
 */
router.post('/dlq/:id/requeue', adminHeavyRateLimitMiddleware, requeueJob);

/**
 * GET /admin/dlq/stats
 * Get DLQ statistics
 */
router.get('/dlq/stats', adminReadRateLimitMiddleware, getDLQStats);

export default router;
