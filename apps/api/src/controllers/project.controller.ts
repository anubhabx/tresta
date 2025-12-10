import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  handlePrismaError,
} from '../lib/errors.js';
import {
  ResponseHandler,
  extractPaginationParams,
  calculateSkip,
} from '../lib/response.js';
import {
  isValidHexColor,
  isValidUrl,
  isValidSlug,
  isValidProjectType,
  isValidVisibility,
  validateSocialLinks,
  validateTags,
} from '../lib/validators.js';
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
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError("Project name is required and must be a non-empty string", {
        field: 'name',
        received: typeof name
      });
    }

    if (name.length > 255) {
      throw new ValidationError(
        "Project name must be less than 255 characters",
        {
          field: 'name',
          maxLength: 255,
          received: name.length
        }
      );
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      throw new ValidationError("Project slug is required and must be a non-empty string", {
        field: 'slug',
        received: typeof slug
      });
    }

    if (!isValidSlug(slug)) {
      throw new ValidationError(
        "Slug can only contain lowercase letters, numbers, and hyphens",
        {
          field: 'slug',
          pattern: '^[a-z0-9-]+$',
          received: slug
        }
      );
    }

    if (slug.length > 255) {
      throw new ValidationError("Slug must be less than 255 characters", {
        field: 'slug',
        maxLength: 255,
        received: slug.length
      });
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
    let existingProject;
    try {
      existingProject = await prisma.project.findUnique({
        where: { slug },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (existingProject) {
      throw new ConflictError("Project with this slug already exists", {
        field: 'slug',
        value: slug,
        suggestion: 'Please choose a different slug'
      });
    }

    // Auto-generate collection form URL if not provided
    const finalCollectionFormUrl =
      collectionFormUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/testimonials/${slug}`;

    // Create project
    let newProject;
    try {
      newProject = await prisma.project.create({
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
    } catch (error) {
      throw handlePrismaError(error);
    }

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

    let projects, total;
    try {
      [projects, total] = await Promise.all([
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
    } catch (error) {
      throw handlePrismaError(error);
    }

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

    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'slug',
        received: typeof slug
      });
    }

    let project;
    try {
      project = await prisma.project.findFirst({
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
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        userId,
        suggestion: 'Please check the project slug or ensure you have access to this project'
      });
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

    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'slug',
        received: typeof slug
      });
    }

    let project;
    try {
      project = await prisma.project.findFirst({
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
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!project) {
      throw new NotFoundError("Project not found or not publicly accessible", {
        slug,
        suggestion: 'This project may be private or inactive. Please contact the project owner.'
      });
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

    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'slug',
        received: typeof slug
      });
    }

    // Check user plan implementation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true } // Assuming 'plan' field stores 'FREE' or 'PRO' or we check subscription
    });
    // In our schema User.plan is an Enum "FREE" | "PRO"

    // Check if trying to update brand colors
    if (
      (payload.brandColorPrimary !== undefined || payload.brandColorSecondary !== undefined) &&
      user?.plan === 'FREE'
    ) {
      throw new ForbiddenError("Brand color customization is available only for Pro plans.");
    }

    // Check if project exists and belongs to user
    let existingProject;
    try {
      existingProject = await prisma.project.findFirst({
        where: { slug, userId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!existingProject) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        userId,
        suggestion: 'Please check the project slug or ensure you have access to this project'
      });
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
      let slugExists;
      try {
        slugExists = await prisma.project.findFirst({
          where: {
            slug: payload.slug,
            NOT: { id: existingProject.id },
          },
        });
      } catch (error) {
        throw handlePrismaError(error);
      }

      if (slugExists) {
        throw new ConflictError("Project with this slug already exists", {
          field: 'slug',
          value: payload.slug,
          suggestion: 'Please choose a different slug'
        });
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

    if (
      payload.logoUrl !== undefined &&
      payload.logoUrl &&
      !isValidUrl(payload.logoUrl)
    ) {
      throw new BadRequestError("Invalid logo URL format");
    }

    if (
      payload.projectType !== undefined &&
      payload.projectType &&
      !isValidProjectType(payload.projectType)
    ) {
      throw new BadRequestError("Invalid project type");
    }

    if (
      payload.websiteUrl !== undefined &&
      payload.websiteUrl &&
      !isValidUrl(payload.websiteUrl)
    ) {
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

    if (
      payload.visibility !== undefined &&
      !isValidVisibility(payload.visibility)
    ) {
      throw new BadRequestError("Invalid visibility option");
    }

    // Validate moderation settings if provided
    if (payload.profanityFilterLevel !== undefined) {
      const validLevels = ["STRICT", "MODERATE", "LENIENT"];
      if (!validLevels.includes(payload.profanityFilterLevel)) {
        throw new BadRequestError(
          "Invalid profanity filter level. Must be STRICT, MODERATE, or LENIENT",
        );
      }
    }

    if (
      payload.moderationSettings !== undefined &&
      payload.moderationSettings
    ) {
      const settings = payload.moderationSettings;

      if (settings.minContentLength !== undefined) {
        if (
          typeof settings.minContentLength !== "number" ||
          settings.minContentLength < 0 ||
          settings.minContentLength > 1000
        ) {
          throw new BadRequestError(
            "Minimum content length must be between 0 and 1000",
          );
        }
      }

      if (settings.maxUrlCount !== undefined) {
        if (
          typeof settings.maxUrlCount !== "number" ||
          settings.maxUrlCount < 0 ||
          settings.maxUrlCount > 10
        ) {
          throw new BadRequestError(
            "Maximum URL count must be between 0 and 10",
          );
        }
      }

      // Validate domain arrays
      if (
        settings.allowedDomains !== undefined &&
        !Array.isArray(settings.allowedDomains)
      ) {
        throw new BadRequestError("Allowed domains must be an array");
      }

      if (
        settings.blockedDomains !== undefined &&
        !Array.isArray(settings.blockedDomains)
      ) {
        throw new BadRequestError("Blocked domains must be an array");
      }

      if (
        settings.customProfanityList !== undefined &&
        !Array.isArray(settings.customProfanityList)
      ) {
        throw new BadRequestError("Custom profanity list must be an array");
      }

      if (
        settings.brandKeywords !== undefined &&
        !Array.isArray(settings.brandKeywords)
      ) {
        throw new BadRequestError("Brand keywords must be an array");
      }
    }

    // Build update data object
    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.shortDescription !== undefined)
      updateData.shortDescription = payload.shortDescription?.trim() || null;
    if (payload.description !== undefined)
      updateData.description = payload.description?.trim() || null;
    if (payload.slug !== undefined)
      updateData.slug = payload.slug.toLowerCase().trim();
    if (payload.logoUrl !== undefined)
      updateData.logoUrl = payload.logoUrl || null;
    if (payload.projectType !== undefined)
      updateData.projectType = payload.projectType;
    if (payload.websiteUrl !== undefined)
      updateData.websiteUrl = payload.websiteUrl || null;
    if (payload.collectionFormUrl !== undefined)
      updateData.collectionFormUrl = payload.collectionFormUrl || null;
    if (payload.brandColorPrimary !== undefined)
      updateData.brandColorPrimary = payload.brandColorPrimary || null;
    if (payload.brandColorSecondary !== undefined)
      updateData.brandColorSecondary = payload.brandColorSecondary || null;
    if (payload.socialLinks !== undefined)
      updateData.socialLinks = payload.socialLinks;
    if (payload.tags !== undefined) updateData.tags = payload.tags;
    if (payload.visibility !== undefined)
      updateData.visibility = payload.visibility;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    // Add moderation settings
    if (payload.autoModeration !== undefined)
      updateData.autoModeration = payload.autoModeration;
    if (payload.autoApproveVerified !== undefined)
      updateData.autoApproveVerified = payload.autoApproveVerified;
    if (payload.profanityFilterLevel !== undefined)
      updateData.profanityFilterLevel = payload.profanityFilterLevel;
    if (payload.moderationSettings !== undefined)
      updateData.moderationSettings = payload.moderationSettings;

    // Update project
    let updatedProject;
    try {
      updatedProject = await prisma.project.update({
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
    } catch (error) {
      throw handlePrismaError(error);
    }

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

    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'slug',
        received: typeof slug
      });
    }

    // Check if project exists and belongs to user
    let existingProject;
    try {
      existingProject = await prisma.project.findFirst({
        where: { slug, userId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!existingProject) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        userId,
        suggestion: 'Please check the project slug or ensure you have access to this project'
      });
    }

    // Delete project (cascade will handle related testimonials and widgets)
    try {
      await prisma.project.delete({
        where: { id: existingProject.id },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.deleted(res, `Project "${existingProject.name}" deleted successfully`);
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
