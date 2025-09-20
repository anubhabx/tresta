import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  ApiError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
  handlePrismaError
} from "../lib/errors.ts";

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, decription } = req.body;

    if (!name) {
      throw new BadRequestError("Project name is required");
    }
  } catch (error) {
    next(new InternalServerError("Failed to create product"));
  }
};
