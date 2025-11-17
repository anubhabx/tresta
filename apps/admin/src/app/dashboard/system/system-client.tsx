'use client';

import { useSystemInfo } from '@/lib/hooks/use-system-info';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Server,
  Database,
  Zap,
  Flag,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export function SystemClient() {
  const { data: systemInfo, isLoading, error, refetch } = useSystemInfo();

  const environmentColors = {
    development: 'secondary' as const,
    staging: 'warning' as const,
    production: 'default' as const,
  };

  const serviceStatusIcons = {
    operational: <CheckCircle className="h-5 w-5 text-green-600" />,
    degraded: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    down: <XCircle className="h-5 w-5 text-red-600" />,
  };

  const serviceStatusColors = {
    operational: 'default' as const,
    degraded: 'warning' as const,
    down: 'destructive' as const,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Failed to Load System Information
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button variant="destructive" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!systemInfo) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            System Information
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View system configuration and service status
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Environment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Environment
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={environmentColors[systemInfo.environment as keyof typeof environmentColors] || 'default'} className="text-lg px-4 py-2">
            {systemInfo.environment.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Versions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            System Versions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">API Version</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.versions.api}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Database</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.versions.database}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Redis</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.versions.redis}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Node.js</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {systemInfo.versions.node}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Feature Flags
          </h2>
        </div>
        <div className="space-y-3">
          {Object.entries(systemInfo.featureFlags).map(([key, enabled]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {key}
                </p>
              </div>
              <Badge variant={enabled ? 'default' : 'secondary'}>
                {enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          ))}
          {Object.keys(systemInfo.featureFlags).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No feature flags configured
            </p>
          )}
        </div>
      </div>

      {/* External Services */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            External Services
          </h2>
        </div>
        <div className="space-y-3">
          {Object.entries(systemInfo.externalServices).map(([name, service]) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {serviceStatusIcons[service.status as keyof typeof serviceStatusIcons] || serviceStatusIcons.operational}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </p>
                  {'provider' in service && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Provider: {service.provider}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={serviceStatusColors[service.status as keyof typeof serviceStatusColors] || 'default'}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Security Notice
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Sensitive configuration values (API keys, secrets, passwords) are masked for
              security. Full configuration is available in environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
