import type { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.ts';

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

    // Fetch user from Clerk to check metadata
    const user = await clerkClient.users.getUser(userId);

    // Check if user has admin role in publicMetadata
    const role = user.publicMetadata?.role as string | undefined;

    if (role !== 'admin') {
      console.warn(`Access denied: User ${userId} attempted to access admin endpoint without admin role`);
      return next(new ForbiddenError('Admin access required'));
    }

    // User is admin, proceed
    console.log(`Admin access granted: User ${userId} (${user.emailAddresses[0]?.emailAddress})`);
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    
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

      const user = await clerkClient.users.getUser(userId);
      const role = user.publicMetadata?.role as string | undefined;

      if (!role || !allowedRoles.includes(role)) {
        console.warn(`Access denied: User ${userId} with role "${role}" attempted to access endpoint requiring roles: ${allowedRoles.join(', ')}`);
        return next(new ForbiddenError(`Access requires one of: ${allowedRoles.join(', ')}`));
      }

      console.log(`Role-based access granted: User ${userId} with role "${role}"`);
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      
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

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;

    (req as any).isAdmin = role === 'admin';
    next();
  } catch (error) {
    console.error('Check admin error:', error);
    (req as any).isAdmin = false;
    next();
  }
};
