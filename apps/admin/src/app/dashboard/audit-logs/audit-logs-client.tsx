'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/lib/hooks/use-audit-logs';
import { useExport } from '@/lib/hooks/use-export';
import { DataTable } from '@/components/tables/data-table';
import { TableSearch } from '@/components/tables/table-search';
import { AuditDetailModal } from '@/components/audit/audit-detail-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Eye, Download } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { toast } from 'sonner';

export function AuditLogsClient() {
  const [search, setSearch] = useState('');
  const [adminId, setAdminId] = useState('');
  const [actionType, setActionType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const params = {
    ...(search && { search }),
    ...(adminId && { adminId }),
    ...(actionType && { actionType }),
    ...(targetType && { targetType }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading, error, refetch } = useAuditLogs(
    Object.keys(params).length > 0 ? params : undefined
  );

  const exportMutation = useExport();

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    if (!data || data.logs.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = data.logs.map((log) => ({
      id: log.id,
      requestId: log.requestId,
      adminName: log.adminName,
      adminEmail: log.adminEmail,
      actionType: log.actionType,
      targetType: log.targetType,
      targetId: log.targetId,
      createdAt: formatDate(log.createdAt),
    }));

    exportMutation.mutate({
      entityType: 'audit-logs',
      data: exportData,
      columns: [
        'id',
        'requestId',
        'adminName',
        'adminEmail',
        'actionType',
        'targetType',
        'targetId',
        'createdAt',
      ],
      filenamePrefix: 'audit-logs',
    });
  };

  const columns = [
    {
      key: 'admin',
      header: 'Admin',
      render: (log: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {log.adminName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{log.adminEmail}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: any) => <Badge variant="outline">{log.actionType}</Badge>,
    },
    {
      key: 'target',
      header: 'Target',
      render: (log: any) => (
        <div>
          <Badge variant="secondary">{log.targetType}</Badge>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {log.targetId.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'requestId',
      header: 'Request ID',
      render: (log: any) => (
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {log.requestId.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(log.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (log: any) => (
        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(log)}>
          <Eye className="h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Audit Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all administrative actions and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || !data || data.logs.length === 0 || exportMutation.isPending}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
                placeholder="Search logs..."
              />
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="FLAG">Flag</option>
                <option value="BULK_UPDATE">Bulk Update</option>
                <option value="EXPORT_USER_DATA">Export User Data</option>
              </select>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Targets</option>
                <option value="USER">User</option>
                <option value="PROJECT">Project</option>
                <option value="TESTIMONIAL">Testimonial</option>
                <option value="SETTING">Setting</option>
                <option value="SESSION">Session</option>
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

          {(search || actionType || targetType || startDate || endDate) && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setActionType('');
                  setTargetType('');
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
            Failed to Load Audit Logs
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{formatNumber(data.logs.length)}</span> audit
            log entries
          </p>
        </div>
      )}

      {/* Table */}
      {data && !isLoading && (
        <DataTable
          data={data.logs}
          columns={columns}
          emptyMessage="No audit logs found"
        />
      )}

      {/* Detail Modal */}
      <AuditDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        log={selectedLog}
      />
    </div>
  );
}
