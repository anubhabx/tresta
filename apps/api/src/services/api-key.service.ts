/**
 * API Key Service
 * Handles generation, validation, and management of API keys
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@workspace/database/prisma';
import type { ApiKey } from '@workspace/database/prisma';

/**
 * API Key environment types
 */
export type ApiKeyEnvironment = 'live' | 'test';

/**
 * API Key generation result
 */
export interface ApiKeyResult {
  id: string;
  name: string;
  key: string; // Full key - only shown once
  keyPrefix: string;
  createdAt: Date;
}

/**
 * API Key validation result
 */
export interface ApiKeyValidation {
  isValid: boolean;
  apiKey?: ApiKey;
  reason?: string;
}

/**
 * Generate a random API key
 * Format: tresta_[env]_[32_random_chars]
 */
export function generateApiKey(env: ApiKeyEnvironment = 'live'): string {
  // Generate 24 random bytes (will be 32 chars in base64 URL-safe)
  const randomBytes = crypto.randomBytes(24);
  const randomString = randomBytes.toString('base64url').substring(0, 32);
  
  return `tresta_${env}_${randomString}`;
}

/**
 * Hash an API key using bcrypt
 */
export async function hashApiKey(key: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(key, saltRounds);
}

/**
 * Extract prefix from API key for display
 * Returns: tresta_live_abcd1234
 */
export function getKeyPrefix(key: string): string {
  const parts = key.split('_');
  if (parts.length >= 3 && parts[2]) {
    // Return tresta_env_[first 8 chars]
    return `${parts[0]}_${parts[1]}_${parts[2].substring(0, 8)}`;
  }
  return key.substring(0, 20); // Fallback
}

/**
 * Create a new API key for a project
 */
export async function createApiKey(
  userId: string,
  projectId: string,
  name: string,
  env: ApiKeyEnvironment = 'live',
  options?: {
    permissions?: Record<string, boolean>;
    usageLimit?: number;
    rateLimit?: number;
    expiresAt?: Date;
  }
): Promise<ApiKeyResult> {
  try {
    // Validate inputs
    if (!userId || !projectId || !name) {
      throw new Error('Missing required parameters: userId, projectId, and name are required');
    }

    if (name.length < 3 || name.length > 255) {
      throw new Error('API key name must be between 3 and 255 characters');
    }

    // Validate usage limit
    if (options?.usageLimit !== undefined && options.usageLimit < 1) {
      throw new Error('Usage limit must be a positive number');
    }

    // Validate rate limit
    if (options?.rateLimit !== undefined && (options.rateLimit < 1 || options.rateLimit > 10000)) {
      throw new Error('Rate limit must be between 1 and 10000 requests per hour');
    }

    // Generate the API key
    const key = generateApiKey(env);
    const keyHash = await hashApiKey(key);
    const keyPrefix = getKeyPrefix(key);

    // Create in database
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        userId,
        projectId,
        permissions: options?.permissions || { widgets: true, testimonials: true },
        usageLimit: options?.usageLimit,
        rateLimit: options?.rateLimit || 100,
        expiresAt: options?.expiresAt,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key, // Return full key - this is the only time it will be shown
      keyPrefix: apiKey.keyPrefix,
      createdAt: apiKey.createdAt,
    };
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }
    throw new Error('Failed to create API key due to an unknown error');
  }
}

/**
 * Validate an API key
 */
export async function validateApiKey(key: string): Promise<ApiKeyValidation> {
  try {
    // Basic format validation
    if (!key || typeof key !== 'string') {
      return { isValid: false, reason: 'API key is required' };
    }

    if (!key.startsWith('tresta_')) {
      return { isValid: false, reason: 'Invalid API key format. Key must start with "tresta_"' };
    }

    // Extract environment from key
    const parts = key.split('_');
    if (parts.length < 3) {
      return { isValid: false, reason: 'Invalid API key format. Malformed key structure' };
    }

    const env = parts[1];
    if (env !== 'live' && env !== 'test') {
      return { isValid: false, reason: 'Invalid API key environment' };
    }

    // Find all active API keys (we need to check the hash)
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        isActive: true,
      },
      include: {
        project: {
          select: {
            id: true,
            isActive: true,
            visibility: true,
          },
        },
      },
    });

    // Check each key's hash
    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(key, apiKey.keyHash);
      
      if (isMatch) {
        // Check if expired
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          return { 
            isValid: false, 
            reason: `API key expired on ${apiKey.expiresAt.toISOString()}` 
          };
        }

        // Check usage limit
        if (apiKey.usageLimit && apiKey.usageCount >= apiKey.usageLimit) {
          return { 
            isValid: false, 
            reason: `API key usage limit exceeded (${apiKey.usageCount}/${apiKey.usageLimit})` 
          };
        }

        // Check if project is active
        if (!apiKey.project?.isActive) {
          return { 
            isValid: false, 
            reason: 'Associated project is not active' 
          };
        }

        return { isValid: true, apiKey };
      }
    }

    return { isValid: false, reason: 'API key not found or invalid' };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { 
      isValid: false, 
      reason: 'Failed to validate API key due to a server error' 
    };
  }
}

/**
 * Increment usage count for an API key
 */
export async function incrementUsage(apiKeyId: string): Promise<void> {
  try {
    if (!apiKeyId) {
      throw new Error('API key ID is required');
    }

    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  } catch (error) {
    // Log error but don't throw - usage tracking shouldn't break the request
    console.error('Failed to increment API key usage:', error);
  }
}

/**
 * Revoke an API key (soft delete by setting isActive to false)
 */
export async function revokeApiKey(apiKeyId: string): Promise<void> {
  try {
    if (!apiKeyId) {
      throw new Error('API key ID is required');
    }

    const result = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false },
    });

    if (!result) {
      throw new Error('API key not found');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }
    throw new Error('Failed to revoke API key due to an unknown error');
  }
}

/**
 * List API keys for a project
 */
export async function listApiKeys(projectId: string): Promise<ApiKey[]> {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    return await prisma.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to list API keys: ${error.message}`);
    }
    throw new Error('Failed to list API keys due to an unknown error');
  }
}

/**
 * Get API key by ID
 */
export async function getApiKeyById(id: string): Promise<ApiKey | null> {
  try {
    if (!id) {
      throw new Error('API key ID is required');
    }

    return await prisma.apiKey.findUnique({
      where: { id },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get API key: ${error.message}`);
    }
    throw new Error('Failed to get API key due to an unknown error');
  }
}
