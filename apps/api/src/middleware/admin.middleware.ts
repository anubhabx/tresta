import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import { getCachedUser } from '../lib/clerk-cache.js';
import { logger } from '../lib/logger.js';

const adminMiddlewareLogger = logger.child({ module: 'admin-middleware' });

/**
 * Admin authentication middleware
 * 
 * Checks if the authenticated user has admin role in Clerk publicMetadata
 * 
 * Usage:
 * router.get('/admin/metrics', requireAdmin, handler);
 * 
 * Setup in Clerk Dashboard:
 * 1. Go to Users → Select user → Metadata
 * 2. Add to Public Metadata: { "role": "admin" }
 * 
 * @throws UnauthorizedError if user is not authenticated
 * @throws ForbiddenError if user is not an admin
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if user is authenticated
    const { userId } = getAuth(req);

    if (!userId) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Fetch user from Clerk (cached for 60s to avoid redundant API calls)
    const user = await getCachedUser(userId);

    // Check if user has admin role in publicMetadata
    const role = user.publicMetadata?.role as string | undefined;

    if (role !== 'admin') {
      adminMiddlewareLogger.warn({ userId }, 'Access denied for non-admin user');
      return next(new ForbiddenError('Admin access required'));
    }

    // User is admin, proceed
    adminMiddlewareLogger.info(
      { userId, email: user.emailAddresses[0]?.emailAddress },
      'Admin access granted',
    );
    next();
  } catch (error) {
    adminMiddlewareLogger.error({ error }, 'Admin middleware error');
    
    // If it's already one of our custom errors, pass it through
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return next(error);
    }
    
    // For any other error, return forbidden
    return next(new ForbiddenError('Unable to verify admin access'));
  }
};

/**
 * Optional: Check for specific roles
 * 
 * @param allowedRoles - Array of allowed roles
 * @returns Middleware function
 * 
 * @example
 * router.get('/admin/users', requireRole(['admin', 'moderator']), handler);
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return next(new UnauthorizedError('Authentication required'));
      }

      const user = await getCachedUser(userId);
      const role = user.publicMetadata?.role as string | undefined;

      if (!role || !allowedRoles.includes(role)) {
        adminMiddlewareLogger.warn(
          { userId, role, allowedRoles },
          'Access denied for user missing required role',
        );
        return next(new ForbiddenError(`Access requires one of: ${allowedRoles.join(', ')}`));
      }

      adminMiddlewareLogger.info({ userId, role }, 'Role-based access granted');
      next();
    } catch (error) {
      adminMiddlewareLogger.error({ error }, 'Role middleware error');
      
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return next(error);
      }
      
      return next(new ForbiddenError('Unable to verify role access'));
    }
  };
};

/**
 * Optional: Check if user is admin (non-blocking, just adds flag to request)
 * Useful for endpoints that have different behavior for admins
 * 
 * @example
 * router.get('/api/data', checkAdmin, (req, res) => {
 *   if (req.isAdmin) {
 *     // Return admin view
 *   } else {
 *     // Return user view
 *   }
 * });
 */
export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      (req as any).isAdmin = false;
      return next();
    }

    const user = await getCachedUser(userId);
    const role = user.publicMetadata?.role as string | undefined;

    (req as any).isAdmin = role === 'admin';
    next();
  } catch (error) {
    adminMiddlewareLogger.error({ error }, 'Check admin error');
    (req as any).isAdmin = false;
    next();
  }
};
