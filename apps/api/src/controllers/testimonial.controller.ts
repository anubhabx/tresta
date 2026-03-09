import { prisma, NotificationType } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import type {
  ModerationTestimonialDTO,
  OwnerTestimonialDTO,
  PublicTestimonialDTO,
  TestimonialProjectSummaryDTO,
} from "@workspace/types";
import { NotificationService } from "../services/notification.service.js";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  handlePrismaError,
} from "../lib/errors.js";
import {
  ResponseHandler,
  extractPaginationParams,
  calculateSkip,
} from "../lib/response.js";
import { verifyGoogleIdToken } from "../lib/google-oauth.js";
import { z } from "zod";
import {
  blobStorageService,
  StorageDirectory,
} from "../services/blob-storage.service.js";
import {
  moderateTestimonial,
  checkDuplicateContent,
  analyzeReviewerBehavior,
} from "../services/moderation.service.js";
import { hashIp, encrypt } from "../utils/encryption.js";
import { requireUserId } from "../lib/auth.js";
import { logger } from "../lib/logger.js";

const FALLBACK_TESTIMONIAL_LIMIT = 10;
const testimonialControllerLogger = logger.child({ module: 'testimonial-controller' });

type SubmissionFormConfig = {
  enableRating?: boolean;
  enableJobTitle?: boolean;
  enableCompany?: boolean;
  enableAvatar?: boolean;
  enableVideoUrl?: boolean;
  enableGoogleVerification?: boolean;
  requireRating?: boolean;
  requireJobTitle?: boolean;
  requireCompany?: boolean;
  requireAvatar?: boolean;
  requireVideoUrl?: boolean;
  requireGoogleVerification?: boolean;
  allowAnonymousSubmissions?: boolean;
  allowFingerprintOptOut?: boolean;
  notifyOnSubmission?: boolean;
};

type ProjectSummary = TestimonialProjectSummaryDTO;

type TestimonialWithDates = {
  id: string;
  userId: string | null;
  projectId: string | null;
  authorName: string;
  authorEmail: string | null;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatar: string | null;
  content: string;
  type: "TEXT" | "VIDEO" | "AUDIO";
  videoUrl: string | null;
  mediaUrl: string | null;
  source: string | null;
  sourceUrl: string | null;
  oembedData: unknown;
  isPublished: boolean;
  rating: number | null;
  isApproved: boolean;
  isOAuthVerified: boolean;
  oauthProvider: string | null;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
  moderationScore: number | null;
  moderationFlags: unknown;
  autoPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const serializeProjectSummary = (project: ProjectSummary): ProjectSummary => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
});

const normalizeModerationFlags = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter((entry): entry is string => typeof entry === "string");
};

const serializeOwnerTestimonial = (
  testimonial: TestimonialWithDates,
  project: ProjectSummary,
): OwnerTestimonialDTO => {
  const needsReview =
    testimonial.moderationStatus === "PENDING" ||
    testimonial.moderationStatus === "FLAGGED";

  return {
    id: testimonial.id,
    userId: testimonial.userId,
    projectId: testimonial.projectId,
    authorName: testimonial.authorName,
    authorEmail: testimonial.authorEmail,
    authorRole: testimonial.authorRole,
    authorCompany: testimonial.authorCompany,
    authorAvatar: testimonial.authorAvatar,
    content: testimonial.content,
    type: testimonial.type,
    videoUrl: testimonial.videoUrl,
    mediaUrl: testimonial.mediaUrl,
    source: testimonial.source,
    sourceUrl: testimonial.sourceUrl,
    oembedData: testimonial.oembedData,
    isPublished: testimonial.isPublished,
    rating: testimonial.rating,
    isApproved: testimonial.isApproved,
    isOAuthVerified: testimonial.isOAuthVerified,
    oauthProvider: testimonial.oauthProvider,
    moderationStatus: testimonial.moderationStatus,
    moderationScore: testimonial.moderationScore,
    moderationFlags: normalizeModerationFlags(testimonial.moderationFlags),
    autoPublished: testimonial.autoPublished,
    createdAt: testimonial.createdAt.toISOString(),
    updatedAt: testimonial.updatedAt.toISOString(),
    project: serializeProjectSummary(project),
    moderationContext: {
      needsReview,
      canAutoPublish:
        testimonial.moderationStatus === "APPROVED" &&
        testimonial.isApproved &&
        !testimonial.isPublished,
    },
  };
};


