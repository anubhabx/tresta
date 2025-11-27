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
import { verifyGoogleIdToken } from '../lib/google-oauth.js';
import {
  moderateTestimonial,
  checkDuplicateContent,
  analyzeReviewerBehavior,
} from '../services/moderation.service.js';

const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
      googleIdToken, // Google OAuth ID token
    } = req.body;

    // Validate required fields
    if (!authorName || typeof authorName !== 'string') {
      throw new ValidationError("Author name is required and must be a string", {
        field: 'authorName',
        received: typeof authorName
      });
    }

    if (!content || typeof content !== 'string') {
      throw new ValidationError("Content is required and must be a string", {
        field: 'content',
        received: typeof content
      });
    }

    // Validate authorName length
    if (authorName.length < 2 || authorName.length > 255) {
      throw new ValidationError(
        "Author name must be between 2 and 255 characters",
        {
          field: 'authorName',
          minLength: 2,
          maxLength: 255,
          received: authorName.length
        }
      );
    }

    // Validate content length
    if (content.length < 10 || content.length > 2000) {
      throw new ValidationError(
        "Content must be between 10 and 2000 characters",
        {
          field: 'content',
          minLength: 10,
          maxLength: 2000,
          received: content.length
        }
      );
    }

    // Validate rating if provided
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new ValidationError("Rating must be a number between 1 and 5", {
          field: 'rating',
          min: 1,
          max: 5,
          received: rating
        });
      }
    }

    // Validate optional fields length
    if (authorRole && authorRole.length > 255) {
      throw new BadRequestError("Author role must be less than 255 characters");
    }

    if (authorCompany && authorCompany.length > 255) {
      throw new BadRequestError(
        "Author company must be less than 255 characters",
      );
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
        verified: googleProfile.email_verified,
      });
    }

    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'slug',
        received: typeof slug
      });
    }

    // Find project by slug
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { slug },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`, {
        slug,
        suggestion: 'Please check the project slug'
      });
    }

    // Check if project is active
    if (!project.isActive) {
      throw new BadRequestError("This project is not currently accepting testimonials", {
        projectId: project.id,
        projectName: project.name,
        suggestion: 'Please contact the project owner'
      });
    }

    // Prevent duplicate testimonials from the same reviewer (account/IP/device)
    const normalizedEmail = authorEmail?.trim().toLowerCase();
    const reviewerIdentityFilters = [] as any[];

    if (normalizedEmail) {
      reviewerIdentityFilters.push({
        authorEmail: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      });
    }

    if (oauthSubject) {
      reviewerIdentityFilters.push({ oauthSubject });
    }

    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || undefined;

    if (clientIp) {
      const ipFilter: Record<string, string> = { ipAddress: clientIp };
      if (userAgent) {
        ipFilter.userAgent = userAgent;
      }
      reviewerIdentityFilters.push(ipFilter);
    }

    if (reviewerIdentityFilters.length > 0) {
      const existingReviewer = await prisma.testimonial.findFirst({
        where: {
          projectId: project.id,
          OR: reviewerIdentityFilters,
        },
        select: { id: true, authorEmail: true, createdAt: true },
      });

      if (existingReviewer) {
        throw new ConflictError(
          'Each user can only submit one testimonial per project',
          {
            projectId: project.id,
            existingTestimonialId: existingReviewer.id,
            createdAt: existingReviewer.createdAt,
          }
        );
      }
    }

    // Check for duplicate content
    const existingTestimonials = await prisma.testimonial.findMany({
      where: { projectId: project.id },
      select: { content: true },
    });

    const duplicateCheck = checkDuplicateContent(
      content,
      existingTestimonials.map((t) => t.content),
    );

    if (duplicateCheck.isDuplicate) {
      throw new ConflictError(
        `Duplicate testimonial detected (${Math.round((duplicateCheck.similarity || 0) * 100)}% similar)`,
      );
    }

    // Run auto-moderation
    const moderationConfig = {
      autoModeration: project.autoModeration ?? true,
      autoApproveVerified: project.autoApproveVerified ?? false,
      profanityFilterLevel:
        (project.profanityFilterLevel as "STRICT" | "MODERATE" | "LENIENT") ||
        "MODERATE",
      moderationSettings: project.moderationSettings as any,
    };

    const reviewerBehavior = await analyzeReviewerBehavior(project.id, {
      ipAddress: req.ip,
      email: authorEmail,
    });

    const moderationResult = await moderateTestimonial(
      content,
      authorEmail,
      rating,
      isOAuthVerified,
      moderationConfig,
      reviewerBehavior,
    );

    // Prepare testimonial data
    const testimonialData: any = {
      projectId: project.id,
      authorName,
      content,
      type: type || "TEXT",
      isApproved: moderationResult.status === "APPROVED",
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
      moderationFlags:
        moderationResult.flags.length > 0 ? moderationResult.flags : null,
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
    let newTestimonial;
    try {
      newTestimonial = await prisma.testimonial.create({
        data: testimonialData,
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    return ResponseHandler.created(res, {
      message: moderationResult.status === 'APPROVED' 
        ? "Testimonial submitted and approved successfully" 
        : "Testimonial submitted successfully and is pending review",
      data: {
        ...newTestimonial,
        moderationInfo: {
          status: moderationResult.status,
          autoPublished: moderationResult.autoPublish,
          message: moderationResult.status === 'APPROVED' 
            ? 'Your testimonial has been automatically approved and published'
            : moderationResult.status === 'FLAGGED'
            ? 'Your testimonial is under review'
            : 'Your testimonial is pending approval'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const listTestimonials = async (
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

    const project = await prisma.project.findFirst({
      where: { slug, userId },
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.testimonial.count({ where: { projectId: project.id } }),
    ]);

    return ResponseHandler.paginated(res, {
      data: testimonials,
      page,
      limit,
      total,
      message: "Testimonials retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getTestimonialById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug, id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Get testimonial
    const testimonial = await prisma.testimonial.findFirst({
      where: {
        id,
        projectId: project.id,
      },
    });

    if (!testimonial) {
      throw new NotFoundError("Testimonial not found");
    }

    return ResponseHandler.success(res, {
      message: "Testimonial retrieved successfully",
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

const updateTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug, id } = req.params;
    const { isPublished, isApproved, moderationStatus } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Verify testimonial belongs to the project
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        id,
        projectId: project.id,
      },
    });

    if (!existingTestimonial) {
      throw new NotFoundError("Testimonial not found");
    }

    // Enforce workflow: Cannot publish unless approved
    if (isPublished === true && !existingTestimonial.isApproved) {
      throw new BadRequestError(
        "Cannot publish unapproved testimonial. Please approve it first in the moderation queue.",
      );
    }

    // Build update data
    const updateData: any = {};
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (moderationStatus !== undefined)
      updateData.moderationStatus = moderationStatus;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestError("No valid fields to update");
    }

    // Update testimonial
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return ResponseHandler.updated(res, {
      message: "Testimonial updated successfully",
      data: updatedTestimonial,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug, id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Verify testimonial belongs to the project
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        id,
        projectId: project.id,
      },
    });

    if (!existingTestimonial) {
      throw new NotFoundError("Testimonial not found");
    }

    // Delete testimonial
    await prisma.testimonial.delete({
      where: { id },
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
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
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
      if (status === "pending") {
        where.moderationStatus = "PENDING";
      } else if (status === "flagged") {
        where.moderationStatus = "FLAGGED";
      } else if (status === "approved") {
        where.moderationStatus = "APPROVED";
      } else if (status === "rejected") {
        where.moderationStatus = "REJECTED";
      }
    }

    // Filter by verification status
    if (verified === "true") {
      where.isOAuthVerified = true;
    } else if (verified === "false") {
      where.isOAuthVerified = false;
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: [
          { moderationScore: "desc" }, // Show high-risk items first
          { createdAt: "desc" },
        ],
      }),
      prisma.testimonial.count({ where }),
    ]);

    // Get moderation stats
    const stats = await prisma.testimonial.groupBy({
      by: ["moderationStatus"],
      where: { projectId: project.id },
      _count: true,
    });

    const moderationStats = {
      total: stats.reduce((sum, s) => sum + s._count, 0),
      pending: stats.find((s) => s.moderationStatus === "PENDING")?._count || 0,
      flagged: stats.find((s) => s.moderationStatus === "FLAGGED")?._count || 0,
      approved:
        stats.find((s) => s.moderationStatus === "APPROVED")?._count || 0,
      rejected:
        stats.find((s) => s.moderationStatus === "REJECTED")?._count || 0,
    };

    const response = ResponseHandler.paginated(res, {
      data: testimonials,
      page,
      limit,
      total,
      message: "Moderation queue retrieved successfully",
    });

    // Add stats to meta
    if (response && typeof response === "object") {
      (response as any).meta = {
        ...(response as any).meta,
        stats: moderationStats,
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
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const { testimonialIds, action } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (
      !testimonialIds ||
      !Array.isArray(testimonialIds) ||
      testimonialIds.length === 0
    ) {
      throw new BadRequestError("testimonialIds array is required");
    }

    if (!action || !["approve", "reject", "flag"].includes(action)) {
      throw new BadRequestError(
        "Invalid action. Must be 'approve', 'reject', or 'flag'",
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Build update data based on action
    let updateData: any = {};
    if (action === "approve") {
      updateData = {
        moderationStatus: "APPROVED",
        isApproved: true,
        isPublished: true,
      };
    } else if (action === "reject") {
      updateData = {
        moderationStatus: "REJECTED",
        isApproved: false,
        isPublished: false,
      };
    } else if (action === "flag") {
      updateData = {
        moderationStatus: "FLAGGED",
      };
    }

    // Update testimonials
    const result = await prisma.testimonial.updateMany({
      where: {
        id: { in: testimonialIds },
        projectId: project.id,
      },
      data: updateData,
    });

    return ResponseHandler.success(res, {
      message: `${result.count} testimonial(s) ${action}d successfully`,
      data: { count: result.count, action },
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
  next: NextFunction,
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
      where: { slug, userId },
    });

    if (!project) {
      throw new NotFoundError("Project not found or you don't have access");
    }

    // Verify testimonial belongs to the project
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        id,
        projectId: project.id,
      },
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
      data: updateData,
    });

    return ResponseHandler.updated(res, {
      message: "Moderation status updated successfully",
      data: updatedTestimonial,
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
  updateModerationStatus,
};
