'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Activity, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface RealtimeData {
  widgetId: string;
  period: string;
  timestamp: string;
  metrics: {
    totalLoads: number;
    errorCount: number;
    errorRate: number;
    avgLoadTime: number;
  };
  recentErrors: Array<{
    errorCode: string;
    timestamp: string;
    browser?: string;
    device?: string;
  }>;
}

interface RealtimeMonitorProps {
  widgetId: string;
}

export function RealtimeMonitor({ widgetId }: RealtimeMonitorProps) {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealtimeData = async () => {
    try {
      const response = await apiClient.get(
        `/admin/widgets/${widgetId}/realtime`
      );
      setData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load real-time data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000);

    return () => clearInterval(interval);
  }, [widgetId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Real-time Monitor
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            (Last 5 minutes)
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Updated: {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Loads
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.metrics.totalLoads}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Errors
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.metrics.errorCount}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Error Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.metrics.errorRate.toFixed(2)}%
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Load Time
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.metrics.avgLoadTime}ms
          </p>
        </div>
      </div>

      {data.recentErrors.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Recent Errors
          </h3>
          <div className="space-y-2">
            {data.recentErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-900/10 rounded p-2"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900 dark:text-red-100">
                    {error.errorCode}
                  </span>
                  {error.browser && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {error.browser}
                    </span>
                  )}
                  {error.device && (
                    <span className="text-gray-600 dark:text-gray-400">
                      ({error.device})
                    </span>
                  )}
                </div>
                <span className="text-gray-500 dark:text-gray-500 text-xs">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
