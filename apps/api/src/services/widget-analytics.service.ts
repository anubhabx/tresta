import { prisma } from "@workspace/database/prisma";

/**
 * Check widget performance and create alerts if thresholds are exceeded.
 *
 * Uses batched queries to avoid N+1:
 *   1. Fetch all analytics for ALL widgets in one query (grouped by widgetId).
 *   2. Fetch all unresolved recent alerts in one query.
 *   3. Compute metrics in-memory, then batch-create missing alerts.
 */
export async function checkWidgetPerformance() {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 1. Single query: all analytics from the last hour with widget info
    const recentAnalytics = await prisma.widgetAnalytics.findMany({
      where: { timestamp: { gte: oneHourAgo } },
      select: {
        widgetId: true,
        errorCode: true,
        loadTime: true,
      },
    });

    if (recentAnalytics.length === 0) {
      console.log('[Widget Analytics] No recent analytics — skipping performance check');
      return;
    }

    // Group analytics by widgetId in-memory
    const analyticsByWidget = new Map<string, typeof recentAnalytics>();
    for (const a of recentAnalytics) {
      const list = analyticsByWidget.get(a.widgetId) ?? [];
      list.push(a);
      analyticsByWidget.set(a.widgetId, list);
    }

    // 2. Single query: widget projectId lookup for widgets that have analytics
    const widgetIds = [...analyticsByWidget.keys()];
    const widgets = await prisma.widget.findMany({
      where: { id: { in: widgetIds } },
      select: { id: true, projectId: true },
    });
    const widgetProjectMap = new Map(widgets.map((w) => [w.id, w.projectId ?? '']));

    // 3. Single query: all unresolved alerts created in the last hour for these widgets
    const existingAlerts = await prisma.widgetPerformanceAlert.findMany({
      where: {
        widgetId: { in: widgetIds },
        resolved: false,
        createdAt: { gte: oneHourAgo },
        alertType: { in: ['ERROR_RATE_EXCEEDED', 'LOAD_TIME_EXCEEDED'] },
      },
      select: { widgetId: true, alertType: true },
    });

    // Build a set of "widgetId:alertType" for fast lookup
    const alertSet = new Set(existingAlerts.map((a) => `${a.widgetId}:${a.alertType}`));

    // 4. Compute metrics and collect alerts to create
    const alertsToCreate: Parameters<typeof prisma.widgetPerformanceAlert.create>[0]['data'][] = [];

    for (const [widgetId, analytics] of analyticsByWidget) {
      const totalLoads = analytics.length;
      const failedLoads = analytics.filter((a) => a.errorCode).length;
      const errorRate = (failedLoads / totalLoads) * 100;

      const loadTimes = analytics
        .filter((a) => !a.errorCode && a.loadTime > 0)
        .map((a) => a.loadTime);

      const avgLoadTime =
        loadTimes.length > 0
          ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
          : 0;

      const projectId = widgetProjectMap.get(widgetId) ?? '';

      // Error rate threshold (1%)
      if (errorRate > 1 && !alertSet.has(`${widgetId}:ERROR_RATE_EXCEEDED`)) {
        alertsToCreate.push({
          widgetId,
          projectId,
          alertType: 'ERROR_RATE_EXCEEDED',
          severity: errorRate > 5 ? 'CRITICAL' : 'WARNING',
          message: `Widget error rate is ${errorRate.toFixed(2)}%, exceeding the 1% threshold`,
          threshold: 1,
          actualValue: errorRate,
        });
      }

      // Load time threshold (3000ms)
      if (avgLoadTime > 3000 && !alertSet.has(`${widgetId}:LOAD_TIME_EXCEEDED`)) {
        alertsToCreate.push({
          widgetId,
          projectId,
          alertType: 'LOAD_TIME_EXCEEDED',
          severity: avgLoadTime > 5000 ? 'CRITICAL' : 'WARNING',
          message: `Widget average load time is ${avgLoadTime.toFixed(0)}ms, exceeding the 3000ms threshold`,
          threshold: 3000,
          actualValue: avgLoadTime,
        });
      }
    }

    // 5. Batch-create all new alerts in a single transaction
    if (alertsToCreate.length > 0) {
      await prisma.$transaction(
        alertsToCreate.map((data) => prisma.widgetPerformanceAlert.create({ data })),
      );
    }

    console.log(
      `[Widget Analytics] Performance check completed for ${analyticsByWidget.size} widgets, ${alertsToCreate.length} new alerts created`,
    );
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
