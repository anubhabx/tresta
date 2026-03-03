import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "../../lib/errors.js";
import { ResponseHandler } from "../../lib/response.js";
import { validateWidgetConfig } from "../../validators/widget.validator.js";

type PersistedWidgetConfig = Record<string, unknown>;

const getConfigName = (config: PersistedWidgetConfig, widgetId: string): string => {
  const configuredName = config.name;
  if (typeof configuredName === "string" && configuredName.trim().length > 0) {
    return configuredName;
  }

  return `Widget ${widgetId.slice(0, 6)}`;
};

const getConfigType = (config: PersistedWidgetConfig): string => {
  const configuredType = config.type;
  if (typeof configuredType === "string" && configuredType.trim().length > 0) {
    return configuredType;
  }

  return "embed";
};

const mapWidget = (
  widget: {
    id: string;
    projectId: string | null;
    config: unknown;
    createdAt: Date;
    updatedAt: Date;
  },
  impressions: number,
) => {
  const config = (widget.config ?? {}) as PersistedWidgetConfig;

  return {
    id: widget.id,
    projectId: widget.projectId,
    name: getConfigName(config, widget.id),
    type: getConfigType(config),
    config,
    createdAt: widget.createdAt.toISOString(),
    updatedAt: widget.updatedAt.toISOString(),
    stats: {
      impressions,
      clicks: 0,
    },
  };
};

const getImpressionsMap = async (widgetIds: string[]) => {
  if (widgetIds.length === 0) {
    return new Map<string, number>();
  }

  const counts = await prisma.widgetAnalytics.groupBy({
    by: ["widgetId"],
    where: {
      widgetId: {
        in: widgetIds,
      },
    },
    _count: {
      _all: true,
    },
  });

  return new Map<string, number>(
    counts.map((item) => [item.widgetId, item._count._all]),
  );
};

export const listAdminWidgets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId } = req.query;

    let widgets;
    try {
      widgets = await prisma.widget.findMany({
        where:
          typeof projectId === "string" && projectId.trim().length > 0
            ? { projectId }
            : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    const impressionsMap = await getImpressionsMap(widgets.map((widget) => widget.id));

    return ResponseHandler.success(res, {
      message: "Widgets fetched successfully",
      data: {
        widgets: widgets.map((widget) =>
          mapWidget(widget, impressionsMap.get(widget.id) ?? 0),
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminWidgetById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    let widget;
    try {
      widget = await prisma.widget.findUnique({
        where: { id: widgetId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!widget) {
      throw new NotFoundError("Widget not found");
    }

    const impressionsMap = await getImpressionsMap([widget.id]);

    return ResponseHandler.success(res, {
      message: "Widget fetched successfully",
      data: mapWidget(widget, impressionsMap.get(widget.id) ?? 0),
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId, name, type, config } = req.body;

    if (!projectId || typeof projectId !== "string") {
      throw new ValidationError("projectId is required and must be a string", {
        field: "projectId",
      });
    }

    if (!config || typeof config !== "object") {
      throw new ValidationError("config is required and must be an object", {
        field: "config",
      });
    }

    let validatedConfig;
    try {
      validatedConfig = validateWidgetConfig(config);
    } catch (error: any) {
      throw new ValidationError(`Invalid widget configuration: ${error.message}`, {
        field: "config",
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const nextConfig: PersistedWidgetConfig = {
      ...(validatedConfig as PersistedWidgetConfig),
      ...(typeof name === "string" && name.trim().length > 0 ? { name } : {}),
      ...(typeof type === "string" && type.trim().length > 0 ? { type } : {}),
    };

    let widget;
    try {
      widget = await prisma.widget.create({
        data: {
          projectId,
          config: nextConfig as any,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.success(res, {
      message: "Widget created successfully",
      data: mapWidget(widget, 0),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;
    const { name, type, config } = req.body;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    let existingWidget;
    try {
      existingWidget = await prisma.widget.findUnique({
        where: { id: widgetId },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!existingWidget) {
      throw new NotFoundError("Widget not found");
    }

    let validatedPatch: PersistedWidgetConfig = {};
    if (config !== undefined) {
      if (!config || typeof config !== "object") {
        throw new ValidationError("config must be an object", {
          field: "config",
        });
      }

      try {
        validatedPatch = validateWidgetConfig(config) as PersistedWidgetConfig;
      } catch (error: any) {
        throw new ValidationError(`Invalid widget configuration: ${error.message}`, {
          field: "config",
        });
      }
    }

    const mergedConfig: PersistedWidgetConfig = {
      ...((existingWidget.config ?? {}) as PersistedWidgetConfig),
      ...validatedPatch,
      ...(typeof name === "string" && name.trim().length > 0 ? { name } : {}),
      ...(typeof type === "string" && type.trim().length > 0 ? { type } : {}),
    };

    let updatedWidget;
    try {
      updatedWidget = await prisma.widget.update({
        where: { id: widgetId },
        data: {
          config: mergedConfig as any,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    const impressionsMap = await getImpressionsMap([updatedWidget.id]);

    return ResponseHandler.success(res, {
      message: "Widget updated successfully",
      data: mapWidget(updatedWidget, impressionsMap.get(updatedWidget.id) ?? 0),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminWidget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    try {
      await prisma.widget.delete({
        where: { id: widgetId },
      });
    } catch (error: any) {
      if (error?.code === "P2025") {
        throw new NotFoundError("Widget not found");
      }
      throw handlePrismaError(error);
    }

    return ResponseHandler.success(res, {
      message: "Widget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
