import { Router } from 'express';
import { getSystemInfo } from '../../controllers/admin/system.controller.js';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/system
 * Get system information and status
 */
router.get('/system', adminReadRateLimitMiddleware, getSystemInfo);

export default router;
