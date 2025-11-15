'use client';

import { useState } from 'react';
import { useDLQ, useRequeueJob } from '@/lib/hooks/use-dlq';
import { DLQTable } from '@/components/dlq/dlq-table';
import { RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DLQClient() {
  const [queue, setQueue] = useState<string>('');
  const [errorType, setErrorType] = useState<string>('');

  const params = {
    ...(queue && { queue }),
    ...(errorType && { errorType }),
  };

  const { data, isLoading, error, refetch } = useDLQ(Object.keys(params).length > 0 ? params : undefined);
  const { mutate: requeueJob, isPending, variables } = useRequeueJob();

  const handleRequeue = (jobId: string) => {
    requeueJob(jobId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dead Letter Queue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage failed background jobs and retry operations
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Queue
              </label>
              <select
                value={queue}
                onChange={(e) => setQueue(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Queues</option>
                <option value="notifications">Notifications</option>
                <option value="send-email">Send Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Error Type
              </label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="transient">Transient</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>
          </div>
          {(queue || errorType) && (
            <Button
              variant="outline"
              onClick={() => {
                setQueue('');
                setErrorType('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Failed to Load DLQ Jobs
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="destructive" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Stats */}
      {data && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Failed Jobs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {data.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {data.jobs.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Limit</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {data.limit}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {data && !isLoading && (
        <DLQTable
          jobs={data.jobs}
          onRequeue={handleRequeue}
          isRequeuing={isPending ? (variables as string) : undefined}
        />
      )}
    </div>
  );
}
