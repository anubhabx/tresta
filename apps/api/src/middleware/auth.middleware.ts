import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from '../lib/errors.js';
import { getAuth } from "@clerk/express";
import { getCachedUser } from '../lib/clerk-cache.js';

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = getAuth(req);

    if (userId) {
      const user = await getCachedUser(userId);

      if (!user) {
        return next(new UnauthorizedError("Unauthorized"));
      }

      req.user = { id: user.id, email: user.emailAddresses[0]?.emailAddress };
    }

    return next();
  } catch (error) {
    return next(new UnauthorizedError("Unauthorized"));
  }
};

/**
 * Middleware that rejects unauthenticated requests with 401.
 * Use after `attachUser` on protected routes. Public/webhook routes
 * should NOT use this middleware.
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }
  return next();
};
