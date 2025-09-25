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
    const { name, decription, slug } = req.body;
    const id = req.user?.id;

    if (!id) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!name) {
      throw new BadRequestError("Project name is required");
    }

    const existingProject = await prisma.project.findUnique({
      where: { slug }
    });

    if (existingProject) {
      throw new ConflictError("Project with this slug already exists");
    }

    const newProject = await prisma.project.create({
      data: {
        userId: id,
        name,
        description: decription,
        slug
      }
    });

    res.status(201).json(newProject);
  } catch (error) {
    next(new InternalServerError("Failed to create product"));
  }
};

export { createProject };
