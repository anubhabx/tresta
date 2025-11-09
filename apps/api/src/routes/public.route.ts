import { Router } from "express";
import { getPublicProjectBySlug } from "../controllers/project.controller.ts";
import { renderWidgetPage } from "../controllers/widget.controller.ts";

const router: Router = Router();

// Public project endpoint - no authentication required
router.get("/projects/:slug", getPublicProjectBySlug);

// Public widget embed page for iframe
router.get("/embed/:widgetId", renderWidgetPage);

export { router as publicRouter };
