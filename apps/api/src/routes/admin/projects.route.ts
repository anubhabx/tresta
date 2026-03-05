import { Router } from 'express';
import { auditLog } from '../../middleware/audit-log.middleware.js';
import {
  adminReadRateLimitMiddleware,
  adminWriteRateLimitMiddleware,
} from '../../middleware/rate-limiter.js';
import {
	listProjects,
	getProjectById,
	updateProjectTelemetrySettings,
} from '../../controllers/admin/projects.controller.js';

const router: Router = Router();

/**
 * GET /admin/projects
 * Get paginated list of projects with search and filters
 */
router.get('/projects', adminReadRateLimitMiddleware, listProjects);

/**
 * GET /admin/projects/:id
 * Get detailed information about a specific project
 */
router.get('/projects/:id', adminReadRateLimitMiddleware, getProjectById);

/**
 * PATCH /admin/projects/:id/telemetry-settings
 * Update project-level telemetry settings
 */
router.patch('/projects/:id/telemetry-settings', adminWriteRateLimitMiddleware, auditLog, updateProjectTelemetrySettings);

export default router;
