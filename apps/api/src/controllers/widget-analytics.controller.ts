import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';

/**
 * Track widget load event (telemetry endpoint)
 * Public endpoint - no authentication required
 */
const trackWidgetLoad = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      widgetId,
      projectId,
      loadTime,
      layoutType,
      browser,
      device,
      country,
      errorCode,
      version,
    } = req.body;

    // Validate required fields
    if (!widgetId || !projectId || !version) {
      throw new ValidationError("widgetId, projectId, and version are required");
    }

    if (loadTime !== undefined && (typeof loadTime !== 'number' || loadTime < 0)) {
      throw new ValidationError("loadTime must be a positive number");
    }

    // Create analytics record
    await prisma.widgetAnalytics.create({
      data: {
        widgetId,
        projectId,
        loadTime: loadTime || 0,
        layoutType: layoutType || 'unknown',
        browser,
        device,
        country,
        errorCode,
        version,
      },
    });

    // Return minimal response for telemetry
    ResponseHandler.success(res, {
      message: "Telemetry recorded",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get widget analytics for a specific widget
 * Requires authentication
 */
const getWidgetAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;
    const { days = '30' } = req.query;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    const daysNum = parseInt(days as string, 10);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      throw new ValidationError("days must be between 1 and 90");
    }

    // Verify widget exists
    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: { Project: true },
    });

    if (!widget) {
      throw new NotFoundError("Widget not found");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get analytics data
    const analytics = await prisma.widgetAnalytics.findMany({
      where: {
        widgetId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate metrics
    const totalLoads = analytics.length;
    const successfulLoads = analytics.filter(a => !a.errorCode).length;
    const failedLoads = analytics.filter(a => a.errorCode).length;
    const errorRate = totalLoads > 0 ? (failedLoads / totalLoads) * 100 : 0;

    // Calculate load time percentiles
    const loadTimes = analytics
      .filter(a => !a.errorCode && a.loadTime > 0)
      .map(a => a.loadTime)
      .sort((a, b) => a - b);

    const p50 = loadTimes.length > 0 ? loadTimes[Math.floor(loadTimes.length * 0.5)] : 0;
    const p95 = loadTimes.length > 0 ? loadTimes[Math.floor(loadTimes.length * 0.95)] : 0;
    const p99 = loadTimes.length > 0 ? loadTimes[Math.floor(loadTimes.length * 0.99)] : 0;
    const avgLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0;

    // Browser breakdown
    const browserCounts = analytics.reduce((acc, a) => {
      const browser = a.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Device breakdown
    const deviceCounts = analytics.reduce((acc, a) => {
      const device = a.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Country breakdown
    const countryCounts = analytics.reduce((acc, a) => {
      const country = a.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily load counts
    const dailyLoads = analytics.reduce((acc, a) => {
      const date = a.timestamp.toISOString().split('T')[0];
      if (!date) return acc;

      if (!acc[date]) {
        acc[date] = { total: 0, successful: 0, failed: 0 };
      }
      acc[date].total++;
      if (a.errorCode) {
        acc[date].failed++;
      } else {
        acc[date].successful++;
      }
      return acc;
    }, {} as Record<string, { total: number; successful: number; failed: number }>);

    ResponseHandler.success(res, {
      message: "Widget analytics fetched successfully",
      data: {
        widget: {
          id: widget.id,
          projectId: widget.projectId,
          projectName: widget.Project?.name,
        },
        period: {
          days: daysNum,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        metrics: {
          totalLoads,
          successfulLoads,
          failedLoads,
          errorRate: Math.round(errorRate * 100) / 100,
          loadTime: {
            avg: Math.round(avgLoadTime || 0),
            p50: Math.round(p50 || 0),
            p95: Math.round(p95 || 0),
            p99: Math.round(p99 || 0),
          },
        },
        breakdown: {
          browsers: Object.entries(browserCounts).map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / totalLoads) * 100 * 100) / 100,
          })),
          devices: Object.entries(deviceCounts).map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / totalLoads) * 100 * 100) / 100,
          })),
          countries: Object.entries(countryCounts).map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / totalLoads) * 100 * 100) / 100,
          })),
        },
        dailyLoads: Object.entries(dailyLoads).map(([date, counts]) => ({
          date,
          ...counts,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get real-time widget analytics (last 5 minutes)
 * Requires authentication
 */
const getRealtimeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    // Verify widget exists
    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
    });

    if (!widget) {
      throw new NotFoundError("Widget not found");
    }

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // Get recent analytics
    const recentAnalytics = await prisma.widgetAnalytics.findMany({
      where: {
        widgetId,
        timestamp: {
          gte: fiveMinutesAgo,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const totalLoads = recentAnalytics.length;
    const errors = recentAnalytics.filter(a => a.errorCode);
    const errorRate = totalLoads > 0 ? (errors.length / totalLoads) * 100 : 0;

    const loadTimes = recentAnalytics
      .filter(a => !a.errorCode && a.loadTime > 0)
      .map(a => a.loadTime);

    const avgLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0;

    ResponseHandler.success(res, {
      message: "Real-time analytics fetched successfully",
      data: {
        widgetId,
        period: "last_5_minutes",
        timestamp: new Date().toISOString(),
        metrics: {
          totalLoads,
          errorCount: errors.length,
          errorRate: Math.round(errorRate * 100) / 100,
          avgLoadTime: Math.round(avgLoadTime),
        },
        recentErrors: errors.slice(0, 10).map(e => ({
          errorCode: e.errorCode,
          timestamp: e.timestamp.toISOString(),
          browser: e.browser,
          device: e.device,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance alerts for a widget
 * Requires authentication
 */
const getPerformanceAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { widgetId } = req.params;
    const { resolved = 'false' } = req.query;

    if (!widgetId) {
      throw new BadRequestError("Widget ID is required");
    }

    const showResolved = resolved === 'true';

    const alerts = await prisma.widgetPerformanceAlert.findMany({
      where: {
        widgetId,
        ...(showResolved ? {} : { resolved: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    ResponseHandler.success(res, {
      message: "Performance alerts fetched successfully",
      data: {
        widgetId,
        alerts: alerts.map(alert => ({
          id: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          message: alert.message,
          threshold: alert.threshold,
          actualValue: alert.actualValue,
          resolved: alert.resolved,
          resolvedAt: alert.resolvedAt?.toISOString(),
          createdAt: alert.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve a performance alert
 * Requires authentication
 */
const resolvePerformanceAlert = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { alertId } = req.params;

    if (!alertId) {
      throw new BadRequestError("Alert ID is required");
    }

    const alert = await prisma.widgetPerformanceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundError("Alert not found");
    }

    const updatedAlert = await prisma.widgetPerformanceAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    ResponseHandler.success(res, {
      message: "Alert resolved successfully",
      data: updatedAlert,
    });
  } catch (error) {
    next(error);
  }
};

export {
  trackWidgetLoad,
  getWidgetAnalytics,
  getRealtimeAnalytics,
  getPerformanceAlerts,
  resolvePerformanceAlert,
};
