import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "../lib/errors.js";
import {
  ResponseHandler,
  extractPaginationParams,
  calculateSkip,
} from "../lib/response.js";
import type { ProjectData } from "../../types/api-responses.js";
import { requireUserId } from "../lib/auth.js";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  zodErrorDetails,
} from "../validators/schemas.js";
import { assertCanUseCustomColors } from "../services/plan-gate.service.js";
import { getAppBaseUrl } from "../config/urls.js";

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
    const parsedBody = CreateProjectSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError("Validation failed", {
        issues: zodErrorDetails(parsedBody.error),
      });
    }

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
      formConfig,
    } = parsedBody.data;
    const id = requireUserId(req);

    await assertCanUseCustomColors(
      id,
      { primaryColor: brandColorPrimary, secondaryColor: brandColorSecondary },
      "brand",
    );

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
        field: "slug",
        value: slug,
        suggestion: "Please choose a different slug",
      });
    }

    // Auto-generate collection form URL if not provided
    const finalCollectionFormUrl =
      collectionFormUrl || `${getAppBaseUrl()}/testimonials/${slug}`;

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formConfig: formConfig ? (formConfig as any) : undefined,
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
    const userId = requireUserId(req);

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
    const userId = requireUserId(req);

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
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
        suggestion:
          "Please check the project slug or ensure you have access to this project",
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

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
      });
    }

    let project;
    try {
      project = await prisma.project.findFirst({
        where: {
          slug,
          // visibility: "PUBLIC", // We need to fetch private projects too for the collection form
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          projectType: true,
          brandColorPrimary: true,
          brandColorSecondary: true,
          formConfig: true,
          user: {
            select: {
              plan: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!project) {
      throw new NotFoundError("Project not found", {
        slug,
        suggestion:
          "This project may be inactive. Please contact the project owner.",
      });
    }

    // Check plan limits
    const isPro = project.user.plan === "PRO";
    const data: any = { ...project };

    // Apply feature gates
    // Logos are free, but colors are premium
    if (!isPro) {
      data.brandColorPrimary = null;
      data.brandColorSecondary = null;
    }

    // Remove internal user data
    delete (data as any).user;

    return ResponseHandler.success(res, {
      message: "Public project retrieved successfully",
      data,
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
    const parsedBody = UpdateProjectSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new ValidationError("Validation failed", {
        issues: zodErrorDetails(parsedBody.error),
      });
    }
    const payload = parsedBody.data;
    const userId = requireUserId(req);

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
      });
    }

    await assertCanUseCustomColors(
      userId,
      {
        primaryColor: payload.brandColorPrimary,
        secondaryColor: payload.brandColorSecondary,
      },
      "brand",
    );

    // Check if project exists and belongs to user
    let existingProject;
    try {
      existingProject = await prisma.project.findFirst({
        where: { slug, userId },
        include: { user: true },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!existingProject) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        userId,
        suggestion:
          "Please check the project slug or ensure you have access to this project",
      });
    }

    if (payload.slug !== undefined) {
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
          field: "slug",
          value: payload.slug,
          suggestion: "Please choose a different slug",
        });
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
    if (payload.isActive !== undefined) {
      // If we are activating an inactive project, check limits
      if (payload.isActive === true && !existingProject.isActive) {
        const { PLAN_LIMITS, FALLBACK_PLAN_LIMITS } = await import(
          "../config/constants.js"
        );
        const { getUsageCount } = await import("../services/usage.service.js");
        const limits =
          PLAN_LIMITS[existingProject.user.plan] ?? PLAN_LIMITS.FREE;
        const limit = limits.projects ?? FALLBACK_PLAN_LIMITS.projects ?? 0;

        if (limit !== -1) {
          const count = await getUsageCount("projects", userId);
          if (count >= limit) {
            throw new ConflictError(
              `You have reached the limit for projects (${limit}). Please upgrade or deactivate another project first.`,
            );
          }
        }
      }
      updateData.isActive = payload.isActive;
    }

    // Add moderation settings
    if (payload.autoModeration !== undefined)
      updateData.autoModeration = payload.autoModeration;
    if (payload.autoApproveVerified !== undefined)
      updateData.autoApproveVerified = payload.autoApproveVerified;
    if (payload.profanityFilterLevel !== undefined)
      updateData.profanityFilterLevel = payload.profanityFilterLevel;
    if (payload.moderationSettings !== undefined)
      updateData.moderationSettings = payload.moderationSettings;

    // Add form config
    if (payload.formConfig !== undefined) {
      if (payload.formConfig !== null) {
        const fc = payload.formConfig;
        // Validate string fields
        if (
          fc.headerTitle !== undefined &&
          typeof fc.headerTitle !== "string"
        ) {
          throw new BadRequestError("Header title must be a string");
        }
        if (fc.headerTitle && fc.headerTitle.length > 200) {
          throw new BadRequestError(
            "Header title must be less than 200 characters",
          );
        }
        if (
          fc.headerDescription !== undefined &&
          typeof fc.headerDescription !== "string"
        ) {
          throw new BadRequestError("Header description must be a string");
        }
        if (fc.headerDescription && fc.headerDescription.length > 500) {
          throw new BadRequestError(
            "Header description must be less than 500 characters",
          );
        }
        if (
          fc.thankYouMessage !== undefined &&
          typeof fc.thankYouMessage !== "string"
        ) {
          throw new BadRequestError("Thank you message must be a string");
        }
        if (fc.thankYouMessage && fc.thankYouMessage.length > 500) {
          throw new BadRequestError(
            "Thank you message must be less than 500 characters",
          );
        }
        // Validate boolean fields
        const boolFields = [
          "enableRating",
          "enableJobTitle",
          "enableCompany",
          "enableAvatar",
          "enableVideoUrl",
          "enableGoogleVerification",
          "requireRating",
          "requireJobTitle",
          "requireCompany",
          "requireAvatar",
          "requireVideoUrl",
          "requireGoogleVerification",
          "allowAnonymousSubmissions",
          "allowFingerprintOptOut",
          "notifyOnSubmission",
        ] as const;
        for (const field of boolFields) {
          if (fc[field] !== undefined && typeof fc[field] !== "boolean") {
            throw new BadRequestError(`${field} must be a boolean`);
          }
        }

        if (fc.enableRating === false && fc.requireRating === true) {
          throw new BadRequestError(
            "Rating cannot be required when rating is disabled",
          );
        }
        if (fc.enableJobTitle === false && fc.requireJobTitle === true) {
          throw new BadRequestError(
            "Job title cannot be required when the field is disabled",
          );
        }
        if (fc.enableCompany === false && fc.requireCompany === true) {
          throw new BadRequestError(
            "Company cannot be required when the field is disabled",
          );
        }
        if (fc.enableAvatar === false && fc.requireAvatar === true) {
          throw new BadRequestError(
            "Avatar cannot be required when uploads are disabled",
          );
        }
        if (fc.enableVideoUrl === false && fc.requireVideoUrl === true) {
          throw new BadRequestError(
            "Video URL cannot be required when the field is disabled",
          );
        }
        if (
          fc.enableGoogleVerification === false &&
          fc.requireGoogleVerification === true
        ) {
          throw new BadRequestError(
            "Google verification cannot be required when it is disabled",
          );
        }
      }
      updateData.formConfig = payload.formConfig;
    }

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
    const userId = requireUserId(req);

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
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
        suggestion:
          "Please check the project slug or ensure you have access to this project",
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

    return ResponseHandler.deleted(
      res,
      `Project "${existingProject.name}" deleted successfully`,
    );
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
