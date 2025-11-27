import { Router } from "express";
import { attachUser } from "../middleware/auth.middleware.ts";
import { validateApiKeyMiddleware, requirePermission } from "../middleware/api-key.middleware.ts";
import { publicRateLimitMiddleware } from "../middleware/rate-limiter.ts";
import { auditLog } from "../middleware/audit-log.middleware.ts";
import {
  createWidget,
  updateWidget,
  listWidgets,
  deleteWidget,
  fetchPublicWidgetData,
} from "../controllers/widget.controller.ts";

const router: Router = Router();

// Public widget data endpoint - requires API key authentication
// GET /api/widgets/:widgetId/public - Fetch widget data for embedding
router.get(
  "/:widgetId/public", 
  publicRateLimitMiddleware,
  validateApiKeyMiddleware, 
  requirePermission('widgets'), 
  fetchPublicWidgetData
);

// Protected routes - require authentication (use global restrictive CORS)
// POST /api/widgets - Create a new widget
router.post("/", attachUser, auditLog, createWidget);

// GET /api/widgets/project/:slug - List all widgets for a project
router.get("/project/:slug", attachUser, listWidgets);

// PUT /api/widgets/:widgetId - Update widget configuration
router.put("/:widgetId", attachUser, auditLog, updateWidget);

// DELETE /api/widgets/:widgetId - Delete a widget
router.delete("/:widgetId", attachUser, auditLog, deleteWidget);

export { router as widgetRouter };
