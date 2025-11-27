import { Router } from 'express';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.js';
import { getErrors } from '../../controllers/admin/errors.controller.js';

const router: Router = Router();

/**
 * GET /admin/errors
 * Get paginated list of error logs with filters
 */
router.get('/errors', adminReadRateLimitMiddleware, getErrors);

export default router;
