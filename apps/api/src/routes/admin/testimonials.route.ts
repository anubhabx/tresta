import { Router } from 'express';
import {
  adminReadRateLimitMiddleware,
  adminWriteRateLimitMiddleware,
  adminHeavyRateLimitMiddleware,
} from '../../middleware/rate-limiter.ts';
import { auditLog } from '../../middleware/audit-log.middleware.ts';
import { listTestimonials, updateTestimonialStatus, bulkUpdateTestimonials } from '../../controllers/admin/testimonials.controller.ts';

const router: Router = Router();

/**
 * GET /admin/testimonials
 * Get paginated list of testimonials with search and filters
 */
router.get('/testimonials', adminReadRateLimitMiddleware, listTestimonials);

/**
 * PATCH /admin/testimonials/:id/status
 * Update moderation status of a single testimonial
 */
router.patch('/testimonials/:id/status', adminWriteRateLimitMiddleware, auditLog, updateTestimonialStatus);

/**
 * POST /admin/testimonials/bulk-update
 * Bulk update moderation status of multiple testimonials
 */
router.post('/testimonials/bulk-update', adminHeavyRateLimitMiddleware, auditLog, bulkUpdateTestimonials);

export default router;
