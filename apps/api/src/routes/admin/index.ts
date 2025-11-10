import { Router } from 'express';
import dlqRouter from './dlq.route.ts';
import healthRouter from './health.route.ts';
import metricsRouter from './metrics.route.ts';

const router: Router = Router();

// Health check routes (public - no auth required)
router.use('/', healthRouter);

// Admin routes (should add requireAdmin middleware here)
// TODO: Add admin authentication middleware
// router.use(requireAdmin);
router.use('/admin', metricsRouter);
router.use('/admin', dlqRouter);

export default router;
