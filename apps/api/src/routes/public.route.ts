import { Router } from "express";
import { getPublicProjectBySlug } from '../controllers/project.controller.js';
import { renderWidgetPage } from '../controllers/widget.controller.js';
import { publicRateLimitMiddleware } from '../middleware/rate-limiter.js';
import { createTestimonial } from '../controllers/testimonial.controller.js';

const router: Router = Router();

// Public project endpoint - no authentication required
router.get("/projects/:slug", publicRateLimitMiddleware, getPublicProjectBySlug);

// Public testimonial submission
router.post("/projects/:slug/testimonials", publicRateLimitMiddleware, createTestimonial);

// Public widget embed page for iframe
router.get("/embed/:widgetId", publicRateLimitMiddleware, renderWidgetPage);

export { router as publicRouter };
