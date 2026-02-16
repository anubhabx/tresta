import { prisma, NotificationType } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import { NotificationService } from '../services/notification.service.js';
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
import { hashIp, encrypt } from '../utils/encryption.js';

const FALLBACK_TESTIMONIAL_LIMIT = 10;

const resolvePlanLimit = (plan: { limits?: unknown } | null): number | null => {
  if (!plan || !plan.limits || typeof plan.limits !== 'object') {
    return null;
  }

  const rawLimit = (plan.limits as Record<string, unknown>).testimonials;

  if (typeof rawLimit === 'number' && Number.isFinite(rawLimit)) {
    return rawLimit;
  }

  if (typeof rawLimit === 'string') {
    const parsed = Number(rawLimit);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const enforceTestimonialLimit = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  let effectivePlan = user.subscription?.status === 'ACTIVE'
    ? user.subscription.plan
    : null;

  if (!effectivePlan) {
    effectivePlan = await prisma.plan.findFirst({
      where: { type: 'FREE', isActive: true },
    });
  }

  const resolvedLimit = resolvePlanLimit(effectivePlan);
  const limit = resolvedLimit ?? FALLBACK_TESTIMONIAL_LIMIT;

  if (limit === -1) {
    return;
  }

  const used = await prisma.testimonial.count({
    where: {
      Project: {
        userId,
      },
    },
  });

  if (used >= limit) {
    throw new ForbiddenError(
      `You have reached the limit for testimonials (${limit}) on your current plan.`,
      {
        resource: 'testimonials',
        limit,
        current: used,
      },
    );
  }
};

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

    // Email is now required for data access rights
    if (!authorEmail || typeof authorEmail !== 'string') {
      throw new ValidationError("Email is required for data privacy rights management", {
        field: 'authorEmail',
        received: typeof authorEmail
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
    let googleProfile: any = null;
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

    // Enforce owner plan testimonial quota for both authenticated and public submissions
    await enforceTestimonialLimit(project.userId);

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
      autoPublished: moderationResult.autoPublish,
    };

    // Handle Privacy & Consent
    const isAnonymousSubmission = req.headers['x-anonymous-submission'] === 'true';

    if (isAnonymousSubmission) {
      // User declined consent for technical data
      testimonialData.ipAddress = null;
      testimonialData.userAgent = null;
    } else {
      // User consented - Store processed data
      // Hash IP for privacy (matches schema varchar constraint)
      testimonialData.ipAddress = hashIp(req.ip || req.socket.remoteAddress || '');
      // Encrypt User Agent
      testimonialData.userAgent = encrypt(req.get("user-agent") || '');
    }

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

    // Send notification to project owner
    try {
      const notificationType = moderationResult.status === 'FLAGGED'
        ? NotificationType.TESTIMONIAL_FLAGGED
        : NotificationType.NEW_TESTIMONIAL;

      const title = moderationResult.status === 'FLAGGED'
        ? 'Testimonial Flagged for Review'
        : 'New Testimonial Received';

      const message = moderationResult.status === 'FLAGGED'
        ? `A new testimonial from ${authorName} was flagged by auto-moderation.`
        : `You received a new testimonial from ${authorName}.`;

      await NotificationService.create({
        userId: project.userId,
        type: notificationType,
        title,
        message,
        link: `/dashboard/projects/${project.slug}?tab=testimonials`,
        metadata: {
          testimonialId: newTestimonial.id,
          projectId: project.id,
          projectSlug: project.slug,
          authorName,
          authorEmail,
          moderationStatus: moderationResult.status,
        },
      });
    } catch (error) {
      // Non-blocking error - don't fail the request if notification fails
      console.error('Failed to create notification:', error);
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

const listPublicTestimonialsByApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      throw new ValidationError('Project slug is required', {
        field: 'slug',
        received: typeof slug,
      });
    }

    if (!req.apiKey) {
      throw new UnauthorizedError('API key validation required');
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        isActive: true,
      },
    });

    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`);
    }

    if (!project.isActive) {
      throw new ForbiddenError('This project is not active');
    }

    if (req.apiKey.projectId !== project.id) {
      throw new ForbiddenError('API key does not have access to this project');
    }

    const testimonials = await prisma.testimonial.findMany({
      where: {
        projectId: project.id,
        isApproved: true,
        isPublished: true,
      },
      select: {
        id: true,
        authorName: true,
        authorAvatar: true,
        authorRole: true,
        authorCompany: true,
        content: true,
        rating: true,
        type: true,
        videoUrl: true,
        createdAt: true,
        isOAuthVerified: true,
        oauthProvider: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ResponseHandler.success(res, {
      message: 'Public testimonials retrieved successfully',
      data: {
        project: {
          id: project.id,
          slug: project.slug,
          name: project.name,
        },
        testimonials: testimonials.map((testimonial) => ({
          ...testimonial,
          createdAt: testimonial.createdAt.toISOString(),
        })),
        total: testimonials.length,
      },
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
  listPublicTestimonialsByApiKey,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getModerationQueue,
  bulkModerationAction,
  updateModerationStatus,
};
