import { Router, type Router as RouterType } from 'express';
import { attachUser } from '../middleware/auth.middleware.js';
import {
  listAccountApiKeysHandler,
  createAccountApiKeyHandler,
  revokeAccountApiKeyHandler,
} from '../controllers/api-key.controller.js';

const router: RouterType = Router();

router.use(attachUser);

router.get('/api-keys', listAccountApiKeysHandler);
router.post('/api-keys', createAccountApiKeyHandler);
router.delete('/api-keys/:keyId', revokeAccountApiKeyHandler);

export default router;
