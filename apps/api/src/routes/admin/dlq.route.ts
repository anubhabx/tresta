import { Router } from 'express';
import { listDLQJobs, requeueJob, getDLQStats } from '../../controllers/admin/dlq.controller.ts';

const router: Router = Router();

/**
 * GET /admin/dlq
 * List failed jobs in Dead Letter Queue
 */
router.get('/dlq', listDLQJobs);

/**
 * POST /admin/dlq/:id/requeue
 * Requeue a failed job
 */
router.post('/dlq/:id/requeue', requeueJob);

/**
 * GET /admin/dlq/stats
 * Get DLQ statistics
 */
router.get('/dlq/stats', getDLQStats);

export default router;
