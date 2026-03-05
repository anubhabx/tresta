import { Router } from 'express';
import {
  getWidgetAnalytics,
  getRealtimeAnalytics,
  getPerformanceAlerts,
  resolvePerformanceAlert,
} from '../../controllers/widget-analytics.controller.js';
import {
  listAdminWidgets,
  getAdminWidgetById,
  createAdminWidget,
  updateAdminWidget,
  deleteAdminWidget,
} from '../../controllers/admin/widgets.controller.js';
import {
  adminReadRateLimitMiddleware,
  adminWriteRateLimitMiddleware,
} from '../../middleware/rate-limiter.js';

const router: Router = Router();

// GET /admin/widgets
router.get('/widgets', adminReadRateLimitMiddleware, listAdminWidgets);

// GET /admin/widgets/:widgetId
router.get('/widgets/:widgetId', adminReadRateLimitMiddleware, getAdminWidgetById);

// POST /admin/widgets
router.post('/widgets', adminWriteRateLimitMiddleware, createAdminWidget);

// PATCH /admin/widgets/:widgetId
router.patch('/widgets/:widgetId', adminWriteRateLimitMiddleware, updateAdminWidget);

// DELETE /admin/widgets/:widgetId
router.delete('/widgets/:widgetId', adminWriteRateLimitMiddleware, deleteAdminWidget);

// GET /admin/widgets/:widgetId/analytics
router.get('/widgets/:widgetId/analytics', adminReadRateLimitMiddleware, getWidgetAnalytics);

// GET /admin/widgets/:widgetId/realtime
router.get('/widgets/:widgetId/realtime', adminReadRateLimitMiddleware, getRealtimeAnalytics);

// GET /admin/widgets/:widgetId/alerts
router.get('/widgets/:widgetId/alerts', adminReadRateLimitMiddleware, getPerformanceAlerts);

// PATCH /admin/widgets/alerts/:alertId/resolve
router.patch('/widgets/alerts/:alertId/resolve', adminWriteRateLimitMiddleware, resolvePerformanceAlert);

export default router;
