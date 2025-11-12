import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.ts';
import { AppError } from '../../lib/errors.ts';
import {
  getAllFeatureFlags,
  updateFeatureFlag,
  createFeatureFlag,
} from '../../services/feature-flags.service.ts';
import { adminReadRateLimitMiddleware, adminWriteRateLimitMiddleware } from '../../middleware/rate-limiter.ts';
import { auditLog } from '../../middleware/audit-log.middleware.ts';

const router: Router = Router();

/**
 * GET /admin/feature-flags
 * Get all feature flags
 * 
 * Returns:
 * - flags: Array of feature flag objects
 */
router.get(
  '/feature-flags',
  adminReadRateLimitMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flags = await getAllFeatureFlags();
      
      return ResponseHandler.success(res, {
        data: { flags },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /admin/feature-flags/:key
 * Update a feature flag
 * 
 * Body:
 * - enabled: Boolean value for the flag
 * 
 * Returns:
 * - Updated flag
 */
router.put(
  '/feature-flags/:key',
  adminWriteRateLimitMiddleware,
  auditLog,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.params;
      const { enabled } = req.body;
      const { userId } = req.auth || {};
      
      if (typeof enabled !== 'boolean') {
        throw new AppError('enabled must be a boolean', 400);
      }
      
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }
      
      await updateFeatureFlag(key, enabled, userId);
      
      return ResponseHandler.success(res, {
        data: {
          key,
          enabled,
          message: 'Feature flag updated successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /admin/feature-flags
 * Create a new feature flag
 * 
 * Body:
 * - key: Unique key for the flag
 * - name: Human-readable name
 * - description: Optional description
 * - enabled: Initial state (default: false)
 * - metadata: Optional metadata
 * 
 * Returns:
 * - Created flag
 */
router.post(
  '/feature-flags',
  adminWriteRateLimitMiddleware,
  auditLog,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, name, description, enabled, metadata } = req.body;
      const { userId } = req.auth || {};
      
      if (!key || !name) {
        throw new AppError('key and name are required', 400);
      }
      
      await createFeatureFlag({
        key,
        name,
        description,
        enabled,
        metadata,
        updatedBy: userId,
      });
      
      return ResponseHandler.success(res, {
        data: {
          key,
          name,
          enabled: enabled ?? false,
          message: 'Feature flag created successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
