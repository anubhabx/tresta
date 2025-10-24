import { Router } from "express";
import { attachUser } from "../middleware/auth.middleware.ts";
import {
  createWidget,
  updateWidget,
  listWidgets,
  deleteWidget,
  fetchPublicWidgetData,
} from "../controllers/widget.controller.ts";

const router: Router = Router();

// Public route - no authentication required
// GET /api/widgets/:widgetId/public - Fetch widget data for embedding
router.get("/:widgetId/public", fetchPublicWidgetData);

// Protected routes - require authentication
// POST /api/widgets - Create a new widget
router.post("/", attachUser, createWidget);

// GET /api/widgets/project/:slug - List all widgets for a project
router.get("/project/:slug", attachUser, listWidgets);

// PUT /api/widgets/:widgetId - Update widget configuration
router.put("/:widgetId", attachUser, updateWidget);

// DELETE /api/widgets/:widgetId - Delete a widget
router.delete("/:widgetId", attachUser, deleteWidget);

export { router as widgetRouter };
