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
import type {
  WidgetConfig,
  CreateWidgetPayload,
  UpdateWidgetPayload,
  DEFAULT_WIDGET_CONFIG,
} from "@workspace/types";
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

    // Validate the config
    if (!config || typeof config !== "object") {
      throw new BadRequestError("Invalid widget configuration");
    }

    // Type check for config
    if ((config as WidgetConfig).type !== undefined) {
      throw new BadRequestError(
        "Widget configuration does not match the required structure",
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Create the widget
    const widget = await prisma.widget.create({
      data: {
        projectId,
        embedType,
        config,
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

    // Validate the config
    if (config && typeof config !== "object") {
      throw new BadRequestError("Invalid widget configuration");
    }

    // Find the existing widget
    const existingWidget = await prisma.widget.findUnique({
      where: { id: widgetId },
    });

    if (!existingWidget) {
      throw new NotFoundError("Widget not found");
    }

    // Update the widget
    const updatedWidget = await prisma.widget.update({
      where: { id: widgetId },
      data: {
        embedType: embedType ?? existingWidget.embedType,
        config: config ?? existingWidget.config,
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
    
    // Prepare response data - flatten config for widget consumption
    const widgetData = {
      widget: {
        id: widget.id,
        name: widgetConfig.name || widget.Project.name,
        type: widgetConfig.type || 'testimonial',
        layout: widgetConfig.layout || 'list',
        theme: widgetConfig.theme || {},
        settings: widgetConfig.settings || {},
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
