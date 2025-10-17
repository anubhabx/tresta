import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "../lib/errors.ts";
import {
  ResponseHandler,
  extractPaginationParams,
  calculateSkip,
} from "../lib/response.ts";

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
      where: { slug },
    });

    if (existingProject) {
      throw new ConflictError("Project with this slug already exists");
    }

    const newProject = await prisma.project.create({
      data: {
        userId: id,
        name,
        description,
        slug,
      },
    });

    return ResponseHandler.created(res, {
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    next(error);
  }
};

const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
              testimonials: true,
            },
          },
        },
      }),
      prisma.project.count({ where: { userId } }),
    ]);

    return ResponseHandler.paginated(res, {
      data: projects,
      page,
      limit,
      total,
      message: "Projects retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getProjectBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const project = await prisma.project.findFirst({
      where: { slug, userId },
      include: {
        _count: {
          select: {
            testimonials: true,
            widgets: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return ResponseHandler.success(res, {
      message: "Project retrieved successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const { name, description, isActive } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { slug, userId },
    });

    if (!existingProject) {
      throw new NotFoundError("Project not found");
    }

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: existingProject.id },
      data: updateData,
      include: {
        _count: {
          select: {
            testimonials: true,
            widgets: true,
          },
        },
      },
    });

    return ResponseHandler.updated(res, {
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { slug, userId },
    });

    if (!existingProject) {
      throw new NotFoundError("Project not found");
    }

    // Delete project (cascade will handle related testimonials and widgets)
    await prisma.project.delete({
      where: { id: existingProject.id },
    });

    return ResponseHandler.deleted(res, "Project deleted successfully");
  } catch (error) {
    next(error);
  }
};

export {
  createProject,
  listProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
};
