import { Router } from "express";
import { getPublicProjectBySlug } from '../controllers/project.controller.js';
import { renderWidgetPage } from '../controllers/widget.controller.js';
import { publicRateLimitMiddleware } from '../middleware/rate-limiter.js';

const router: Router = Router();

// Public project endpoint - no authentication required
router.get("/projects/:slug", publicRateLimitMiddleware, getPublicProjectBySlug);

// Public widget embed page for iframe
router.get("/embed/:widgetId", publicRateLimitMiddleware, renderWidgetPage);

export { router as publicRouter };
