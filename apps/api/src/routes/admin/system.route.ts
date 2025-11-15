import { Router } from 'express';
import { getSystemInfo } from '../../controllers/admin/system.controller.ts';

const router: Router = Router();

/**
 * GET /admin/system
 * Get system information and status
 */
router.get('/system', getSystemInfo);

export default router;
