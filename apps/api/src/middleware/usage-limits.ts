import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import { ResponseHandler } from "../lib/response.js";

import { getUsageCount } from "../services/usage.service.js";
import { PLAN_LIMITS, FALLBACK_PLAN_LIMITS } from "../config/constants.js";

/**
 * Middleware that enforces resource usage limits based on the user's plan.
 *
 * Uses the `UserPlan` enum on the User model (FREE | PRO) with static
 * PLAN_LIMITS — no Plan table dependency.
 */
export const checkUsageLimit = (
  resource: "projects" | "widgets" | "testimonials" | "teamMembers",
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError("Authentication required");
      }

      // Import prisma lazily to keep the module testable
      const { prisma } = await import("@workspace/database/prisma");

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Resolve limits from the static config based on UserPlan enum
      const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.FREE;
      const limit = limits[resource] ?? FALLBACK_PLAN_LIMITS[resource] ?? 0;

      // -1 means unlimited
      if (limit === -1) {
        return next();
      }

      const count = await getUsageCount(resource, userId);

      if (count >= limit) {
        return ResponseHandler.error(
          res,
          403,
          `You have reached the limit for ${resource} (${limit}) on the ${user.plan === "PRO" ? "Pro" : "Free"} plan.`,
          "LIMIT_EXCEEDED",
          {
            limit,
            current: count,
            resource,
            planName: user.plan === "PRO" ? "Pro Plan" : "Free Plan",
          },
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
