import { createApiClient } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface HealthCheck {
  status: string;
  checks: {
    database: boolean;
    redis: boolean;
    bullmq: boolean;
  };
  timestamp: string;
}

async function getHealthStatus(): Promise<HealthCheck | null> {
  try {
    const api = await createApiClient();
    const response = await api.get('/readyz');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    return null;
  }
}

export default async function HealthPage() {
  const health = await getHealthStatus();

  if (!health) {
    return (
      <div className="card">
        <p className="text-red-600">Failed to load health status. Please try again.</p>
      </div>
    );
  }

  const allHealthy = health.status === 'ready';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">System Health</h2>
        <p className="text-sm text-gray-500">
          Last checked: {formatDistanceToNow(new Date(health.timestamp), { addSuffix: true })}
        </p>
      </div>

      {/* Overall Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Status</h3>
            <p className="text-sm text-gray-600">
              {allHealthy ? 'All systems operational' : 'Some systems are down'}
            </p>
          </div>
          <div className="text-4xl">
            {allHealthy ? '✅' : '⚠️'}
          </div>
        </div>
      </div>

      {/* Individual Checks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Database</h4>
            <span className="text-2xl">
              {health.checks.database ? '✅' : '❌'}
            </span>
          </div>
          <p className="text-sm text-gray-600">PostgreSQL Connection</p>
          <p className="text-xs mt-2">
            <span
              className={`badge ${
                health.checks.database ? 'badge-success' : 'badge-error'
              }`}
            >
              {health.checks.database ? 'Connected' : 'Disconnected'}
            </span>
          </p>
        </div>

        {/* Redis */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Redis</h4>
            <span className="text-2xl">
              {health.checks.redis ? '✅' : '❌'}
            </span>
          </div>
          <p className="text-sm text-gray-600">Cache & Queue Storage</p>
          <p className="text-xs mt-2">
            <span
              className={`badge ${
                health.checks.redis ? 'badge-success' : 'badge-error'
              }`}
            >
              {health.checks.redis ? 'Connected' : 'Disconnected'}
            </span>
          </p>
        </div>

        {/* BullMQ */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">BullMQ</h4>
            <span className="text-2xl">
              {health.checks.bullmq ? '✅' : '❌'}
            </span>
          </div>
          <p className="text-sm text-gray-600">Job Queue System</p>
          <p className="text-xs mt-2">
            <span
              className={`badge ${
                health.checks.bullmq ? 'badge-success' : 'badge-error'
              }`}
            >
              {health.checks.bullmq ? 'Operational' : 'Down'}
            </span>
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      {!allHealthy && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            ⚠️ Action Required
          </h3>
          <p className="text-sm text-red-800 mb-4">
            One or more systems are not responding. Check the following:
          </p>
          <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
            {!health.checks.database && (
              <li>Database connection - Check DATABASE_URL environment variable</li>
            )}
            {!health.checks.redis && (
              <li>Redis connection - Check REDIS_URL environment variable</li>
            )}
            {!health.checks.bullmq && (
              <li>BullMQ queues - Ensure Redis is accessible and workers are running</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
