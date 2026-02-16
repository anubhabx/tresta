/**
 * API Key Controller
 * Handles CRUD operations for API keys
 */

import type { Request, Response, NextFunction } from 'express';
import { 
  createApiKey, 
  listApiKeys, 
  revokeApiKey, 
  getApiKeyById,
  type ApiKeyEnvironment 
} from '../services/api-key.service.js';
import { ResponseHandler } from '../lib/response.js';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  handlePrismaError 
} from '../lib/errors.js';
import { prisma } from '@workspace/database/prisma';

/**
 * Create a new API key for a project
 * POST /api/projects/:slug/api-keys
 */
export async function createApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    const { name, environment = 'live', permissions, usageLimit, rateLimit, expiresAt } = req.body;
    
    // Validate required fields
    if (!name || typeof name !== 'string') {
      throw new ValidationError('API key name is required and must be a string', {
        field: 'name',
        received: typeof name
      });
    }

    if (name.trim().length < 3) {
      throw new ValidationError('API key name must be at least 3 characters long', {
        field: 'name',
        minLength: 3,
        received: name.trim().length
      });
    }

    if (name.length > 255) {
      throw new ValidationError('API key name must not exceed 255 characters', {
        field: 'name',
        maxLength: 255,
        received: name.length
      });
    }
    
    if (!req.user?.id) {
      throw new BadRequestError('User authentication required');
    }

    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Project slug is required', { field: 'slug' });
    }
    
    // Validate environment
    if (environment !== 'live' && environment !== 'test') {
      throw new ValidationError('Environment must be either "live" or "test"', {
        field: 'environment',
        allowed: ['live', 'test'],
        received: environment
      });
    }

    // Validate usage limit if provided
    if (usageLimit !== undefined) {
      const parsedLimit = parseInt(usageLimit);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new ValidationError('Usage limit must be a positive number', {
          field: 'usageLimit',
          received: usageLimit
        });
      }
    }

    // Validate rate limit if provided
    if (rateLimit !== undefined) {
      const parsedRate = parseInt(rateLimit);
      if (isNaN(parsedRate) || parsedRate < 1 || parsedRate > 10000) {
        throw new ValidationError('Rate limit must be between 1 and 10000 requests per hour', {
          field: 'rateLimit',
          min: 1,
          max: 10000,
          received: rateLimit
        });
      }
    }

    // Validate permissions if provided
    if (permissions !== undefined && typeof permissions !== 'object') {
      throw new ValidationError('Permissions must be an object', {
        field: 'permissions',
        received: typeof permissions
      });
    }
    
    // Find project by slug
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { slug },
        select: { id: true, userId: true, name: true }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        suggestion: 'Please check the project slug and try again'
      });
    }
    
    // Check if user owns the project
    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to create API keys for this project', {
        projectId: project.id,
        userId: req.user.id,
        ownerId: project.userId
      });
    }
    
    // Parse expiration date if provided
    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        throw new ValidationError('Invalid expiration date format', {
          field: 'expiresAt',
          received: expiresAt,
          expected: 'ISO 8601 date string (e.g., 2025-12-31T23:59:59Z)'
        });
      }
      if (expirationDate <= new Date()) {
        throw new ValidationError('Expiration date must be in the future', {
          field: 'expiresAt',
          received: expirationDate.toISOString(),
          minimum: new Date().toISOString()
        });
      }
    }
    
    // Create the API key
    let apiKey;
    try {
      apiKey = await createApiKey(
        req.user.id,
        project.id,
        name.trim(),
        environment as ApiKeyEnvironment,
        {
          permissions: permissions || { widgets: true, testimonials: true },
          usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
          rateLimit: rateLimit ? parseInt(rateLimit) : 100,
          expiresAt: expirationDate,
        }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to create API key')) {
        throw new BadRequestError(error.message);
      }
      throw handlePrismaError(error);
    }
    
    ResponseHandler.created(res, {
      message: 'API key created successfully',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Full key - only shown this once
        keyPrefix: apiKey.keyPrefix,
        environment,
        createdAt: apiKey.createdAt,
        warning: '⚠️ This is the only time you will see the full API key. Please save it securely.'
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all API keys for a project
 * GET /api/projects/:slug/api-keys
 */
export async function listApiKeysHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    
    if (!req.user?.id) {
      throw new BadRequestError('User authentication required');
    }

    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Project slug is required', { field: 'slug' });
    }
    
    // Find project by slug
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { slug },
        select: { id: true, userId: true, name: true }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        suggestion: 'Please check the project slug and try again'
      });
    }
    
    // Check if user owns the project
    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view API keys for this project', {
        projectId: project.id,
        projectName: project.name
      });
    }
    
    // Get all API keys for the project
    let apiKeys;
    try {
      apiKeys = await listApiKeys(project.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to list API keys')) {
        throw new BadRequestError(error.message);
      }
      throw handlePrismaError(error);
    }
    
    // Remove sensitive data and format response
    const formattedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      permissions: key.permissions,
      usageCount: key.usageCount,
      usageLimit: key.usageLimit,
      rateLimit: key.rateLimit,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));
    
    ResponseHandler.success(res, {
      message: apiKeys.length === 0 
        ? 'No API keys found for this project' 
        : `Found ${apiKeys.length} API key${apiKeys.length === 1 ? '' : 's'}`,
      data: {
        keys: formattedKeys,
        stats: {
          total: apiKeys.length,
          active: formattedKeys.filter(k => k.isActive).length,
          inactive: formattedKeys.filter(k => !k.isActive).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single API key by ID
 * GET /api/projects/:slug/api-keys/:keyId
 */
export async function getApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, keyId } = req.params;
    
    if (!keyId || typeof keyId !== 'string') {
      throw new ValidationError('API key ID is required', {
        field: 'keyId',
        received: keyId
      });
    }
    
    if (!req.user?.id) {
      throw new BadRequestError('User authentication required');
    }

    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Project slug is required', { field: 'slug' });
    }
    
    // Find project by slug
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { slug },
        select: { id: true, userId: true, name: true }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        suggestion: 'Please check the project slug and try again'
      });
    }
    
    // Check if user owns the project
    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view API keys for this project', {
        projectId: project.id,
        projectName: project.name
      });
    }
    
    // Get the API key
    let apiKey;
    try {
      apiKey = await getApiKeyById(keyId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to get API key')) {
        throw new BadRequestError(error.message);
      }
      throw handlePrismaError(error);
    }
    
    if (!apiKey) {
      throw new NotFoundError(`API key with ID "${keyId}" not found`, {
        keyId,
        suggestion: 'The API key may have been deleted'
      });
    }
    
    // Verify the key belongs to this project
    if (apiKey.projectId !== project.id) {
      throw new ForbiddenError('This API key does not belong to the specified project', {
        apiKeyId: keyId,
        apiKeyProject: apiKey.projectId,
        requestedProject: project.id
      });
    }
    
    // Calculate usage percentage if limit exists
    const usagePercentage = apiKey.usageLimit 
      ? Math.round((apiKey.usageCount / apiKey.usageLimit) * 100)
      : null;

    // Check if expired
    const isExpired = apiKey.expiresAt ? apiKey.expiresAt < new Date() : false;

    // Format response (exclude sensitive hash)
    const formattedKey = {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      permissions: apiKey.permissions,
      usageCount: apiKey.usageCount,
      usageLimit: apiKey.usageLimit,
      usagePercentage,
      rateLimit: apiKey.rateLimit,
      isActive: apiKey.isActive,
      isExpired,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
    
    ResponseHandler.success(res, {
      message: 'API key retrieved successfully',
      data: formattedKey
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke (deactivate) an API key
 * DELETE /api/projects/:slug/api-keys/:keyId
 */
export async function revokeApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug, keyId } = req.params;
    
    if (!keyId || typeof keyId !== 'string') {
      throw new ValidationError('API key ID is required', {
        field: 'keyId',
        received: keyId
      });
    }
    
    if (!req.user?.id) {
      throw new BadRequestError('User authentication required');
    }

    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Project slug is required', { field: 'slug' });
    }
    
    // Find project by slug
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { slug },
        select: { id: true, userId: true, name: true }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        suggestion: 'Please check the project slug and try again'
      });
    }
    
    // Check if user owns the project
    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to revoke API keys for this project', {
        projectId: project.id,
        projectName: project.name
      });
    }
    
    // Get the API key to verify ownership
    let apiKey;
    try {
      apiKey = await getApiKeyById(keyId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to get API key')) {
        throw new BadRequestError(error.message);
      }
      throw handlePrismaError(error);
    }
    
    if (!apiKey) {
      throw new NotFoundError(`API key with ID "${keyId}" not found`, {
        keyId,
        suggestion: 'The API key may have already been deleted'
      });
    }
    
    // Verify the key belongs to this project
    if (apiKey.projectId !== project.id) {
      throw new ForbiddenError('This API key does not belong to the specified project', {
        apiKeyId: keyId,
        apiKeyProject: apiKey.projectId,
        requestedProject: project.id
      });
    }

    // Check if already revoked
    if (!apiKey.isActive) {
      throw new BadRequestError('This API key has already been revoked', {
        keyId,
        keyPrefix: apiKey.keyPrefix,
        revokedAt: apiKey.updatedAt
      });
    }
    
    // Revoke the key
    try {
      await revokeApiKey(keyId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to revoke API key')) {
        throw new BadRequestError(error.message);
      }
      throw handlePrismaError(error);
    }
    
    ResponseHandler.success(res, {
      message: `API key "${apiKey.name}" revoked successfully`,
      data: {
        id: keyId,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        revokedAt: new Date(),
        note: 'This API key can no longer be used to access the API'
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all API keys for the authenticated account across projects
 * GET /api/account/api-keys
 */
export async function listAccountApiKeysHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      permissions: key.permissions,
      usageCount: key.usageCount,
      usageLimit: key.usageLimit,
      rateLimit: key.rateLimit,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      project: key.project,
    }));

    ResponseHandler.success(res, {
      message:
        formattedKeys.length === 0
          ? 'No API keys found for your account'
          : `Found ${formattedKeys.length} API key${formattedKeys.length === 1 ? '' : 's'}`,
      data: {
        keys: formattedKeys,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new API key from account settings for a selected project
 * POST /api/account/api-keys
 */
export async function createAccountApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    const {
      name,
      projectSlug,
      environment = 'live',
      permissions,
      usageLimit,
      rateLimit,
      expiresAt,
    } = req.body;

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    if (!name || typeof name !== 'string') {
      throw new ValidationError('API key name is required and must be a string', {
        field: 'name',
        received: typeof name,
      });
    }

    if (name.trim().length < 3) {
      throw new ValidationError('API key name must be at least 3 characters long', {
        field: 'name',
        minLength: 3,
        received: name.trim().length,
      });
    }

    if (!projectSlug || typeof projectSlug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'projectSlug',
        received: typeof projectSlug,
      });
    }

    if (environment !== 'live' && environment !== 'test') {
      throw new ValidationError('Environment must be either "live" or "test"', {
        field: 'environment',
        allowed: ['live', 'test'],
        received: environment,
      });
    }

    if (usageLimit !== undefined) {
      const parsedLimit = parseInt(usageLimit);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new ValidationError('Usage limit must be a positive number', {
          field: 'usageLimit',
          received: usageLimit,
        });
      }
    }

    if (rateLimit !== undefined) {
      const parsedRate = parseInt(rateLimit);
      if (isNaN(parsedRate) || parsedRate < 1 || parsedRate > 10000) {
        throw new ValidationError('Rate limit must be between 1 and 10000 requests per hour', {
          field: 'rateLimit',
          min: 1,
          max: 10000,
          received: rateLimit,
        });
      }
    }

    if (permissions !== undefined && typeof permissions !== 'object') {
      throw new ValidationError('Permissions must be an object', {
        field: 'permissions',
        received: typeof permissions,
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        slug: projectSlug,
        userId,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found or you do not have access', {
        projectSlug,
      });
    }

    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        throw new ValidationError('Invalid expiration date format', {
          field: 'expiresAt',
          received: expiresAt,
        });
      }
      if (expirationDate <= new Date()) {
        throw new ValidationError('Expiration date must be in the future', {
          field: 'expiresAt',
          received: expirationDate.toISOString(),
          minimum: new Date().toISOString(),
        });
      }
    }

    const apiKey = await createApiKey(userId, project.id, name.trim(), environment as ApiKeyEnvironment, {
      permissions: permissions || { widgets: true, testimonials: true },
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      rateLimit: rateLimit ? parseInt(rateLimit) : 100,
      expiresAt: expirationDate,
    });

    ResponseHandler.created(res, {
      message: 'API key created successfully',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        keyPrefix: apiKey.keyPrefix,
        environment,
        createdAt: apiKey.createdAt,
        project,
        warning: '⚠️ This is the only time you will see the full API key. Please save it securely.',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke API key from account settings
 * DELETE /api/account/api-keys/:keyId
 */
export async function revokeAccountApiKeyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    const { keyId } = req.params;

    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    if (!keyId || typeof keyId !== 'string') {
      throw new ValidationError('API key ID is required', {
        field: 'keyId',
        received: keyId,
      });
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundError(`API key with ID "${keyId}" not found`);
    }

    if (!apiKey.isActive) {
      throw new BadRequestError('This API key has already been revoked', {
        keyId,
        keyPrefix: apiKey.keyPrefix,
        revokedAt: apiKey.updatedAt,
      });
    }

    await revokeApiKey(keyId);

    ResponseHandler.success(res, {
      message: `API key "${apiKey.name}" revoked successfully`,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        project: apiKey.project,
        revokedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
}
