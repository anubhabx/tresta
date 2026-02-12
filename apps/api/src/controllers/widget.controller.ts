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
} from "../lib/errors.js";
import { ResponseHandler } from "../lib/response.js";
import {
  DEFAULT_WIDGET_CONFIG,
  WIDGET_CONFIG_FIELDS,
  type WidgetConfig,
} from "@workspace/types";
import { validateWidgetConfig } from "../validators/widget.validator.js";
import type { WidgetData } from "../../types/api-responses.js";
import { validateApiKey } from "../services/api-key.service.js";

const escapeHtmlAttribute = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const createWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId, config } = req.body;

    // Validate required fields
    if (!projectId || typeof projectId !== "string") {
      throw new ValidationError("Project ID is required and must be a string", {
        field: "projectId",
        received: typeof projectId,
      });
    }

    // Validate the config using Zod schema
    if (!config || typeof config !== "object") {
      throw new ValidationError(
        "Widget configuration is required and must be an object",
        {
          field: "config",
          received: typeof config,
        },
      );
    }

    let validatedConfig: WidgetConfig;
    try {
      validatedConfig = validateWidgetConfig(config);
    } catch (error: any) {
      throw new ValidationError(
        `Invalid widget configuration: ${error.message}`,
        {
          field: "config",
          error: error.message,
        },
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
        suggestion: "Please check the project ID",
      });
    }

    // Create the widget with validated config
    const normalizedConfig = normalizeWidgetConfig(validatedConfig);

    let widget;
    try {
      widget = await prisma.widget.create({
        data: {
          projectId,
          config: normalizedConfig as any,
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
      const nextConfig = normalizeWidgetConfig({
        ...(existingWidget.config as WidgetConfig),
        ...(validatedConfig ?? {}),
      });

      updatedWidget = await prisma.widget.update({
        where: { id: widgetId },
        data: {
          config: nextConfig as any,
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
    if (!widgetId || typeof widgetId !== "string") {
      throw new ValidationError("Widget ID is required and must be a string", {
        field: "widgetId",
        received: typeof widgetId,
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
        suggestion: "The widget may have already been deleted",
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
    const runtimeConfig = mergeWithWidgetDefaults(
      widget.config as WidgetConfig,
    );

    // Prepare response data - flatten config for widget consumption
    const widgetData = {
      widget: {
        id: widget.id,
        name: widget.Project.name,
        type: "testimonial",
        layout: runtimeConfig.layout || "grid",
        theme: {
          primaryColor: runtimeConfig.primaryColor,
          secondaryColor: runtimeConfig.secondaryColor,
        },
        settings: runtimeConfig,
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
    const apiKeyParam = req.query.apiKey;
    const apiKey = Array.isArray(apiKeyParam) ? apiKeyParam[0] : apiKeyParam;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    if (!apiKey || typeof apiKey !== "string") {
      throw new BadRequestError(
        "API key is required. Append ?apiKey=YOUR_API_KEY to the iframe URL.",
      );
    }

    const apiKeyValidation = await validateApiKey(apiKey);

    if (!apiKeyValidation.isValid) {
      throw new UnauthorizedError(
        apiKeyValidation.reason || "Invalid API key provided",
      );
    }

    const sanitizedApiKey = escapeHtmlAttribute(apiKey);

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
  <script src="${widgetScriptUrl}" data-widget-id="${widgetId}" data-tresta-widget="${widgetId}" data-api-url="${apiUrl}" data-container="#widget-container" data-api-key="${sanitizedApiKey}"></script>
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

const MAX_MVP_TESTIMONIALS = 20;
const MIN_ROTATE_INTERVAL = 2000;
const MAX_ROTATE_INTERVAL = 10000;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mergeWithWidgetDefaults(config?: WidgetConfig | null): WidgetConfig {
  const merged = {
    ...DEFAULT_WIDGET_CONFIG,
    ...(config ?? {}),
  } as WidgetConfig;

  merged.maxTestimonials = clamp(
    merged.maxTestimonials ?? DEFAULT_WIDGET_CONFIG.maxTestimonials,
    1,
    MAX_MVP_TESTIMONIALS,
  );

  merged.rotateInterval = clamp(
    merged.rotateInterval ?? DEFAULT_WIDGET_CONFIG.rotateInterval,
    MIN_ROTATE_INTERVAL,
    MAX_ROTATE_INTERVAL,
  );

  if (merged.layout !== "carousel") {
    merged.autoRotate = false;
  }

  if (!merged.theme) {
    merged.theme = DEFAULT_WIDGET_CONFIG.theme;
  }

  if (!merged.primaryColor) {
    merged.primaryColor = DEFAULT_WIDGET_CONFIG.primaryColor;
  }

  if (!merged.secondaryColor) {
    merged.secondaryColor = DEFAULT_WIDGET_CONFIG.secondaryColor;
  }

  return merged;
}

function normalizeWidgetConfig(config?: Partial<WidgetConfig>): WidgetConfig {
  const merged = mergeWithWidgetDefaults(config as WidgetConfig);
  return WIDGET_CONFIG_FIELDS.reduce((acc, key) => {
    (acc as Record<string, unknown>)[key as string] = merged[key];
    return acc;
  }, {} as WidgetConfig);
}
