import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors.ts";
import { clerkClient, getAuth } from "@clerk/express";

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);

    if (userId) {
      const user = await clerkClient.users.getUser(userId);

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