const serializeModerationTestimonial = (
  testimonial: TestimonialWithDates,
  project: ProjectSummary,
): ModerationTestimonialDTO => {
  const ownerDto = serializeOwnerTestimonial(testimonial, project);
  const score = testimonial.moderationScore ?? 0;

  return {
    ...ownerDto,
    reviewPriority: score >= 0.75 ? "high" : score >= 0.4 ? "medium" : "low",
  };
};

type PublicTestimonialWithDates = {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string | null;
  authorCompany: string | null;
  content: string;
  rating: number | null;
  type: "TEXT" | "VIDEO" | "AUDIO";
  videoUrl: string | null;
  mediaUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isOAuthVerified: boolean;
  oauthProvider: string | null;
};

const serializePublicTestimonial = (
  testimonial: PublicTestimonialWithDates,
): PublicTestimonialDTO => ({
  id: testimonial.id,
  authorName: testimonial.authorName,
  authorAvatar: testimonial.authorAvatar,
  authorRole: testimonial.authorRole,
  authorCompany: testimonial.authorCompany,
  content: testimonial.content,
  rating: testimonial.rating,
  type: testimonial.type,
  videoUrl: testimonial.videoUrl,
  mediaUrl: testimonial.mediaUrl,
  createdAt: testimonial.createdAt.toISOString(),
  updatedAt: testimonial.updatedAt.toISOString(),
  isOAuthVerified: testimonial.isOAuthVerified,
  oauthProvider: testimonial.oauthProvider,
});
const normalizeFormConfig = (formConfig: unknown): SubmissionFormConfig => {
  if (
    !formConfig ||
    typeof formConfig !== "object" ||
    Array.isArray(formConfig)
  ) {
    return {};
  }

  return formConfig as SubmissionFormConfig;
};

