'use client';

import { useMetrics } from '@/lib/hooks/use-metrics';
import { QuotaIndicator } from '@/components/dashboard/quota-indicator';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { EmailHistoryChart } from '@/components/dashboard/email-history-chart';
import { Loader2, RefreshCw } from 'lucide-react';

export function DashboardClient() {
  const { data: metrics, isLoading, error, refetch } = useMetrics();

  if (isLoading) {
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
          Failed to Load Metrics
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        No metrics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            System metrics and performance overview
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Quota Indicators */}
      <div className="grid gap-6 md:grid-cols-2">
        <QuotaIndicator
          title="Email Quota"
          used={metrics.emailQuota.used}
          limit={metrics.emailQuota.limit}
          percentage={metrics.emailQuota.percentage}
          remaining={metrics.emailQuota.remaining}
          locked={metrics.emailQuota.locked}
        />
        <QuotaIndicator
          title="Ably Connections"
          used={metrics.ablyConnections.current}
          limit={metrics.ablyConnections.limit}
          percentage={metrics.ablyConnections.percentage}
          remaining={metrics.ablyConnections.limit - metrics.ablyConnections.current}
        />
      </div>

      {/* Stats Grid */}
      <StatsGrid metrics={metrics.metrics} queues={metrics.queues} />

      {/* Email History Chart */}
      <EmailHistoryChart data={metrics.history} />

      {/* Last Updated */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
