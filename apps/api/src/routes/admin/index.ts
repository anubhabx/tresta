import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.ts';
import dlqRouter from './dlq.route.ts';
import healthRouter from './health.route.ts';
import metricsRouter from './metrics.route.ts';
import usersRouter from './users.route.ts';
import projectsRouter from './projects.route.ts';
import testimonialsRouter from './testimonials.route.ts';
import settingsRouter from './settings.route.ts';
import auditLogsRouter from './audit-logs.route.ts';
import sessionsRouter from './sessions.route.ts';
import alertsRouter from './alerts.route.ts';
import errorsRouter from './errors.route.ts';
import systemRouter from './system.route.ts';

const router: Router = Router();

// Health check routes (public - no auth required)
router.use('/', healthRouter);

// Admin routes - protected with admin authentication
router.use('/admin', requireAdmin);
router.use('/admin', metricsRouter);
router.use('/admin', dlqRouter);
router.use('/admin', usersRouter);
router.use('/admin', projectsRouter);
router.use('/admin', testimonialsRouter);
router.use('/admin', settingsRouter);
router.use('/admin', auditLogsRouter);
router.use('/admin', sessionsRouter);
router.use('/admin', alertsRouter);
router.use('/admin', errorsRouter);
router.use('/admin', systemRouter);

export default router;
