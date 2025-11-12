'use client';

import { useHealth } from '@/lib/hooks/use-health';
import { SystemStatus } from '@/components/health/system-status';
import { HealthCheckCard } from '@/components/health/health-check-card';
import { RefreshCw } from 'lucide-react';

export function HealthClient() {
  const { data: health, isLoading, error, refetch } = useHealth();

  const status = isLoading ? 'loading' : health?.status || 'not ready';
  const checks = health?.checks || { database: false, redis: false, bullmq: false };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Health Checks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor system infrastructure and service health
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Failed to Check System Health
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
      )}

      {/* Overall System Status */}
      <SystemStatus status={status} checks={checks} />

      {/* Individual Health Checks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Infrastructure Components
        </h2>

        <HealthCheckCard
          name="Database (PostgreSQL)"
          status={isLoading ? null : checks.database}
          description={
            checks.database
              ? 'Database connection is healthy and responding to queries.'
              : 'Unable to connect to the PostgreSQL database.'
          }
          troubleshooting={
            !checks.database
              ? 'Check DATABASE_URL environment variable, verify PostgreSQL is running, and ensure network connectivity.'
              : undefined
          }
        />

        <HealthCheckCard
          name="Redis"
          status={isLoading ? null : checks.redis}
          description={
            checks.redis
              ? 'Redis connection is healthy and responding to commands.'
              : 'Unable to connect to Redis server.'
          }
          troubleshooting={
            !checks.redis
              ? 'Check REDIS_URL environment variable, verify Redis is running, and ensure network connectivity.'
              : undefined
          }
        />

        <HealthCheckCard
          name="BullMQ"
          status={isLoading ? null : checks.bullmq}
          description={
            checks.bullmq
              ? 'Job queue system is healthy and processing jobs.'
              : 'Unable to connect to BullMQ job queues.'
          }
          troubleshooting={
            !checks.bullmq
              ? 'Check Redis connection (BullMQ depends on Redis), verify queue configuration, and ensure workers are running.'
              : undefined
          }
        />
      </div>

      {/* Last Checked */}
      {health?.timestamp && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Last checked: {new Date(health.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
