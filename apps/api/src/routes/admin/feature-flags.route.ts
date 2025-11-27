import { Router } from 'express';
import { adminReadRateLimitMiddleware, adminWriteRateLimitMiddleware } from '../../middleware/rate-limiter.js';
import { auditLog } from '../../middleware/audit-log.middleware.js';
import { getFeatureFlags, updateFeatureFlagController, createFeatureFlagController } from '../../controllers/admin/feature-flags.controller.js';

const router: Router = Router();

/**
 * GET /admin/feature-flags
 * Get all feature flags
 */
router.get('/feature-flags', adminReadRateLimitMiddleware, getFeatureFlags);

/**
 * PUT /admin/feature-flags/:key
 * Update a feature flag
 */
router.put('/feature-flags/:key', adminWriteRateLimitMiddleware, auditLog, updateFeatureFlagController);

/**
 * POST /admin/feature-flags
 * Create a new feature flag
 */
router.post('/feature-flags', adminWriteRateLimitMiddleware, auditLog, createFeatureFlagController);

export default router;
