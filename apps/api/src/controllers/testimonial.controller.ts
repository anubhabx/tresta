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
import { verifyGoogleIdToken } from "../lib/google-oauth.ts";
import { moderateTestimonial, checkDuplicateContent } from "../services/moderation.service.ts";

const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { 
      authorName, 
      authorEmail, 
      authorRole,
      authorCompany,
      authorAvatar,
      content, 
      type, 
      rating, 
      videoUrl,
      googleIdToken // Google OAuth ID token
    } = req.body;

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

    // Validate optional fields length
    if (authorRole && authorRole.length > 255) {
      throw new BadRequestError("Author role must be less than 255 characters");
    }

    if (authorCompany && authorCompany.length > 255) {
      throw new BadRequestError("Author company must be less than 255 characters");
    }

    // Verify Google OAuth token if provided
    let googleProfile = null;
    let isOAuthVerified = false;
    let oauthSubject = null;

    if (googleIdToken) {
      googleProfile = await verifyGoogleIdToken(googleIdToken);
      
      if (!googleProfile) {
        throw new BadRequestError("Invalid Google authentication token");
      }

      // Email verification check
      if (!googleProfile.email_verified) {
        throw new BadRequestError("Google email must be verified");
      }

      isOAuthVerified = true;
      oauthSubject = googleProfile.sub;
      
      console.log("✅ Google OAuth verified:", {
        email: googleProfile.email,
        name: googleProfile.name,
        verified: googleProfile.email_verified
      });
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

    // Check for duplicate content
    const existingTestimonials = await prisma.testimonial.findMany({
      where: { projectId: project.id },
      select: { content: true }
    });

    const duplicateCheck = checkDuplicateContent(
      content,
      existingTestimonials.map(t => t.content)
    );

    if (duplicateCheck.isDuplicate) {
      throw new ConflictError(
        `Duplicate testimonial detected (${Math.round((duplicateCheck.similarity || 0) * 100)}% similar)`
      );
    }

    // Run auto-moderation
    const moderationConfig = {
      autoModeration: project.autoModeration ?? true,
      autoApproveVerified: project.autoApproveVerified ?? false,
      profanityFilterLevel: (project.profanityFilterLevel as 'STRICT' | 'MODERATE' | 'LENIENT') || 'MODERATE',
      moderationSettings: project.moderationSettings as any
    };

    const moderationResult = await moderateTestimonial(
      content,
      authorEmail,
      rating,
      isOAuthVerified,
      moderationConfig
    );

    // Prepare testimonial data
    const testimonialData: any = {
      projectId: project.id,
      authorName,
      content,
      type: type || "TEXT",
      isApproved: moderationResult.status === 'APPROVED',
      isPublished: moderationResult.autoPublish,
      source: "web_form", // Track source as web form submission
      ipAddress: req.ip, // Capture IP address for analytics
      userAgent: req.get("user-agent"), // Capture user agent
      isOAuthVerified, // Mark as OAuth verified
      oauthProvider: isOAuthVerified ? "google" : null,
      oauthSubject: oauthSubject,
      // Auto-moderation fields
      moderationStatus: moderationResult.status,
      moderationScore: moderationResult.score,
      moderationFlags: moderationResult.flags.length > 0 ? moderationResult.flags : null,
      autoPublished: moderationResult.autoPublish,
    };

    // Add optional fields if provided
    if (authorEmail) {
      testimonialData.authorEmail = authorEmail;
    }

    if (authorRole) {
      testimonialData.authorRole = authorRole;
    }

    if (authorCompany) {
      testimonialData.authorCompany = authorCompany;
    }

    if (authorAvatar) {
      testimonialData.authorAvatar = authorAvatar;
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

/**
 * Get moderation queue with filters
 */
const getModerationQueue = async (
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId }
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    const { page, limit } = extractPaginationParams(req.query);
    const { status, verified } = req.query;

    // Build where clause
    const where: any = { projectId: project.id };

    // Filter by moderation status
    if (status) {
      if (status === 'pending') {
        where.moderationStatus = 'PENDING';
      } else if (status === 'flagged') {
        where.moderationStatus = 'FLAGGED';
      } else if (status === 'approved') {
        where.moderationStatus = 'APPROVED';
      } else if (status === 'rejected') {
        where.moderationStatus = 'REJECTED';
      }
    }

    // Filter by verification status
    if (verified === 'true') {
      where.isOAuthVerified = true;
    } else if (verified === 'false') {
      where.isOAuthVerified = false;
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: [
          { moderationScore: 'desc' }, // Show high-risk items first
          { createdAt: 'desc' }
        ]
      }),
      prisma.testimonial.count({ where })
    ]);

    // Get moderation stats
    const stats = await prisma.testimonial.groupBy({
      by: ['moderationStatus'],
      where: { projectId: project.id },
      _count: true
    });

    const moderationStats = {
      total: stats.reduce((sum, s) => sum + s._count, 0),
      pending: stats.find(s => s.moderationStatus === 'PENDING')?._count || 0,
      flagged: stats.find(s => s.moderationStatus === 'FLAGGED')?._count || 0,
      approved: stats.find(s => s.moderationStatus === 'APPROVED')?._count || 0,
      rejected: stats.find(s => s.moderationStatus === 'REJECTED')?._count || 0,
    };

    const response = ResponseHandler.paginated(res, {
      data: testimonials,
      page,
      limit,
      total,
      message: "Moderation queue retrieved successfully"
    });

    // Add stats to meta
    if (response && typeof response === 'object') {
      (response as any).meta = {
        ...(response as any).meta,
        stats: moderationStats
      };
    }

    return response;
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk approve/reject testimonials
 */
const bulkModerationAction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { testimonialIds, action } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!testimonialIds || !Array.isArray(testimonialIds) || testimonialIds.length === 0) {
      throw new BadRequestError("testimonialIds array is required");
    }

    if (!action || !['approve', 'reject', 'flag'].includes(action)) {
      throw new BadRequestError("Invalid action. Must be 'approve', 'reject', or 'flag'");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId }
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Build update data based on action
    let updateData: any = {};
    if (action === 'approve') {
      updateData = {
        moderationStatus: 'APPROVED',
        isApproved: true,
        isPublished: true
      };
    } else if (action === 'reject') {
      updateData = {
        moderationStatus: 'REJECTED',
        isApproved: false,
        isPublished: false
      };
    } else if (action === 'flag') {
      updateData = {
        moderationStatus: 'FLAGGED'
      };
    }

    // Update testimonials
    const result = await prisma.testimonial.updateMany({
      where: {
        id: { in: testimonialIds },
        projectId: project.id
      },
      data: updateData
    });

    return ResponseHandler.success(res, {
      message: `${result.count} testimonial(s) ${action}d successfully`,
      data: { count: result.count, action }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update moderation status for a single testimonial
 */
const updateModerationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, id } = req.params;
    const { status, isApproved, isPublished } = req.body;
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
    if (status !== undefined) updateData.moderationStatus = status;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Update testimonial
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData
    });

    return ResponseHandler.updated(res, {
      message: "Moderation status updated successfully",
      data: updatedTestimonial
    });
  } catch (error) {
    next(error);
  }
};

export {
  createTestimonial,
  listTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getModerationQueue,
  bulkModerationAction,
  updateModerationStatus
};
