import type { Request } from 'express';
import { UnauthorizedError } from './errors.js';

/**
 * Canonical way to read authenticated user ID in API controllers.
 *
 * All protected routes are expected to run `attachUser` + `requireAuth` first.
 * This helper keeps controller logic consistent and avoids duplicated guard code.
 */
export function requireUserId(req: Request): string {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  return userId;
}
