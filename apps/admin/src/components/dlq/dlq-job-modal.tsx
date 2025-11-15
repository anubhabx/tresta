'use client';

import { X, RotateCw } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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

interface DLQJobModalProps {
  job: DLQJob;
  onClose: () => void;
  onRequeue: (jobId: string) => void;
  isRequeuing: boolean;
}

export function DLQJobModal({ job, onClose, onRequeue, isRequeuing }: DLQJobModalProps) {
  const [showFullError, setShowFullError] = useState(false);
  const errorPreview = job.error.slice(0, 500);
  const isTruncated = job.error.length > 500;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Failed Job Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Job Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Job Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Job ID:</span>
                <p className="font-mono text-gray-900 dark:text-gray-100">{job.jobId}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Queue:</span>
                <p className="text-gray-900 dark:text-gray-100">{job.queue}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Error Type:</span>
                <div className="mt-1">
                  <Badge variant={job.errorType === 'transient' ? 'warning' : 'destructive'}>
                    {job.errorType}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status Code:</span>
                <p className="text-gray-900 dark:text-gray-100">
                  {job.statusCode || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Failed At:</span>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(job.failedAt)}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="mt-1">
                  {job.retried ? (
                    <Badge variant="secondary">Retried</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Error Message
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <pre className="text-sm text-red-900 dark:text-red-100 whitespace-pre-wrap font-mono">
                {showFullError || !isTruncated ? job.error : errorPreview}
              </pre>
              {isTruncated && (
                <button
                  onClick={() => setShowFullError(!showFullError)}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  {showFullError ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Job Payload */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Job Payload
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(job.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onRequeue(job.id);
              onClose();
            }}
            disabled={job.retried || isRequeuing}
          >
            <RotateCw className={`h-4 w-4 ${isRequeuing ? 'animate-spin' : ''}`} />
            Requeue Job
          </Button>
        </div>
      </div>
    </div>
  );
}
