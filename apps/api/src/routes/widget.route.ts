import { Router } from "express";
import { attachUser } from "../middleware/auth.middleware.ts";
import { restrictiveCors, publicCors } from "../middleware/cors.middleware.ts";
import {
  createWidget,
  updateWidget,
  listWidgets,
  deleteWidget,
  fetchPublicWidgetData,
} from "../controllers/widget.controller.ts";

const router: Router = Router();

// Public route - no authentication required, open CORS for embedding
// GET /api/widgets/:widgetId/public - Fetch widget data for embedding
router.get("/:widgetId/public", publicCors, fetchPublicWidgetData);

// Protected routes - require authentication, restrictive CORS
// POST /api/widgets - Create a new widget
router.post("/", restrictiveCors, attachUser, createWidget);

// GET /api/widgets/project/:slug - List all widgets for a project
router.get("/project/:slug", restrictiveCors, attachUser, listWidgets);

// PUT /api/widgets/:widgetId - Update widget configuration
router.put("/:widgetId", restrictiveCors, attachUser, updateWidget);

// DELETE /api/widgets/:widgetId - Delete a widget
router.delete("/:widgetId", restrictiveCors, attachUser, deleteWidget);

export { router as widgetRouter };
