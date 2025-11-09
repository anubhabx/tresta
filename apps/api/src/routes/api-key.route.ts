/**
 * API Key Routes
 * Handles routes for API key management
 */

import { Router, type Router as RouterType } from 'express';
import { 
  createApiKeyHandler, 
  listApiKeysHandler, 
  getApiKeyHandler,
  revokeApiKeyHandler 
} from '../controllers/api-key.controller.ts';
import { attachUser } from '../middleware/auth.middleware.ts';

const router: RouterType = Router();

// All API key routes require authentication
router.use(attachUser);

/**
 * Create a new API key for a project
 * POST /api/projects/:slug/api-keys
 */
router.post('/:slug/api-keys', createApiKeyHandler);

/**
 * List all API keys for a project
 * GET /api/projects/:slug/api-keys
 */
router.get('/:slug/api-keys', listApiKeysHandler);

/**
 * Get a single API key by ID
 * GET /api/projects/:slug/api-keys/:keyId
 */
router.get('/:slug/api-keys/:keyId', getApiKeyHandler);

/**
 * Revoke an API key
 * DELETE /api/projects/:slug/api-keys/:keyId
 */
router.delete('/:slug/api-keys/:keyId', revokeApiKeyHandler);

export default router;
