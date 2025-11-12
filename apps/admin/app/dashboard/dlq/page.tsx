import { createApiClient } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { RequeueButton } from '@/components/requeue-button';

interface DLQJob {
  id: string;
  jobId: string;
  queue: string;
  error: string;
  errorType: string | null;
  statusCode: number | null;
  failedAt: string;
  retried: boolean;
}

interface DLQData {
  jobs: DLQJob[];
  total: number;
  limit: number;
}

async function getDLQJobs(): Promise<DLQData | null> {
  try {
    const api = await createApiClient();
    const response = await api.get('/admin/dlq?limit=50');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch DLQ jobs:', error);
    return null;
  }
}

export default async function DLQPage() {
  const data = await getDLQJobs();

  if (!data) {
    return (
      <div className="card">
        <p className="text-red-600">Failed to load DLQ data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Dead Letter Queue</h2>
        <p className="text-sm text-gray-500">
          Failed jobs that require manual intervention
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Failed Jobs</p>
          <p className="text-2xl font-bold">{data.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Showing</p>
          <p className="text-2xl font-bold">{data.jobs.length}</p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card">
        {data.jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">✅ No failed jobs</p>
            <p className="text-gray-400 text-sm mt-2">All systems operational</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Queue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Failed At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="badge badge-info">{job.queue}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.errorType ? (
                        <span
                          className={`badge ${
                            job.errorType === 'transient'
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                        >
                          {job.errorType}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.statusCode || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-md">
                      <p className="truncate" title={job.error}>
                        {job.error}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(job.failedAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <RequeueButton jobId={job.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
