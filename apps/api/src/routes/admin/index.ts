import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.ts';
import dlqRouter from './dlq.route.ts';
import healthRouter from './health.route.ts';
import metricsRouter from './metrics.route.ts';

const router: Router = Router();

// Health check routes (public - no auth required)
router.use('/', healthRouter);

// Admin routes - protected with admin authentication
router.use('/admin', requireAdmin);
router.use('/admin', metricsRouter);
router.use('/admin', dlqRouter);

export default router;
