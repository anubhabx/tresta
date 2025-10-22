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
import type { CreateProjectPayload } from "../types/api-responses.ts";

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
    const {
      name,
      shortDescription,
      description,
      slug: newSlug,
      logoUrl,
      projectType,
      websiteUrl,
      collectionFormUrl,
      brandColorPrimary,
      brandColorSecondary,
      socialLinks,
      tags,
      visibility,
      isActive,
    } = req.body;
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

    // Validate fields if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new BadRequestError("Project name cannot be empty");
      }
      if (name.length > 255) {
        throw new BadRequestError(
          "Project name must be less than 255 characters",
        );
      }
    }

    if (newSlug !== undefined) {
      if (!newSlug || newSlug.trim().length === 0) {
        throw new BadRequestError("Slug cannot be empty");
      }
      if (!isValidSlug(newSlug)) {
        throw new BadRequestError(
          "Slug can only contain lowercase letters, numbers, and hyphens",
        );
      }
      if (newSlug.length > 255) {
        throw new BadRequestError("Slug must be less than 255 characters");
      }

      // Check if new slug is already taken by another project
      const slugExists = await prisma.project.findFirst({
        where: {
          slug: newSlug,
          id: { not: existingProject.id },
        },
      });

      if (slugExists) {
        throw new ConflictError("This slug is already taken");
      }
    }

    if (shortDescription !== undefined && shortDescription.length > 500) {
      throw new BadRequestError(
        "Short description must be less than 500 characters",
      );
    }

    if (description !== undefined && description.length > 10000) {
      throw new BadRequestError(
        "Description must be less than 10,000 characters",
      );
    }

    if (logoUrl !== undefined && logoUrl && !isValidUrl(logoUrl)) {
      throw new BadRequestError("Invalid logo URL format");
    }

    if (projectType !== undefined && !isValidProjectType(projectType)) {
      throw new BadRequestError("Invalid project type");
    }

    if (websiteUrl !== undefined && websiteUrl && !isValidUrl(websiteUrl)) {
      throw new BadRequestError("Invalid website URL format");
    }

    if (
      collectionFormUrl !== undefined &&
      collectionFormUrl &&
      !isValidUrl(collectionFormUrl)
    ) {
      throw new BadRequestError("Invalid collection form URL format");
    }

    if (
      brandColorPrimary !== undefined &&
      brandColorPrimary &&
      !isValidHexColor(brandColorPrimary)
    ) {
      throw new BadRequestError(
        "Invalid primary brand color. Use hex format (e.g., #FF5733)",
      );
    }

    if (
      brandColorSecondary !== undefined &&
      brandColorSecondary &&
      !isValidHexColor(brandColorSecondary)
    ) {
      throw new BadRequestError(
        "Invalid secondary brand color. Use hex format (e.g., #FF5733)",
      );
    }

    if (socialLinks !== undefined) {
      const { valid, errors } = validateSocialLinks(socialLinks);
      if (!valid) {
        throw new BadRequestError(`Invalid social links: ${errors.join(", ")}`);
      }
    }

    if (tags !== undefined) {
      const { valid, errors } = validateTags(tags);
      if (!valid) {
        throw new BadRequestError(`Invalid tags: ${errors.join(", ")}`);
      }
    }

    if (visibility !== undefined && !isValidVisibility(visibility)) {
      throw new BadRequestError("Invalid visibility option");
    }

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (shortDescription !== undefined)
      updateData.shortDescription = shortDescription?.trim() || null;
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (newSlug !== undefined) updateData.slug = newSlug.toLowerCase().trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
    if (projectType !== undefined) updateData.projectType = projectType;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl || null;
    if (collectionFormUrl !== undefined)
      updateData.collectionFormUrl = collectionFormUrl || null;
    if (brandColorPrimary !== undefined)
      updateData.brandColorPrimary = brandColorPrimary || null;
    if (brandColorSecondary !== undefined)
      updateData.brandColorSecondary = brandColorSecondary || null;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (tags !== undefined) updateData.tags = tags;
    if (visibility !== undefined) updateData.visibility = visibility;
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
