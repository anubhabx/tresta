import { Router } from 'express';
import { generateToken } from '../../controllers/ably.controller.js';

const router: Router = Router();

/**
 * GET /api/ably/token
 * Generate Ably token for authenticated user
 */
router.get('/token', generateToken);

export default router;
