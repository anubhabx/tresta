
import { Router } from 'express';
import { listAllPlans, getPlanById, getPlanMetrics } from '../../controllers/admin/plans.controller.js';
import { createPlan, updatePlan, deletePlan } from '../../controllers/plan.controller.js';
import {
	adminReadRateLimitMiddleware,
	adminWriteRateLimitMiddleware,
} from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/plans
 * List all plans (active and inactive)
 */
router.get('/plans', adminReadRateLimitMiddleware, listAllPlans);

/**
 * GET /admin/plans/metrics
 * Get plan usage metrics and MRR
 */
router.get('/plans/metrics', adminReadRateLimitMiddleware, getPlanMetrics);

/**
 * GET /admin/plans/:id
 * Get plan details
 */
router.get('/plans/:id', adminReadRateLimitMiddleware, getPlanById);

/**
 * POST /admin/plans
 * Create a new plan
 */
router.post('/plans', adminWriteRateLimitMiddleware, createPlan);

/**
 * PUT /admin/plans/:id
 * Update an existing plan
 */
router.put('/plans/:id', adminWriteRateLimitMiddleware, updatePlan);

/**
 * DELETE /admin/plans/:id
 * Deactivate a plan
 */
router.delete('/plans/:id', adminWriteRateLimitMiddleware, deletePlan);

export default router;
