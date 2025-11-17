import { prisma } from "@workspace/database/prisma";

/**
 * Check widget performance and create alerts if thresholds are exceeded
 */
export async function checkWidgetPerformance() {
  try {
    // Get all widgets
    const widgets = await prisma.widget.findMany({
      select: {
        id: true,
        projectId: true,
      },
    });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const widget of widgets) {
      // Get analytics for the last hour
      const analytics = await prisma.widgetAnalytics.findMany({
        where: {
          widgetId: widget.id,
          timestamp: {
            gte: oneHourAgo,
          },
        },
      });

      if (analytics.length === 0) continue;

      // Calculate metrics
      const totalLoads = analytics.length;
      const failedLoads = analytics.filter(a => a.errorCode).length;
      const errorRate = (failedLoads / totalLoads) * 100;

      const loadTimes = analytics
        .filter(a => !a.errorCode && a.loadTime > 0)
        .map(a => a.loadTime);

      const avgLoadTime = loadTimes.length > 0
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
        : 0;

      // Check for error rate threshold (1%)
      if (errorRate > 1) {
        // Check if alert already exists
        const existingAlert = await prisma.widgetPerformanceAlert.findFirst({
          where: {
            widgetId: widget.id,
            alertType: 'ERROR_RATE_EXCEEDED',
            resolved: false,
            createdAt: {
              gte: oneHourAgo,
            },
          },
        });

        if (!existingAlert) {
          await prisma.widgetPerformanceAlert.create({
            data: {
              widgetId: widget.id,
              projectId: widget.projectId || '',
              alertType: 'ERROR_RATE_EXCEEDED',
              severity: errorRate > 5 ? 'CRITICAL' : 'WARNING',
              message: `Widget error rate is ${errorRate.toFixed(2)}%, exceeding the 1% threshold`,
              threshold: 1,
              actualValue: errorRate,
            },
          });
        }
      }

      // Check for load time threshold (3000ms)
      if (avgLoadTime > 3000) {
        const existingAlert = await prisma.widgetPerformanceAlert.findFirst({
          where: {
            widgetId: widget.id,
            alertType: 'LOAD_TIME_EXCEEDED',
            resolved: false,
            createdAt: {
              gte: oneHourAgo,
            },
          },
        });

        if (!existingAlert) {
          await prisma.widgetPerformanceAlert.create({
            data: {
              widgetId: widget.id,
              projectId: widget.projectId || '',
              alertType: 'LOAD_TIME_EXCEEDED',
              severity: avgLoadTime > 5000 ? 'CRITICAL' : 'WARNING',
              message: `Widget average load time is ${avgLoadTime.toFixed(0)}ms, exceeding the 3000ms threshold`,
              threshold: 3000,
              actualValue: avgLoadTime,
            },
          });
        }
      }
    }

    console.log(`[Widget Analytics] Performance check completed for ${widgets.length} widgets`);
  } catch (error) {
    console.error('[Widget Analytics] Error checking performance:', error);
  }
}

/**
 * Clean up old analytics data (older than 90 days)
 */
export async function cleanupOldAnalytics() {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.widgetAnalytics.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    console.log(`[Widget Analytics] Cleaned up ${result.count} old analytics records`);
  } catch (error) {
    console.error('[Widget Analytics] Error cleaning up old analytics:', error);
  }
}
