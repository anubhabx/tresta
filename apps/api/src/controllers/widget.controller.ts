import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ApiError,
  ForbiddenError,
  InternalServerError,
  handlePrismaError,
} from "../lib/errors.ts";
import { ResponseHandler } from "../lib/response.ts";
import type { WidgetConfig } from "@workspace/types";
import { validateWidgetConfig } from "../validators/widget.validator.ts";
import type { WidgetData } from "@/types/api-responses.ts";

const createWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId, embedType, config } = req.body;

    // Validate required fields
    if (!projectId || !embedType) {
      throw new BadRequestError("Project ID and embed type are required");
    }

    // Validate the config using Zod schema
    if (!config || typeof config !== "object") {
      throw new BadRequestError("Invalid widget configuration");
    }

    let validatedConfig: WidgetConfig;
    try {
      validatedConfig = validateWidgetConfig(config);
    } catch (error: any) {
      throw new BadRequestError(
        `Invalid widget configuration: ${error.message}`,
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Create the widget with validated config
    const widget = await prisma.widget.create({
      data: {
        projectId,
        embedType,
        config: validatedConfig as any,
      },
    });

    ResponseHandler.success(res, {
      message: "Widget created successfully",
      data: widget,
    });
  } catch (error) {
    next(error);
  }
};

const listWidgets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    // Find project by slug
    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Fetch widgets for the project
    const widgets = await prisma.widget.findMany({
      where: { projectId: project.id },
    });

    ResponseHandler.success(res, {
      message: "Widgets fetched successfully",
      data: widgets,
    });
  } catch (error) {
    next(error);
  }
};

const updateWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;
    const { embedType, config } = req.body;

    // Validate widget ID
    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    // Find the existing widget
    const existingWidget = await prisma.widget.findUnique({
      where: { id: widgetId },
    });

    if (!existingWidget) {
      throw new NotFoundError("Widget not found");
    }

    // Validate the config if provided
    let validatedConfig: WidgetConfig | undefined;
    if (config) {
      if (typeof config !== "object") {
        throw new BadRequestError("Invalid widget configuration");
      }
      try {
        validatedConfig = validateWidgetConfig(config);
      } catch (error: any) {
        throw new BadRequestError(
          `Invalid widget configuration: ${error.message}`,
        );
      }
    }

    // Update the widget
    const updatedWidget = await prisma.widget.update({
      where: { id: widgetId },
      data: {
        embedType: embedType ?? existingWidget.embedType,
        config: (validatedConfig ?? existingWidget.config) as any,
      },
    });

    ResponseHandler.success(res, {
      message: "Widget updated successfully",
      data: updatedWidget,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;

    // Validate widget ID
    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    // Find the existing widget
    const existingWidget = await prisma.widget.findUnique({
      where: { id: widgetId },
    });

    if (!existingWidget) {
      throw new NotFoundError("Widget not found");
    }

    // Delete the widget
    await prisma.widget.delete({
      where: { id: widgetId },
    });

    ResponseHandler.success(res, {
      message: "Widget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch public widget data for embedding
 * No authentication required - public endpoint
 * Returns published testimonials for a specific widget
 */
const fetchPublicWidgetData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;

    console.log('🔍 Fetching widget with ID:', widgetId);

    // Validate widget ID
    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    // Fetch widget with project data
    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: {
        Project: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            brandColorPrimary: true,
            brandColorSecondary: true,
            isActive: true,
            visibility: true,
          },
        },
      },
    });

    console.log('📦 Widget found:', widget ? 'YES' : 'NO');
    if (widget) {
      console.log('📋 Widget details:', {
        id: widget.id,
        embedType: widget.embedType,
        hasProject: !!widget.Project,
        projectName: widget.Project?.name,
        projectVisibility: widget.Project?.visibility,
      });
    }

    // Check if widget exists
    if (!widget) {
      throw new NotFoundError("Widget not found");
    }

    // Security check: Only serve widgets for active public projects
    if (!widget.Project) {
      throw new NotFoundError("Project not found");
    }

    if (!widget.Project.isActive) {
      throw new BadRequestError("This project is not active");
    }

    // Only PUBLIC projects can have their widgets embedded
    if (widget.Project.visibility !== "PUBLIC") {
      throw new ForbiddenError(
        "Widgets can only be embedded for public projects",
      );
    }

    // Fetch published testimonials for this project
    const testimonials = await prisma.testimonial.findMany({
      where: {
        projectId: widget.Project.id,
        isPublished: true, // Only published testimonials
        isApproved: true, // Must be approved
      },
      select: {
        id: true,
        authorName: true,
        authorAvatar: true,
        authorRole: true,
        authorCompany: true,
        content: true,
        rating: true,
        videoUrl: true,
        type: true,
        createdAt: true,
        // Exclude sensitive data (email, IP, user agent, etc.)
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to prevent abuse
    });

    // Parse widget config (it's stored as JSON)
    const widgetConfig = widget.config as any;

    console.log(widgetConfig)

    // Use shared default settings
    const defaultSettings: WidgetConfig = {
      showRating: true,
      showDate: true,
      showAvatar: true,
      showAuthorRole: true,
      showAuthorCompany: true,
      maxTestimonials: 10,
      autoRotate: false,
      rotateInterval: 5000,
      columns: 3,
      gap: 24,
      cardStyle: 'default',
      animation: 'fade',
      layout: 'grid',
      theme: 'light',
      primaryColor: '#0066FF',
      secondaryColor: '#00CC99',
    };

    // Prepare response data - flatten config for widget consumption
    const widgetData = {
      widget: {
        id: widget.id,
        name: widgetConfig.name || widget.Project.name,
        type: widgetConfig.type || 'testimonial',
        layout: widgetConfig.layout || 'grid',
        theme: widgetConfig.theme || {},
        settings: { ...defaultSettings, ...(widgetConfig.settings || {}) },
        embedType: widget.embedType,
      },
      project: {
        name: widget.Project.name,
        slug: widget.Project.slug,
        logoUrl: widget.Project.logoUrl,
        brandColorPrimary: widget.Project.brandColorPrimary,
        brandColorSecondary: widget.Project.brandColorSecondary,
      },
      testimonials: testimonials.map((t) => ({
        id: t.id,
        authorName: t.authorName,
        authorAvatar: t.authorAvatar,
        authorRole: t.authorRole,
        authorCompany: t.authorCompany,
        content: t.content,
        rating: t.rating,
        videoUrl: t.videoUrl,
        type: t.type,
        createdAt: t.createdAt.toISOString(),
      })),
      meta: {
        total: testimonials.length,
        fetchedAt: new Date().toISOString(),
      },
    };

    // Set aggressive caching headers for CDN and browser caching
    // Cache for 5 minutes on CDN, 1 minute on browser
    res.set({
      "Cache-Control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      "CDN-Cache-Control": "public, max-age=300",
      Vary: "Accept-Encoding",
      ETag: `W/"${widgetId}-${testimonials.length}-${Date.now()}"`,
    });

    return ResponseHandler.success(res, {
      message: "Widget data fetched successfully",
      data: widgetData,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createWidget,
  updateWidget,
  listWidgets,
  deleteWidget,
  fetchPublicWidgetData,
};
