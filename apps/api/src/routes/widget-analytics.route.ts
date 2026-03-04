import { Router } from "express";
import {
  trackWidgetLoad,
  getWidgetAnalytics,
  getRealtimeAnalytics,
  getPerformanceAlerts,
  resolvePerformanceAlert,
} from '../controllers/widget-analytics.controller.js';
import { attachUser, requireAuth } from '../middleware/auth.middleware.js';
import { createIpRateLimiter, createRateLimiter } from '../middleware/rate-limiter.js';

const router: Router = Router();

// Create rate limiters for different endpoints
const publicTelemetryLimiter = createIpRateLimiter(1000, 60, 'telemetry:ip'); // 1000 requests per minute per IP
const analyticsLimiter = createRateLimiter(100, 60, 'analytics'); // 100 requests per minute

// Public telemetry endpoint (no auth required)
router.post(
  "/track",
  publicTelemetryLimiter,
  trackWidgetLoad
);

// @deprecated — these authenticated endpoints are unused by the web frontend.
// The admin app uses /admin/widgets/* routes instead. Kept for backward compat.
router.get(
  "/:widgetId",
  attachUser,
  requireAuth,
  analyticsLimiter,
  getWidgetAnalytics
);

router.get(
  "/:widgetId/realtime",
  attachUser,
  requireAuth,
  analyticsLimiter,
  getRealtimeAnalytics
);

router.get(
  "/:widgetId/alerts",
  attachUser,
  requireAuth,
  analyticsLimiter,
  getPerformanceAlerts
);

router.patch(
  "/alerts/:alertId/resolve",
  attachUser,
  requireAuth,
  analyticsLimiter,
  resolvePerformanceAlert
);

export default router;
