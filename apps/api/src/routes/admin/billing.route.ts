import { Router } from 'express';

import {
  getBillingOverview,
  listBillingRecords,
} from '../../controllers/admin/billing.controller.js';
import { adminReadRateLimitMiddleware } from '../../middleware/rate-limiter.js';

const router: Router = Router();

/**
 * GET /admin/billing/overview
 * Compact billing counters for dashboard widgets.
 */
router.get('/billing/overview', adminReadRateLimitMiddleware, getBillingOverview);

/**
 * GET /admin/billing/records
 * Compact billing records with cursor pagination.
 */
router.get('/billing/records', adminReadRateLimitMiddleware, listBillingRecords);

export default router;
