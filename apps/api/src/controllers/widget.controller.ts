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
  ValidationError,
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
    const { projectId, config } = req.body;

    // Validate required fields
    if (!projectId || typeof projectId !== 'string') {
      throw new ValidationError("Project ID is required and must be a string", {
        field: 'projectId',
        received: typeof projectId
      });
    }

    // Validate the config using Zod schema
    if (!config || typeof config !== "object") {
      throw new ValidationError("Widget configuration is required and must be an object", {
        field: 'config',
        received: typeof config
      });
    }

    let validatedConfig: WidgetConfig;
    try {
      validatedConfig = validateWidgetConfig(config);
    } catch (error: any) {
      throw new ValidationError(
        `Invalid widget configuration: ${error.message}`,
        {
          field: 'config',
          error: error.message
        }
      );
    }

    // Check if project exists
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { id: projectId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!project) {
      throw new NotFoundError(`Project with ID "${projectId}" not found`, {
        projectId,
        suggestion: 'Please check the project ID'
      });
    }

    // Create the widget with validated config
    let widget;
    try {
      widget = await prisma.widget.create({
        data: {
          projectId,
          config: validatedConfig as any,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

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
    const { config } = req.body;

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
    let updatedWidget;
    try {
      updatedWidget = await prisma.widget.update({
        where: { id: widgetId },
        data: {
          config: (validatedConfig ?? existingWidget.config) as any,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

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
    if (!widgetId || typeof widgetId !== 'string') {
      throw new ValidationError("Widget ID is required and must be a string", {
        field: 'widgetId',
        received: typeof widgetId
      });
    }

    // Find the existing widget
    let existingWidget;
    try {
      existingWidget = await prisma.widget.findUnique({
        where: { id: widgetId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!existingWidget) {
      throw new NotFoundError(`Widget with ID "${widgetId}" not found`, {
        widgetId,
        suggestion: 'The widget may have already been deleted'
      });
    }

    // Delete the widget
    try {
      await prisma.widget.delete({
        where: { id: widgetId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

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

    console.log("🔍 Fetching widget with ID:", widgetId);

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

    console.log("📦 Widget found:", widget ? "YES" : "NO");
    if (widget) {
      console.log("📋 Widget details:", {
        id: widget.id,
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

    // Verify API key has access to this project
    if (req.apiKey && req.apiKey.projectId !== widget.Project.id) {
      throw new ForbiddenError(
        "API key does not have permission to access this widget's project",
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
        isOAuthVerified: true,
        oauthProvider: true,
        // Exclude sensitive data (email, IP, user agent, OAuth subject, etc.)
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to prevent abuse
    });

    // Parse widget config (it's stored as JSON)
    const widgetConfig = widget.config as any;

    console.log(widgetConfig);

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
      cardStyle: "default",
      animation: "fade",
      layout: "grid",
      theme: "light",
      primaryColor: "#0066FF",
      secondaryColor: "#00CC99",
    };

    // Prepare response data - flatten config for widget consumption
    const widgetData = {
      widget: {
        id: widget.id,
        name: widgetConfig.name || widget.Project.name,
        type: widgetConfig.type || "testimonial",
        layout: widgetConfig.layout || "grid",
        theme: {
          primaryColor:
            widgetConfig.primaryColor || defaultSettings.primaryColor,
          secondaryColor:
            widgetConfig.secondaryColor || defaultSettings.secondaryColor,
        },
        // widgetConfig already contains all the settings directly (not nested)
        settings: { ...defaultSettings, ...widgetConfig },
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
        isOAuthVerified: t.isOAuthVerified,
        oauthProvider: t.oauthProvider,
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

/**
 * Render HTML page for iframe embedding
 */
const renderWidgetPage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    const apiUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`;
    const widgetScriptUrl = `${apiUrl}/widget/tresta-widget.js`;

    // Generate simple HTML page that loads the widget
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tresta Widget</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #widget-container {
      width: 100%;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="widget-container"></div>
  <script src="${widgetScriptUrl}" data-tresta-widget="${widgetId}" data-api-url="${apiUrl}" data-container="#widget-container"></script>
</body>
</html>`;

    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
      "X-Frame-Options": "ALLOWALL",
      "Access-Control-Allow-Origin": "*",
    });

    return res.send(html);
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
  renderWidgetPage,
};
