'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { AlertTriangle, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

interface Alert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  threshold: number;
  actualValue: number;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

interface PerformanceAlertsProps {
  widgetId: string;
}

export function PerformanceAlerts({ widgetId }: PerformanceAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.get(
        `/api/widget-analytics/${widgetId}/alerts?resolved=${showResolved}`
      );
      setAlerts(response.data.data.alerts);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await apiClient.patch(`/api/widget-analytics/alerts/${alertId}/resolve`);
      fetchAlerts();
    } catch (err: any) {
      console.error('Failed to resolve alert:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [widgetId, showResolved]);

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

  const activeAlerts = alerts.filter(a => !a.resolved);
  const hasActiveAlerts = activeAlerts.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {hasActiveAlerts ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Performance Alerts
          </h2>
          {hasActiveAlerts && (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
              {activeAlerts.length} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showResolved ? 'Hide resolved' : 'Show resolved'}
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <CheckCircle className="h-8 w-8 mb-2 text-green-600" />
          <p>No performance alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${
                alert.resolved
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                  : alert.severity === 'CRITICAL'
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  : alert.severity === 'WARNING'
                  ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.resolved ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : alert.severity === 'CRITICAL' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {alert.alertType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : alert.severity === 'WARNING'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      Threshold: {alert.threshold}
                      {alert.alertType.includes('LOAD_TIME') ? 'ms' : '%'}
                    </span>
                    <span>
                      Actual: {alert.actualValue.toFixed(2)}
                      {alert.alertType.includes('LOAD_TIME') ? 'ms' : '%'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {alert.resolved && alert.resolvedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-4 px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
