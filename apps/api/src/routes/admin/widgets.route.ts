import { Router } from 'express';
import {
  getWidgetAnalytics,
  getRealtimeAnalytics,
  getPerformanceAlerts,
  resolvePerformanceAlert,
} from '../../controllers/widget-analytics.controller.js';

const router: Router = Router();

// GET /admin/widgets/:widgetId/analytics
router.get('/widgets/:widgetId/analytics', getWidgetAnalytics);

// GET /admin/widgets/:widgetId/realtime
router.get('/widgets/:widgetId/realtime', getRealtimeAnalytics);

// GET /admin/widgets/:widgetId/alerts
router.get('/widgets/:widgetId/alerts', getPerformanceAlerts);

// PATCH /admin/widgets/alerts/:alertId/resolve
router.patch('/widgets/alerts/:alertId/resolve', resolvePerformanceAlert);

export default router;
