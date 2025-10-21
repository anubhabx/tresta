import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError
} from "../lib/errors.ts";
import {
  ResponseHandler,
  extractPaginationParams,
  calculateSkip
} from "../lib/response.ts";

const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { authorName, authorEmail, content, type, rating, videoUrl } = req.body;

    // Validate required fields
    if (!authorName || !content) {
      throw new BadRequestError("Author name and content are required");
    }

    // Validate authorName length
    if (authorName.length < 2 || authorName.length > 255) {
      throw new BadRequestError("Author name must be between 2 and 255 characters");
    }

    // Validate content length
    if (content.length < 10 || content.length > 2000) {
      throw new BadRequestError("Content must be between 10 and 2000 characters");
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }

    // Find project by slug
    const project = await prisma.project.findUnique({
      where: { slug }
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Check if project is active
    if (!project.isActive) {
      throw new BadRequestError("This project is not accepting testimonials");
    }

    // Prepare testimonial data
    const testimonialData: any = {
      projectId: project.id,
      authorName,
      content,
      type: type || "TEXT",
      isApproved: false,
      isPublished: false,
    };

    // Add optional fields if provided
    if (authorEmail) {
      testimonialData.authorEmail = authorEmail;
    }

    if (rating) {
      testimonialData.rating = rating;
    }

    if (videoUrl) {
      testimonialData.videoUrl = videoUrl;
      testimonialData.type = "VIDEO";
    }

    // Create testimonial
    const newTestimonial = await prisma.testimonial.create({
      data: testimonialData
    });

    return ResponseHandler.created(res, {
      message: "Testimonial submitted successfully",
      data: newTestimonial
    });
  } catch (error) {
    next(error);
  }
};

const listTestimonials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const project = await prisma.project.findFirst({
      where: { slug, userId }
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const { page, limit } = extractPaginationParams(req.query);

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where: { projectId: project.id },
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.testimonial.count({ where: { projectId: project.id } })
    ]);

    return ResponseHandler.paginated(res, {
      data: testimonials,
      page,
      limit,
      total,
      message: "Testimonials retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};

const getTestimonialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId }
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Get testimonial
    const testimonial = await prisma.testimonial.findFirst({
      where: { 
        id,
        projectId: project.id
      }
    });

    if (!testimonial) {
      throw new NotFoundError("Testimonial not found");
    }

    return ResponseHandler.success(res, {
      message: "Testimonial retrieved successfully",
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

const updateTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, id } = req.params;
    const { isPublished, isApproved } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId }
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Verify testimonial belongs to the project
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: { 
        id,
        projectId: project.id
      }
    });

    if (!existingTestimonial) {
      throw new NotFoundError("Testimonial not found");
    }

    // Build update data
    const updateData: any = {};
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isApproved !== undefined) updateData.isApproved = isApproved;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError("No valid fields to update");
    }

    // Update testimonial
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData
    });

    return ResponseHandler.updated(res, {
      message: "Testimonial updated successfully",
      data: updatedTestimonial
    });
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId }
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Verify testimonial belongs to the project
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: { 
        id,
        projectId: project.id
      }
    });

    if (!existingTestimonial) {
      throw new NotFoundError("Testimonial not found");
    }

    // Delete testimonial
    await prisma.testimonial.delete({
      where: { id }
    });

    return ResponseHandler.deleted(res, "Testimonial deleted successfully");
  } catch (error) {
    next(error);
  }
};

export {
  createTestimonial,
  listTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
};
