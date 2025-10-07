import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError
} from "../lib/errors.ts";
import {
  ResponseHandler,
  extractPaginationParams,
  calculateSkip
} from "../lib/response.ts";

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, slug } = req.body;
    const id = req.user?.id;

    if (!id) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!name) {
      throw new BadRequestError("Project name is required");
    }

    if (!slug) {
      throw new BadRequestError("Project slug is required");
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
        description,
        slug
      }
    });

    return ResponseHandler.created(res, {
      message: "Project created successfully",
      data: newProject
    });
  } catch (error) {
    next(error);
  }
};

const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const { page, limit } = extractPaginationParams(req.query);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              testimonials: true
            }
          }
        }
      }),
      prisma.project.count({ where: { userId } })
    ]);

    return ResponseHandler.paginated(res, {
      data: projects,
      page,
      limit,
      total,
      message: "Projects retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};

export { createProject, listProjects };
