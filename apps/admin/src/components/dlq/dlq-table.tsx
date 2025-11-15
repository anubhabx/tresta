'use client';

import { formatDate, formatRelativeTime } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCw, Eye } from 'lucide-react';
import { useState } from 'react';
import { DLQJobModal } from './dlq-job-modal';

interface DLQJob {
  id: string;
  jobId: string;
  queue: string;
  data: any;
  error: string;
  errorType: 'transient' | 'permanent';
  statusCode: number | null;
  retried: boolean;
  retriedAt: string | null;
  failedAt: string;
}

interface DLQTableProps {
  jobs: DLQJob[];
  onRequeue: (jobId: string) => void;
  isRequeuing?: string;
}

export function DLQTable({ jobs, onRequeue, isRequeuing }: DLQTableProps) {
  const [selectedJob, setSelectedJob] = useState<DLQJob | null>(null);

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No failed jobs in the Dead Letter Queue
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Queue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Error Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Error Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Failed At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {job.queue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={job.errorType === 'transient' ? 'warning' : 'destructive'}
                    >
                      {job.errorType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
                    {job.error}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span title={formatDate(job.failedAt)}>
                      {formatRelativeTime(job.failedAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {job.retried ? (
                      <Badge variant="secondary">Retried</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedJob(job)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onRequeue(job.id)}
                      disabled={job.retried || isRequeuing === job.id}
                    >
                      <RotateCw
                        className={`h-4 w-4 ${isRequeuing === job.id ? 'animate-spin' : ''}`}
                      />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJob && (
        <DLQJobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRequeue={onRequeue}
          isRequeuing={isRequeuing === selectedJob.id}
        />
      )}
    </>
  );
}
