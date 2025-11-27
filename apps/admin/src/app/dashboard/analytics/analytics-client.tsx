'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Loader2, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { MetricsCard } from '@/components/dashboard/metrics-card';
import { WidgetAnalyticsChart } from '@/components/analytics/widget-analytics-chart';
import { BrowserDeviceBreakdown } from '@/components/analytics/browser-device-breakdown';
import { GeographicDistribution } from '@/components/analytics/geographic-distribution';
import { RealtimeMonitor } from '@/components/analytics/realtime-monitor';
import { PerformanceAlerts } from '@/components/analytics/performance-alerts';
import { WidgetSelector } from '@/components/analytics/widget-selector';
import type { AxiosError } from 'axios';

interface AnalyticsData {
  widget: {
    id: string;
    projectId: string;
    projectName: string;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalLoads: number;
    successfulLoads: number;
    failedLoads: number;
    errorRate: number;
    loadTime: {
      avg: number;
      p50: number;
      p95: number;
      p99: number;
    };
  };
  breakdown: {
    browsers: Array<{ name: string; count: number; percentage: number }>;
    devices: Array<{ name: string; count: number; percentage: number }>;
    countries: Array<{ name: string; count: number; percentage: number }>;
  };
  dailyLoads: Array<{
    date: string;
    total: number;
    successful: number;
    failed: number;
  }>;
}

export function AnalyticsClient() {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!selectedWidgetId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `/admin/widgets/${selectedWidgetId}/analytics?days=${selectedDays}`
      );
      setAnalyticsData(response.data.data);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as AxiosError<{ error?: { message?: string } }>).response?.data?.error?.message
      ) {
        setError(
          (err as AxiosError<{ error?: { message?: string } }>).response?.data?.error?.message ||
            'Failed to load analytics'
        );
      } else {
        setError('Failed to load analytics');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDays, selectedWidgetId]);

  useEffect(() => {
    if (selectedWidgetId) {
      void fetchAnalytics();
    }
  }, [fetchAnalytics, selectedWidgetId]);

  if (!selectedWidgetId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Widget Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor widget performance, load times, and user engagement
          </p>
        </div>

        <WidgetSelector onSelect={setSelectedWidgetId} />
      </div>
    );
  }

  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Failed to Load Analytics
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        No analytics data available
      </div>
    );
  }

  const { metrics, breakdown, dailyLoads } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Widget Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {analyticsData.widget.projectName} - Last {selectedDays} days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => setSelectedWidgetId(null)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Change Widget
          </button>
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Alerts */}
      <PerformanceAlerts widgetId={selectedWidgetId} />

      {/* Real-time Monitor */}
      <RealtimeMonitor widgetId={selectedWidgetId} />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Loads"
          value={metrics.totalLoads.toLocaleString()}
          icon={Activity}
          subtitle={`${metrics.successfulLoads.toLocaleString()} successful`}
        />
        <MetricsCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          icon={AlertTriangle}
          subtitle={`${metrics.failedLoads} failed loads`}
          trend={
            metrics.errorRate > 1
              ? { value: metrics.errorRate, isPositive: false }
              : undefined
          }
        />
        <MetricsCard
          title="Avg Load Time"
          value={`${metrics.loadTime.avg}ms`}
          icon={TrendingUp}
          subtitle={`p50: ${metrics.loadTime.p50}ms`}
          trend={
            metrics.loadTime.avg > 3000
              ? { value: ((metrics.loadTime.avg - 3000) / 3000) * 100, isPositive: false }
              : { value: ((3000 - metrics.loadTime.avg) / 3000) * 100, isPositive: true }
          }
        />
        <MetricsCard
          title="p95 Load Time"
          value={`${metrics.loadTime.p95}ms`}
          icon={TrendingDown}
          subtitle={`p99: ${metrics.loadTime.p99}ms`}
        />
      </div>

      {/* Load Time Chart */}
      <WidgetAnalyticsChart data={dailyLoads} />

      {/* Browser and Device Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <BrowserDeviceBreakdown
          title="Browser Distribution"
          data={breakdown.browsers}
        />
        <BrowserDeviceBreakdown
          title="Device Distribution"
          data={breakdown.devices}
        />
      </div>

      {/* Geographic Distribution */}
      <GeographicDistribution data={breakdown.countries} />
    </div>
  );
}
