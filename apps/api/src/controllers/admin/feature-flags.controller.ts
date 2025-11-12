import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.ts';
import { BadRequestError, UnauthorizedError } from '../../lib/errors.ts';
import {
  getAllFeatureFlags,
  updateFeatureFlag,
  createFeatureFlag,
} from '../../services/feature-flags.service.ts';

/**
 * GET /admin/feature-flags
 * Get all feature flags
 */
export const getFeatureFlags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const flags = await getAllFeatureFlags();
    
    return ResponseHandler.success(res, {
      data: { flags },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/feature-flags/:key
 * Update a feature flag
 */
export const updateFeatureFlagController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    const { enabled } = req.body;
    const { userId } = (req as any).auth || {};
    
    if (typeof enabled !== 'boolean') {
      throw new BadRequestError('enabled must be a boolean');
    }
    
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
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
};

/**
 * POST /admin/feature-flags
 * Create a new feature flag
 */
export const createFeatureFlagController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key, name, description, enabled, metadata } = req.body;
    const { userId } = (req as any).auth || {};
    
    if (!key || !name) {
      throw new BadRequestError('key and name are required');
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
};
