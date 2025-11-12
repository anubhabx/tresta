import { createApiClient } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface MetricsData {
  emailQuota: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
    locked: boolean;
    nextRetry: string | null;
  };
  ablyConnections: {
    current: number;
    limit: number;
    percentage: number;
  };
  metrics: {
    notificationsSent: number;
    emailsSent: number;
    emailsDeferred: number;
    emailsFailed: number;
  };
  queues: {
    dlqCount: number;
    outboxPending: number;
  };
  history: Array<{
    date: string;
    count: number;
  }>;
  timestamp: string;
}

async function getMetrics(): Promise<MetricsData | null> {
  try {
    const api = await createApiClient();
    const response = await api.get('/admin/metrics');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  if (!metrics) {
    return (
      <div className="card">
        <p className="text-red-600">Failed to load metrics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Last updated: {formatDistanceToNow(new Date(metrics.timestamp), { addSuffix: true })}
        </p>
      </div>

      {/* Email Quota */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Email Quota (Daily)</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium">
                {metrics.emailQuota.used} / {metrics.emailQuota.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  metrics.emailQuota.percentage >= 90
                    ? 'bg-red-600'
                    : metrics.emailQuota.percentage >= 80
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${metrics.emailQuota.percentage}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Remaining</p>
              <p className="text-lg font-semibold">{metrics.emailQuota.remaining}</p>
            </div>
            <div>
              <p className="text-gray-600">Percentage</p>
              <p className="text-lg font-semibold">{metrics.emailQuota.percentage}%</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p>
                {metrics.emailQuota.locked ? (
                  <span className="badge badge-error">Locked</span>
                ) : (
                  <span className="badge badge-success">Active</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ably Connections */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Ably Connections</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Current Connections</span>
              <span className="font-medium">
                {metrics.ablyConnections.current} / {metrics.ablyConnections.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${metrics.ablyConnections.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Notifications Sent</p>
          <p className="text-2xl font-bold">{metrics.metrics.notificationsSent}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Emails Sent</p>
          <p className="text-2xl font-bold">{metrics.metrics.emailsSent}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Emails Deferred</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.metrics.emailsDeferred}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Emails Failed</p>
          <p className="text-2xl font-bold text-red-600">{metrics.metrics.emailsFailed}</p>
        </div>
      </div>

      {/* Queue Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Dead Letter Queue</p>
          <p className="text-2xl font-bold">{metrics.queues.dlqCount}</p>
          {metrics.queues.dlqCount > 0 && (
            <p className="text-sm text-red-600 mt-1">Requires attention</p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Outbox Pending</p>
          <p className="text-2xl font-bold">{metrics.queues.outboxPending}</p>
        </div>
      </div>

      {/* Email History */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Email Usage History (Last 7 Days)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.history.map((day) => (
                <tr key={day.date}>
                  <td className="px-4 py-2 text-sm">{day.date}</td>
                  <td className="px-4 py-2 text-sm font-medium">{day.count}</td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`badge ${
                        (day.count / 200) * 100 >= 90
                          ? 'badge-error'
                          : (day.count / 200) * 100 >= 80
                          ? 'badge-warning'
                          : 'badge-success'
                      }`}
                    >
                      {Math.round((day.count / 200) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
