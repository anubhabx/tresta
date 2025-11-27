import { Router } from "express";
import {
  trackWidgetLoad,
  getWidgetAnalytics,
  getRealtimeAnalytics,
  getPerformanceAlerts,
  resolvePerformanceAlert,
} from '../controllers/widget-analytics.controller.js';
import { attachUser } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/rate-limiter.js';

const router: Router = Router();

// Create rate limiters for different endpoints
const publicTelemetryLimiter = createRateLimiter(1000, 60, 'telemetry'); // 1000 requests per minute
const analyticsLimiter = createRateLimiter(100, 60, 'analytics'); // 100 requests per minute

// Public telemetry endpoint (no auth required)
router.post(
  "/track",
  publicTelemetryLimiter,
  trackWidgetLoad
);

// Protected analytics endpoints (require authentication)
router.get(
  "/:widgetId",
  attachUser,
  analyticsLimiter,
  getWidgetAnalytics
);

router.get(
  "/:widgetId/realtime",
  attachUser,
  analyticsLimiter,
  getRealtimeAnalytics
);

router.get(
  "/:widgetId/alerts",
  attachUser,
  analyticsLimiter,
  getPerformanceAlerts
);

router.patch(
  "/alerts/:alertId/resolve",
  attachUser,
  analyticsLimiter,
  resolvePerformanceAlert
);

export default router;
