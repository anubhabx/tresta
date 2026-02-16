import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import dlqRouter from './dlq.route.js';
import healthRouter from './health.route.js';
import metricsRouter from './metrics.route.js';
import usersRouter from './users.route.js';
import projectsRouter from './projects.route.js';
import testimonialsRouter from './testimonials.route.js';
import settingsRouter from './settings.route.js';
import auditLogsRouter from './audit-logs.route.js';
import sessionsRouter from './sessions.route.js';
import alertsRouter from './alerts.route.js';
import errorsRouter from './errors.route.js';
import systemRouter from './system.route.js';
import featureFlagsRouter from './feature-flags.route.js';
import widgetAnalyticsRouter from './widgets.route.js';
import plansRouter from './plans.route.js';
import billingRouter from './billing.route.js';

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
router.use('/admin', featureFlagsRouter);
router.use('/admin', widgetAnalyticsRouter);
router.use('/admin', plansRouter);
router.use('/admin', billingRouter);

export default router;
