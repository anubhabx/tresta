import { prisma } from "@workspace/database/prisma.ts";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ApiError,
  ForbiddenError,
  InternalServerError,
  handlePrismaError
} from "../lib/errors.ts";
import { ResponseHandler } from "../lib/response.ts";
import type {
  WidgetConfig,
  WidgetData,
  CreateWidgetPayload,
  UpdateWidgetPayload
} from "@/types/api-responses.ts";

const createWidget = async (
  req: Request,
  res: Response,
  next: NextFunction
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
        "Widget configuration does not match the required structure"
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Create the widget
    const widget = await prisma.widget.create({
      data: {
        projectId,
        embedType,
        config
      }
    });

    ResponseHandler.success(res, {
      message: "Widget created successfully",
      data: widget
    });
  } catch (error) {
    next(error);
  }
};

const listWidgets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find project by slug
    const project = await prisma.project.findUnique({
      where: { slug }
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Fetch widgets for the project
    const widgets = await prisma.widget.findMany({
      where: { projectId: project.id }
    });

    ResponseHandler.success(res, {
      message: "Widgets fetched successfully",
      data: widgets
    });
  } catch (error) {
    next(error);
  }
};

const updateWidget = async (
  req: Request,
  res: Response,
  next: NextFunction
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
      where: { id: widgetId }
    });

    if (!existingWidget) {
      throw new NotFoundError("Widget not found");
    }

    // Update the widget
    const updatedWidget = await prisma.widget.update({
      where: { id: widgetId },
      data: {
        embedType: embedType ?? existingWidget.embedType,
        config: config ?? existingWidget.config
      }
    });

    ResponseHandler.success(res, {
      message: "Widget updated successfully",
      data: updatedWidget
    });
  } catch (error) {
    next(error);
  }
};

const deleteWidget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { widgetId } = req.params;

    // Validate widget ID
    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    // Find the existing widget
    const existingWidget = await prisma.widget.findUnique({
      where: { id: widgetId }
    });

    if (!existingWidget) {
      throw new NotFoundError("Widget not found");
    }

    // Delete the widget
    await prisma.widget.delete({
      where: { id: widgetId }
    });

    ResponseHandler.success(res, {
      message: "Widget deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const fetchPublicWidgetData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
};

export { createWidget, updateWidget };
