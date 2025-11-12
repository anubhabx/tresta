import { Router } from 'express';
import { listProjects, getProjectById } from '../../controllers/admin/projects.controller.ts';

const router: Router = Router();

/**
 * GET /admin/projects
 * Get paginated list of projects with search and filters
 */
router.get('/projects', listProjects);

/**
 * GET /admin/projects/:id
 * Get detailed information about a specific project
 */
router.get('/projects/:id', getProjectById);

export default router;
