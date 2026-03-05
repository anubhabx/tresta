import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@workspace/database/prisma';
import { ResponseHandler } from '../../lib/response.js';
import { BadRequestError, NotFoundError, handlePrismaError } from '../../lib/errors.js';
import { getRedisClient } from '../../lib/redis.js';

type TelemetryMode = 'off' | 'sampled' | 'opt-in';

type ProjectTelemetrySettings = {
  mode: TelemetryMode;
  samplingRate: number;
};

const DEFAULT_PROJECT_TELEMETRY_SETTINGS: ProjectTelemetrySettings = {
  mode: 'sampled',
  samplingRate: 1,
};

const getProjectTelemetrySettingsKey = (projectId: string): string =>
  `settings:project:${projectId}:telemetry`;

function normalizeTelemetrySettings(
  value: unknown,
): ProjectTelemetrySettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PROJECT_TELEMETRY_SETTINGS;
  }

  const maybeMode = (value as Record<string, unknown>).mode;
  const maybeRate = (value as Record<string, unknown>).samplingRate;

  const mode: TelemetryMode =
    maybeMode === 'off' || maybeMode === 'sampled' || maybeMode === 'opt-in'
      ? maybeMode
      : DEFAULT_PROJECT_TELEMETRY_SETTINGS.mode;

  const samplingRateRaw =
    typeof maybeRate === 'number'
      ? maybeRate
      : typeof maybeRate === 'string'
        ? Number(maybeRate)
        : DEFAULT_PROJECT_TELEMETRY_SETTINGS.samplingRate;

  const samplingRate = Number.isFinite(samplingRateRaw)
    ? Math.min(10, Math.max(0.1, samplingRateRaw))
    : DEFAULT_PROJECT_TELEMETRY_SETTINGS.samplingRate;

  return { mode, samplingRate };
}

async function getProjectTelemetrySettings(
  projectId: string,
): Promise<ProjectTelemetrySettings> {
  const redis = getRedisClient();
  const key = getProjectTelemetrySettingsKey(projectId);
  const raw = await redis.get(key);

  if (!raw) {
    return DEFAULT_PROJECT_TELEMETRY_SETTINGS;
  }

  try {
    return normalizeTelemetrySettings(JSON.parse(raw));
  } catch {
    return DEFAULT_PROJECT_TELEMETRY_SETTINGS;
  }
}

/**
 * GET /admin/projects
 * Get paginated list of projects with search and filters
 */
