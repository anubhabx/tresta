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
import {
  isValidHexColor,
  isValidUrl,
  isValidSlug,
  isValidProjectType,
  isValidVisibility,
  validateSocialLinks,
  validateTags,
} from "../lib/validators.ts";
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectData,
} from "../../types/api-responses.js";

/**
 * Helper to serialize Prisma Project to ProjectData
 */
const serializeProject = (project: any): ProjectData => {
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
};

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      shortDescription,
      description,
      slug,
      logoUrl,
      projectType,
      websiteUrl,
      collectionFormUrl,
      brandColorPrimary,
      brandColorSecondary,
      socialLinks,
      tags,
      visibility,
    } = req.body as CreateProjectPayload;
    const id = req.user?.id;

    if (!id) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Required field validations
    if (!name || name.trim().length === 0) {
      throw new BadRequestError("Project name is required");
    }

    if (name.length > 255) {
      throw new BadRequestError(
        "Project name must be less than 255 characters",
      );
    }

    if (!slug || slug.trim().length === 0) {
      throw new BadRequestError("Project slug is required");
    }

    if (!isValidSlug(slug)) {
      throw new BadRequestError(
        "Slug can only contain lowercase letters, numbers, and hyphens",
      );
    }

    if (slug.length > 255) {
      throw new BadRequestError("Slug must be less than 255 characters");
    }

    // Optional field validations
    if (shortDescription && shortDescription.length > 500) {
      throw new BadRequestError(
        "Short description must be less than 500 characters",
      );
    }

    if (description && description.length > 10000) {
      throw new BadRequestError(
        "Description must be less than 10,000 characters",
      );
    }

    if (logoUrl && !isValidUrl(logoUrl)) {
      throw new BadRequestError("Invalid logo URL format");
    }

    if (projectType && !isValidProjectType(projectType)) {
      throw new BadRequestError("Invalid project type");
    }

    if (websiteUrl && !isValidUrl(websiteUrl)) {
      throw new BadRequestError("Invalid website URL format");
    }

    if (collectionFormUrl && !isValidUrl(collectionFormUrl)) {
      throw new BadRequestError("Invalid collection form URL format");
    }

    if (brandColorPrimary && !isValidHexColor(brandColorPrimary)) {
      throw new BadRequestError(
        "Invalid primary brand color. Use hex format (e.g., #FF5733)",
      );
    }

    if (brandColorSecondary && !isValidHexColor(brandColorSecondary)) {
      throw new BadRequestError(
        "Invalid secondary brand color. Use hex format (e.g., #FF5733)",
      );
    }

    if (socialLinks) {
      const { valid, errors } = validateSocialLinks(socialLinks);
      if (!valid) {
        throw new BadRequestError(`Invalid social links: ${errors.join(", ")}`);
      }
    }

    if (tags) {
      const { valid, errors } = validateTags(tags);
      if (!valid) {
        throw new BadRequestError(`Invalid tags: ${errors.join(", ")}`);
      }
    }

    if (visibility && !isValidVisibility(visibility)) {
      throw new BadRequestError("Invalid visibility option");
    }

    // Check for existing project with same slug
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      throw new ConflictError("Project with this slug already exists");
    }

    // Auto-generate collection form URL if not provided
    const finalCollectionFormUrl =
      collectionFormUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/testimonials/${slug}`;

    // Create project
    const newProject = await prisma.project.create({
      data: {
        userId: id,
        name: name.trim(),
        shortDescription: shortDescription?.trim() || null,
        description: description?.trim() || null,
        slug: slug.toLowerCase().trim(),
        logoUrl: logoUrl || null,
        projectType: projectType || "OTHER",
        websiteUrl: websiteUrl || null,
        collectionFormUrl: finalCollectionFormUrl,
        brandColorPrimary: brandColorPrimary || null,
        brandColorSecondary: brandColorSecondary || null,
        socialLinks: socialLinks || undefined,
        tags: tags || [],
        visibility: visibility || "PRIVATE",
      },
    });

    return ResponseHandler.created(res, {
      message: "Project created successfully",
      data: serializeProject(newProject),
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
          shortDescription: true,
          slug: true,
          description: true,
          logoUrl: true,
          projectType: true,
          visibility: true,
          tags: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              testimonials: true,
              widgets: true,
            },
          },
        },
      }),
      prisma.project.count({ where: { userId } }),
    ]);

    return ResponseHandler.paginated(res, {
      data: projects.map(serializeProject),
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
      data: serializeProject(project),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public project by slug - no authentication required
 * Only returns PUBLIC projects with limited fields for testimonial collection form
 */
const getPublicProjectBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        slug,
        visibility: "PUBLIC",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        shortDescription: true,
        slug: true,
        logoUrl: true,
        projectType: true,
        websiteUrl: true,
        collectionFormUrl: true,
        brandColorPrimary: true,
        brandColorSecondary: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found or not publicly accessible");
    }

    return ResponseHandler.success(res, {
      message: "Public project retrieved successfully",
      data: serializeProject(project),
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
    const payload = req.body as UpdateProjectPayload;
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

    // Validate optional fields if provided
    if (payload.name !== undefined) {
      if (!payload.name || payload.name.trim().length === 0) {
        throw new BadRequestError("Project name cannot be empty");
      }
      if (payload.name.length > 255) {
        throw new BadRequestError(
          "Project name must be less than 255 characters",
        );
      }
    }

    if (payload.slug !== undefined) {
      if (!payload.slug || payload.slug.trim().length === 0) {
        throw new BadRequestError("Slug cannot be empty");
      }
      if (!isValidSlug(payload.slug)) {
        throw new BadRequestError(
          "Slug can only contain lowercase letters, numbers, and hyphens",
        );
      }
      if (payload.slug.length > 255) {
        throw new BadRequestError("Slug must be less than 255 characters");
      }

      // Check if new slug already exists (and it's not the current project)
      const slugExists = await prisma.project.findFirst({
        where: {
          slug: payload.slug,
          NOT: { id: existingProject.id },
        },
      });

      if (slugExists) {
        throw new ConflictError("Project with this slug already exists");
      }
    }

    if (
      payload.shortDescription !== undefined &&
      payload.shortDescription &&
      payload.shortDescription.length > 500
    ) {
      throw new BadRequestError(
        "Short description must be less than 500 characters",
      );
    }

    if (
      payload.description !== undefined &&
      payload.description &&
      payload.description.length > 10000
    ) {
      throw new BadRequestError(
        "Description must be less than 10,000 characters",
      );
    }

    if (payload.logoUrl !== undefined && payload.logoUrl && !isValidUrl(payload.logoUrl)) {
      throw new BadRequestError("Invalid logo URL format");
    }

    if (
      payload.projectType !== undefined &&
      payload.projectType &&
      !isValidProjectType(payload.projectType)
    ) {
      throw new BadRequestError("Invalid project type");
    }

    if (payload.websiteUrl !== undefined && payload.websiteUrl && !isValidUrl(payload.websiteUrl)) {
      throw new BadRequestError("Invalid website URL format");
    }

    if (
      payload.collectionFormUrl !== undefined &&
      payload.collectionFormUrl &&
      !isValidUrl(payload.collectionFormUrl)
    ) {
      throw new BadRequestError("Invalid collection form URL format");
    }

    if (
      payload.brandColorPrimary !== undefined &&
      payload.brandColorPrimary &&
      !isValidHexColor(payload.brandColorPrimary)
    ) {
      throw new BadRequestError(
        "Invalid primary brand color. Use hex format (e.g., #FF5733)",
      );
    }

    if (
      payload.brandColorSecondary !== undefined &&
      payload.brandColorSecondary &&
      !isValidHexColor(payload.brandColorSecondary)
    ) {
      throw new BadRequestError(
        "Invalid secondary brand color. Use hex format (e.g., #FF5733)",
      );
    }

    if (payload.socialLinks !== undefined) {
      const { valid, errors } = validateSocialLinks(payload.socialLinks);
      if (!valid) {
        throw new BadRequestError(`Invalid social links: ${errors.join(", ")}`);
      }
    }

    if (payload.tags !== undefined) {
      const { valid, errors } = validateTags(payload.tags);
      if (!valid) {
        throw new BadRequestError(`Invalid tags: ${errors.join(", ")}`);
      }
    }

    if (payload.visibility !== undefined && !isValidVisibility(payload.visibility)) {
      throw new BadRequestError("Invalid visibility option");
    }

    // Build update data object
    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.shortDescription !== undefined)
      updateData.shortDescription = payload.shortDescription?.trim() || null;
    if (payload.description !== undefined)
      updateData.description = payload.description?.trim() || null;
    if (payload.slug !== undefined) updateData.slug = payload.slug.toLowerCase().trim();
    if (payload.logoUrl !== undefined) updateData.logoUrl = payload.logoUrl || null;
    if (payload.projectType !== undefined) updateData.projectType = payload.projectType;
    if (payload.websiteUrl !== undefined) updateData.websiteUrl = payload.websiteUrl || null;
    if (payload.collectionFormUrl !== undefined)
      updateData.collectionFormUrl = payload.collectionFormUrl || null;
    if (payload.brandColorPrimary !== undefined)
      updateData.brandColorPrimary = payload.brandColorPrimary || null;
    if (payload.brandColorSecondary !== undefined)
      updateData.brandColorSecondary = payload.brandColorSecondary || null;
    if (payload.socialLinks !== undefined) updateData.socialLinks = payload.socialLinks;
    if (payload.tags !== undefined) updateData.tags = payload.tags;
    if (payload.visibility !== undefined) updateData.visibility = payload.visibility;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

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
      data: serializeProject(updatedProject),
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
  getPublicProjectBySlug,
  updateProject,
  deleteProject,
};
