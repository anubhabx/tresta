import { Router } from 'express';
import { adminReadRateLimitMiddleware, adminHeavyRateLimitMiddleware } from '../../middleware/rate-limiter.ts';
import { listUsers, getUserById, exportUserData } from '../../controllers/admin/users.controller.ts';

const router: Router = Router();

/**
 * GET /admin/users
 * Get paginated list of users with search and filters
 */
router.get('/users', adminReadRateLimitMiddleware, listUsers);

/**
 * GET /admin/users/:id
 * Get detailed information about a specific user
 */
router.get('/users/:id', adminReadRateLimitMiddleware, getUserById);

/**
 * POST /admin/users/:id/export
 * Generate DSAR export for a user
 */
router.post('/users/:id/export', adminHeavyRateLimitMiddleware, exportUserData);

export default router;
