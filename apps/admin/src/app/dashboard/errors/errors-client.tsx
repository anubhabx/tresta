'use client';

import { useCallback, useMemo, useState } from 'react';
import { useErrorLogs, type ErrorLog } from '@/lib/hooks/use-error-logs';
import { DataTable, type DataTableColumn } from '@/components/tables/data-table';
import { TableSearch } from '@/components/tables/table-search';
import { ErrorDetailModal } from '@/components/errors/error-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Eye } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils/format';

const severityVariants = {
  LOW: 'secondary' as const,
  MEDIUM: 'warning' as const,
  HIGH: 'destructive' as const,
  CRITICAL: 'destructive' as const,
};

export function ErrorsClient() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const params = {
    ...(search && { search }),
    ...(severity && { severity }),
    ...(type && { type }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading, error, refetch } = useErrorLogs(
    Object.keys(params).length > 0 ? params : undefined,
  );

  const handleViewDetails = useCallback((errorLog: ErrorLog) => {
    setSelectedError(errorLog);
    setDetailModalOpen(true);
  }, []);

  const columns: DataTableColumn<ErrorLog>[] = useMemo(
    () => [
      {
        key: 'severity',
        header: 'Severity',
        render: (errorLog) => (
          <Badge variant={severityVariants[errorLog.severity as keyof typeof severityVariants]}>
            {errorLog.severity}
          </Badge>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (errorLog) => <Badge variant="outline">{errorLog.type}</Badge>,
      },
      {
        key: 'message',
        header: 'Message',
        render: (errorLog) => (
          <div className="max-w-md">
            <span className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
              {errorLog.message}
            </span>
          </div>
        ),
      },
      {
        key: 'userId',
        header: 'Affected User',
        render: (errorLog) =>
          errorLog.userId ? (
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {errorLog.userId.substring(0, 8)}...
            </span>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
          ),
      },
      {
        key: 'timestamp',
        header: 'Timestamp',
        render: (errorLog) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(errorLog.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (errorLog) => (
          <Button size="sm" variant="ghost" onClick={() => handleViewDetails(errorLog)}>
            <Eye className="h-4 w-4" />
            View
          </Button>
        ),
      },
    ],
    [handleViewDetails],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Error Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and investigate application errors
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search errors..."
              />
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="TypeError">TypeError</option>
                <option value="ReferenceError">ReferenceError</option>
                <option value="ValidationError">ValidationError</option>
                <option value="DatabaseError">DatabaseError</option>
                <option value="NetworkError">NetworkError</option>
                <option value="AuthenticationError">AuthenticationError</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(search || severity || type || startDate || endDate) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSeverity('');
                  setType('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Failed to Load Error Logs
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(data.errors.length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {formatNumber(data.errors.filter((e) => e.severity === 'CRITICAL').length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {formatNumber(data.errors.filter((e) => e.severity === 'HIGH').length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Medium/Low</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {formatNumber(
                data.errors.filter((e) => e.severity === 'MEDIUM' || e.severity === 'LOW').length
              )}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {data && !isLoading && (
        <DataTable data={data.errors} columns={columns} emptyMessage="No error logs found" />
      )}

      {/* Detail Modal */}
      <ErrorDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        error={selectedError}
      />
    </div>
  );
}