export const listProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      cursor,
      limit = '50',
      search,
      type,
      visibility,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;
    
    const pageSize = Math.min(parseInt(limit as string), 100);
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.name = { startsWith: search as string, mode: 'insensitive' };
    }
    
    if (type) {
      where.projectType = type;
    }
    
    if (visibility) {
      where.visibility = visibility;
    }
    
    // Build orderBy clause
    let orderBy: any = {};
    if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    } else {
      orderBy = { createdAt: 'desc' };
    }
    
    // Fetch projects with cursor pagination
    let projects;
    try {
      projects = await prisma.project.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor as string }, skip: 1 }),
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          testimonials: {
            select: {
              moderationStatus: true,
            },
          },
          _count: {
            select: {
              testimonials: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    const hasMore = projects.length > pageSize;
    const results = hasMore ? projects.slice(0, pageSize) : projects;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]?.id : null;
    
    return ResponseHandler.success(res, {
      data: {
        projects: results.map(project => {
          const statusCounts = project.testimonials.reduce((acc, t) => {
            acc[t.moderationStatus] = (acc[t.moderationStatus] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return {
            id: project.id,
            name: project.name,
            slug: project.slug,
            projectType: project.projectType,
            visibility: project.visibility,
            isActive: project.isActive,
            createdAt: project.createdAt.toISOString(),
            owner: {
              id: project.user.id,
              email: project.user.email,
              name: [project.user.firstName, project.user.lastName]
                .filter(Boolean)
                .join(' ') || 'N/A',
            },
            testimonialCounts: {
              total: project._count.testimonials,
              pending: statusCounts.PENDING || 0,
              approved: statusCounts.APPROVED || 0,
              rejected: statusCounts.REJECTED || 0,
              flagged: statusCounts.FLAGGED || 0,
            },
          };
        }),
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/projects/:id
 * Get detailed information about a specific project
 */
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    let project;
    try {
      project = await prisma.project.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              plan: true,
            },
          },
          testimonials: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              User: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              testimonials: true,
              widgets: true,
              apiKeys: true,
            },
          },
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    // Calculate testimonial counts by status
    let allTestimonials;
    try {
      allTestimonials = await prisma.testimonial.findMany({
        where: { projectId: id },
        select: { moderationStatus: true },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
    
    const statusCounts = allTestimonials.reduce((acc, t) => {
      acc[t.moderationStatus] = (acc[t.moderationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const telemetrySettings = await getProjectTelemetrySettings(project.id);

    return ResponseHandler.success(res, {
      data: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        shortDescription: project.shortDescription,
        logoUrl: project.logoUrl,
        projectType: project.projectType,
        websiteUrl: project.websiteUrl,
        visibility: project.visibility,
        isActive: project.isActive,
        autoModeration: project.autoModeration,
        autoApproveVerified: project.autoApproveVerified,
        profanityFilterLevel: project.profanityFilterLevel,
        brandColorPrimary: project.brandColorPrimary,
        brandColorSecondary: project.brandColorSecondary,
        socialLinks: project.socialLinks,
        tags: project.tags,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        owner: {
          id: project.user.id,
          email: project.user.email,
          name: [project.user.firstName, project.user.lastName]
            .filter(Boolean)
            .join(' ') || 'N/A',
          avatar: project.user.avatar,
          plan: project.user.plan,
        },
        stats: {
          testimonialCounts: {
            total: project._count.testimonials,
            pending: statusCounts.PENDING || 0,
            approved: statusCounts.APPROVED || 0,
            rejected: statusCounts.REJECTED || 0,
            flagged: statusCounts.FLAGGED || 0,
          },
          widgetCount: project._count.widgets,
          apiKeyCount: project._count.apiKeys,
        },
        telemetrySettings,
        recentTestimonials: project.testimonials.map(t => ({
          id: t.id,
          authorName: t.authorName,
          content: t.content.substring(0, 200),
          rating: t.rating,
          moderationStatus: t.moderationStatus,
          createdAt: t.createdAt,
          user: t.User ? {
            id: t.User.id,
            email: t.User.email,
            name: [t.User.firstName, t.User.lastName]
              .filter(Boolean)
              .join(' ') || 'N/A',
          } : null,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /admin/projects/:id/telemetry-settings
 * Update telemetry settings for a specific project
 */
export const updateProjectTelemetrySettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { mode, samplingRate } = req.body ?? {};

    if (!id) {
      throw new BadRequestError('Project ID is required');
    }

    if (mode !== 'off' && mode !== 'sampled' && mode !== 'opt-in') {
      throw new BadRequestError("mode must be one of: 'off', 'sampled', 'opt-in'");
    }

    const numericSamplingRate = Number(samplingRate);
    if (!Number.isFinite(numericSamplingRate) || numericSamplingRate < 0.1 || numericSamplingRate > 10) {
      throw new BadRequestError('samplingRate must be between 0.1 and 10');
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const normalized = normalizeTelemetrySettings({
      mode,
      samplingRate: numericSamplingRate,
    });

    const redis = getRedisClient();
    await redis.set(
      getProjectTelemetrySettingsKey(project.id),
      JSON.stringify(normalized),
    );

    return ResponseHandler.success(res, {
      message: 'Telemetry settings updated successfully',
      data: normalized,
    });
  } catch (error) {
    next(error);
  }
};