const enforceTestimonialLimit = async (userId: string): Promise<void> => {
  const { PLAN_LIMITS } = await import("../config/constants.js");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.FREE;
  const limit = limits.testimonials ?? FALLBACK_TESTIMONIAL_LIMIT;

  // -1 means unlimited
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
        resource: "testimonials",
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
    const isAnonymousSubmission =
      req.headers["x-anonymous-submission"] === "true";

    // Validate required fields
    if (!authorName || typeof authorName !== "string") {
      throw new ValidationError(
        "Author name is required and must be a string",
        {
          field: "authorName",
          received: typeof authorName,
        },
      );
    }

    if (!content || typeof content !== "string") {
      throw new ValidationError("Content is required and must be a string", {
        field: "content",
        received: typeof content,
      });
    }

    // Email is now required for data access rights
    if (!authorEmail || typeof authorEmail !== "string") {
      throw new ValidationError(
        "Email is required for data privacy rights management",
        {
          field: "authorEmail",
          received: typeof authorEmail,
        },
      );
    }

    // Validate authorName length
    if (authorName.length < 2 || authorName.length > 255) {
      throw new ValidationError(
        "Author name must be between 2 and 255 characters",
        {
          field: "authorName",
          minLength: 2,
          maxLength: 255,
          received: authorName.length,
        },
      );
    }

    // Validate content length
    if (content.length < 10 || content.length > 2000) {
      throw new ValidationError(
        "Content must be between 10 and 2000 characters",
        {
          field: "content",
          minLength: 10,
          maxLength: 2000,
          received: content.length,
        },
      );
    }

    // Validate optional field types
    if (
      authorRole !== undefined &&
      authorRole !== null &&
      typeof authorRole !== "string"
    ) {
      throw new ValidationError("Author role must be a string", {
        field: "authorRole",
        received: typeof authorRole,
      });
    }

    if (
      authorCompany !== undefined &&
      authorCompany !== null &&
      typeof authorCompany !== "string"
    ) {
      throw new ValidationError("Author company must be a string", {
        field: "authorCompany",
        received: typeof authorCompany,
      });
    }

    if (
      authorAvatar !== undefined &&
      authorAvatar !== null &&
      typeof authorAvatar !== "string"
    ) {
      throw new ValidationError("Author avatar must be a string", {
        field: "authorAvatar",
        received: typeof authorAvatar,
      });
    }

    if (
      videoUrl !== undefined &&
      videoUrl !== null &&
      typeof videoUrl !== "string"
    ) {
      throw new ValidationError("Video URL must be a string", {
        field: "videoUrl",
        received: typeof videoUrl,
      });
    }

    const normalizedRating =
      rating !== undefined && rating !== null && rating !== ""
        ? Number(rating)
        : undefined;

    if (
      normalizedRating !== undefined &&
      (Number.isNaN(normalizedRating) ||
        normalizedRating < 1 ||
        normalizedRating > 5)
    ) {
      throw new ValidationError("Rating must be a number between 1 and 5", {
        field: "rating",
        min: 1,
        max: 5,
        received: rating,
      });
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

    // Google OAuth verification state (evaluated after project config)
    let googleProfile: {
      email?: string;
      name?: string;
      email_verified?: boolean;
      sub?: string;
    } | null = null;
    let isOAuthVerified = false;
    let oauthSubject: string | null = null;

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
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
        suggestion: "Please check the project slug",
      });
    }

    // Check if project is active
    if (!project.isActive) {
      throw new BadRequestError(
        "This project is not currently accepting testimonials",
        {
          projectId: project.id,
          projectName: project.name,
          suggestion: "Please contact the project owner",
        },
      );
    }

    // Enforce owner plan testimonial quota for both authenticated and public submissions
    await enforceTestimonialLimit(project.userId);

    const formConfig = normalizeFormConfig(project.formConfig);
    const isRatingEnabled = formConfig.enableRating !== false;
    const isJobTitleEnabled = formConfig.enableJobTitle !== false;
    const isCompanyEnabled = formConfig.enableCompany !== false;
    const isAvatarEnabled = formConfig.enableAvatar !== false;
    const isVideoEnabled = formConfig.enableVideoUrl !== false;
    const isGoogleVerificationEnabled =
      formConfig.enableGoogleVerification !== false;

    const requireRating = isRatingEnabled && formConfig.requireRating === true;
    const requireJobTitle =
      isJobTitleEnabled && formConfig.requireJobTitle === true;
    const requireCompany =
      isCompanyEnabled && formConfig.requireCompany === true;
    const requireAvatar = isAvatarEnabled && formConfig.requireAvatar === true;
    const requireVideoUrl =
      isVideoEnabled && formConfig.requireVideoUrl === true;
    const requireGoogleVerification =
      isGoogleVerificationEnabled &&
      formConfig.requireGoogleVerification === true;
    const allowAnonymousSubmissions =
      formConfig.allowAnonymousSubmissions !== false;
    const allowFingerprintOptOut = formConfig.allowFingerprintOptOut === true;
    const notifyOnSubmission = formConfig.notifyOnSubmission !== false;

    const hasRole =
      typeof authorRole === "string" && authorRole.trim().length > 0;
    const hasCompany =
      typeof authorCompany === "string" && authorCompany.trim().length > 0;
    const hasAvatar =
      typeof authorAvatar === "string" && authorAvatar.trim().length > 0;
    const hasVideoUrl =
      typeof videoUrl === "string" && videoUrl.trim().length > 0;
    const normalizedEmail = authorEmail.trim().toLowerCase();

    if (
      isAnonymousSubmission &&
      !allowAnonymousSubmissions &&
      !allowFingerprintOptOut
    ) {
      throw new ForbiddenError(
        "IP/device data opt-out is disabled for this project",
      );
    }

    if (!isRatingEnabled && normalizedRating !== undefined) {
      throw new BadRequestError("Rating is disabled for this collection form");
    }

    if (requireRating && normalizedRating === undefined) {
      throw new ValidationError("Rating is required for this collection form", {
        field: "rating",
      });
    }

    if (!isJobTitleEnabled && hasRole) {
      throw new BadRequestError(
        "Job title is disabled for this collection form",
      );
    }

    if (requireJobTitle && !hasRole) {
      throw new ValidationError(
        "Job title is required for this collection form",
        {
          field: "authorRole",
        },
      );
    }

    if (!isCompanyEnabled && hasCompany) {
      throw new BadRequestError("Company is disabled for this collection form");
    }

    if (requireCompany && !hasCompany) {
      throw new ValidationError(
        "Company is required for this collection form",
        {
          field: "authorCompany",
        },
      );
    }

    if (!isAvatarEnabled && hasAvatar) {
      throw new BadRequestError(
        "Avatar uploads are disabled for this collection form",
      );
    }

    if (requireAvatar && !hasAvatar) {
      throw new ValidationError(
        "Profile picture is required for this collection form",
        {
          field: "authorAvatar",
        },
      );
    }

    if (!isVideoEnabled && hasVideoUrl) {
      throw new BadRequestError(
        "Video testimonials are disabled for this collection form",
      );
    }

    if (requireVideoUrl && !hasVideoUrl) {
      throw new ValidationError(
        "Video URL is required for this collection form",
        {
          field: "videoUrl",
        },
      );
    }

    if (googleIdToken && !isGoogleVerificationEnabled) {
      throw new BadRequestError(
        "Google verification is disabled for this collection form",
      );
    }

    if (googleIdToken) {
      googleProfile = await verifyGoogleIdToken(googleIdToken);

      if (!googleProfile) {
        throw new BadRequestError("Invalid Google authentication token");
      }

      if (!googleProfile.email_verified) {
        throw new BadRequestError("Google email must be verified");
      }

      if (
        googleProfile.email &&
        googleProfile.email.toLowerCase() !== normalizedEmail
      ) {
        throw new BadRequestError(
          "Email must match the verified Google account email",
        );
      }

      isOAuthVerified = true;
      oauthSubject = googleProfile.sub ?? null;
    }

    if (requireGoogleVerification && !isOAuthVerified) {
      throw new ValidationError(
        "Google verification is required for this collection form",
        {
          field: "googleIdToken",
        },
      );
    }

    // Prevent duplicate testimonials from the same reviewer (account/IP/device)
    const reviewerIdentityFilters = [] as any[];

    if (normalizedEmail) {
      reviewerIdentityFilters.push({
        authorEmail: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      });
    }

    if (oauthSubject) {
      reviewerIdentityFilters.push({ oauthSubject });
    }

    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.get("user-agent") || undefined;

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
          "Each user can only submit one testimonial per project",
          {
            projectId: project.id,
            existingTestimonialId: existingReviewer.id,
            createdAt: existingReviewer.createdAt,
          },
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
      email: normalizedEmail,
    });

    const moderationResult = await moderateTestimonial(
      content,
      normalizedEmail,
      normalizedRating,
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
    if (isAnonymousSubmission) {
      // User declined consent for technical data
      testimonialData.ipAddress = null;
      testimonialData.userAgent = null;
    } else {
      // User consented - Store processed data
      // Hash IP for privacy (matches schema varchar constraint)
      testimonialData.ipAddress = hashIp(
        req.ip || req.socket.remoteAddress || "",
      );
      // Encrypt User Agent
      testimonialData.userAgent = encrypt(req.get("user-agent") || "");
    }

    // Add optional fields if provided
    testimonialData.authorEmail = normalizedEmail;

    if (hasRole) {
      testimonialData.authorRole = authorRole.trim();
    }

    if (hasCompany) {
      testimonialData.authorCompany = authorCompany.trim();
    }

    if (hasAvatar) {
      testimonialData.authorAvatar = authorAvatar.trim();
    }

    if (normalizedRating !== undefined) {
      testimonialData.rating = normalizedRating;
    }

    if (hasVideoUrl) {
      testimonialData.videoUrl = videoUrl.trim();
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

    // Send notification to project owner if enabled
    if (notifyOnSubmission) {
      try {
        const notificationType =
          moderationResult.status === "FLAGGED"
            ? NotificationType.TESTIMONIAL_FLAGGED
            : NotificationType.NEW_TESTIMONIAL;

        const title =
          moderationResult.status === "FLAGGED"
            ? "Testimonial Flagged for Review"
            : "New Testimonial Received";

        const message =
          moderationResult.status === "FLAGGED"
            ? `A new testimonial from ${authorName} was flagged by auto-moderation.`
            : `You received a new testimonial from ${authorName}.`;

        await NotificationService.create({
          userId: project.userId,
          type: notificationType,
          title,
          message,
          link: `/dashboard/projects/${project.slug}?tab=testimonials`,
          requestId: req.requestId,
          metadata: {
            testimonialId: newTestimonial.id,
            projectId: project.id,
            projectSlug: project.slug,
            authorName,
            authorEmail: normalizedEmail,
            moderationStatus: moderationResult.status,
          },
        });
      } catch (error) {
        // Non-blocking error - don't fail the request if notification fails
        testimonialControllerLogger.error(
          { projectId: project.id, testimonialId: newTestimonial.id, error },
          'Failed to create notification for testimonial submission',
        );
      }
    }

    return ResponseHandler.created(res, {
      message:
        moderationResult.status === "APPROVED"
          ? "Testimonial submitted and approved successfully"
          : "Testimonial submitted successfully and is pending review",
      data: {
        ...newTestimonial,
        moderationInfo: {
          status: moderationResult.status,
          autoPublished: moderationResult.autoPublish,
          message:
            moderationResult.status === "APPROVED"
              ? "Your testimonial has been automatically approved and published"
              : moderationResult.status === "FLAGGED"
                ? "Your testimonial is under review"
                : "Your testimonial is pending approval",
        },
      },
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
    const userId = requireUserId(req);

    const project = await prisma.project.findFirst({
      where: { slug, userId },
      select: {
        id: true,
        slug: true,
        name: true,
      },
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
      data: testimonials.map((testimonial) =>
        serializeOwnerTestimonial(testimonial as TestimonialWithDates, project),
      ),
      page,
      limit,
      total,
      message: "Testimonials retrieved successfully",
      meta: {
        filters: {
          projectSlug: slug,
        },
        sort: {
          field: "createdAt",
          direction: "desc",
        },
      },
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

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
      });
    }

    if (!req.apiKey) {
      throw new UnauthorizedError("API key validation required");
    }

    const project = await prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        brandColorPrimary: true,
        brandColorSecondary: true,
        isActive: true,
      },
    });

    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`);
    }

    if (!project.isActive) {
      throw new ForbiddenError("This project is not active");
    }

    if (req.apiKey.projectId !== project.id) {
      throw new ForbiddenError("API key does not have access to this project");
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
        mediaUrl: true,
        createdAt: true,
        updatedAt: true,
        isOAuthVerified: true,
        oauthProvider: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ResponseHandler.success(res, {
      message: "Public testimonials retrieved successfully",
      data: {
        project: {
          id: project.id,
          slug: project.slug,
          name: project.name,
          logoUrl: project.logoUrl,
          brandColorPrimary: project.brandColorPrimary,
          brandColorSecondary: project.brandColorSecondary,
        },
        testimonials: testimonials.map((testimonial) =>
          serializePublicTestimonial(testimonial as PublicTestimonialWithDates),
        ),
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
    const userId = requireUserId(req);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
      select: {
        id: true,
        slug: true,
        name: true,
      },
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
      data: serializeOwnerTestimonial(
        testimonial as TestimonialWithDates,
        project,
      ),
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
    const userId = requireUserId(req);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { slug, userId },
      select: {
        id: true,
        slug: true,
        name: true,
      },
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
    const userId = requireUserId(req);

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
    const userId = requireUserId(req);

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

    const highRiskCount = testimonials.filter(
      (testimonial) => (testimonial.moderationScore ?? 0) >= 0.75,
    ).length;
    const mediumRiskCount = testimonials.filter(
      (testimonial) =>
        (testimonial.moderationScore ?? 0) >= 0.4 &&
        (testimonial.moderationScore ?? 0) < 0.75,
    ).length;
    const lowRiskCount = testimonials.length - highRiskCount - mediumRiskCount;

    return ResponseHandler.paginated(res, {
      data: testimonials.map((testimonial) =>
        serializeModerationTestimonial(
          testimonial as TestimonialWithDates,
          project,
        ),
      ),
      page,
      limit,
      total,
      message: "Moderation queue retrieved successfully",
      meta: {
        stats: moderationStats,
        filters: {
          status: typeof status === "string" ? status : undefined,
          verified: verified === "true" ? true : verified === "false" ? false : undefined,
          projectSlug: slug,
        },
        sort: {
          primary: "moderationScore:desc",
          secondary: "createdAt:desc",
        },
        reviewPriority: {
          high: highRiskCount,
          medium: mediumRiskCount,
          low: lowRiskCount,
        },
      },
    });
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
    const userId = requireUserId(req);

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
    const userId = requireUserId(req);

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

const generatePublicUploadUrlSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
  directory: z.enum(
    [
      StorageDirectory.TESTIMONIALS,
      StorageDirectory.AVATARS,
      StorageDirectory.VIDEOS,
    ] as const,
    {
      errorMap: () => ({
        message: `Directory must be one of: testimonials, avatars, videos`,
      }),
    },
  ),
  fileSize: z.number().positive().optional(),
});

/**
 * Generate a pre-signed upload URL for direct client-side public uploads
 * POST /api/public/projects/:slug/media/upload-url
 */
const generatePublicUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== "string") {
      throw new ValidationError("Project slug is required", {
        field: "slug",
        received: typeof slug,
      });
    }

    const validationResult = generatePublicUploadUrlSchema.safeParse(req.body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      throw new ValidationError(firstError?.message || "Invalid request data", {
        field: firstError?.path.join("."),
        issues: validationResult.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }

    const { filename, contentType, directory, fileSize } =
      validationResult.data;

    // Verify project exists and is active
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, userId: true, isActive: true },
    });

    if (!project) {
      throw new NotFoundError(`Project with slug "${slug}" not found`);
    }

    if (!project.isActive) {
      throw new ForbiddenError(
        "This project is not currently accepting submissions.",
      );
    }

    // Generate upload URL with SAS token using project owner's userId
    const uploadData = await blobStorageService.generateUploadUrl({
      directory,
      filename,
      contentType,
      fileSize,
      expiresInMinutes: 10,
      userId: project.userId, // Isolate blobs by the project owner
    });

    return ResponseHandler.success(res, {
      data: uploadData,
      message: "Upload URL generated successfully",
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
  generatePublicUploadUrl,
};
