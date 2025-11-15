'use client';

import { useState } from 'react';
import { useTestimonials } from '@/lib/hooks/use-testimonials';
import { useExport } from '@/lib/hooks/use-export';
import { DataTable } from '@/components/tables/data-table';
import { TableSearch } from '@/components/tables/table-search';
import { ModerationBadge } from '@/components/testimonials/moderation-badge';
import { ModerationActions } from '@/components/testimonials/moderation-actions';
import { BulkActionsBar } from '@/components/testimonials/bulk-actions-bar';
import { BulkConfirmationDialog } from '@/components/testimonials/bulk-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, Star, Download } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { toast } from 'sonner';

export function TestimonialsClient() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'APPROVED' | 'REJECTED' | 'FLAGGED' | null>(null);

  const params = {
    ...(search && { search }),
    ...(status && { status }),
    ...(rating && { rating }),
  };

  const { data, isLoading, error, refetch } = useTestimonials(
    Object.keys(params).length > 0 ? params : undefined
  );

  const exportMutation = useExport();

  const handleBulkAction = (action: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    setBulkAction(action);
    setBulkDialogOpen(true);
  };

  const handleBulkSuccess = () => {
    const actionLabels = {
      APPROVED: 'approved',
      REJECTED: 'rejected',
      FLAGGED: 'flagged',
    };
    toast.success(`Successfully ${actionLabels[bulkAction!]} ${selectedIds.size} testimonials`);
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleExport = () => {
    if (!data || data.testimonials.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = data.testimonials.map((t) => ({
      id: t.id,
      content: t.content,
      authorName: t.authorName,
      authorEmail: t.authorEmail || '',
      rating: t.rating,
      moderationStatus: t.moderationStatus,
      projectName: t.project.name,
      projectSlug: t.project.slug,
      createdAt: formatDate(t.createdAt),
    }));

    exportMutation.mutate({
      entityType: 'testimonials',
      data: exportData,
      columns: [
        'id',
        'content',
        'authorName',
        'authorEmail',
        'rating',
        'moderationStatus',
        'projectName',
        'projectSlug',
        'createdAt',
      ],
      filenamePrefix: 'testimonials',
    });
  };

  const columns = [
    {
      key: 'content',
      header: 'Content',
      render: (testimonial: any) => (
        <div className="max-w-md">
          <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
            {testimonial.content}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            by {testimonial.authorName}
          </div>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (testimonial: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {testimonial.project.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            /{testimonial.project.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (testimonial: any) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {testimonial.rating}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (testimonial: any) => (
        <ModerationBadge status={testimonial.moderationStatus} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (testimonial: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(testimonial.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (testimonial: any) => (
        <ModerationActions
          testimonialId={testimonial.id}
          currentStatus={testimonial.moderationStatus}
          testimonialContent={testimonial.content}
          authorName={testimonial.authorName}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Testimonials
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and moderate testimonials across all projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || !data || data.testimonials.length === 0 || exportMutation.isPending}
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          maxSelection={100}
          onApprove={() => handleBulkAction('APPROVED')}
          onReject={() => handleBulkAction('REJECTED')}
          onFlag={() => handleBulkAction('FLAGGED')}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by content or author..."
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FLAGGED">Flagged</option>
            </select>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          {(search || status || rating) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus('');
                setRating('');
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
            Failed to Load Testimonials
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(data.testimonials.length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {formatNumber(
                data.testimonials.filter((t) => t.moderationStatus === 'PENDING').length
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatNumber(
                data.testimonials.filter((t) => t.moderationStatus === 'APPROVED').length
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Flagged</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {formatNumber(
                data.testimonials.filter((t) => t.moderationStatus === 'FLAGGED').length
              )}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {data && !isLoading && (
        <DataTable
          data={data.testimonials}
          columns={columns}
          emptyMessage="No testimonials found"
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          maxSelection={100}
        />
      )}

      {/* Bulk Confirmation Dialog */}
      {bulkAction && (
        <BulkConfirmationDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          testimonialIds={Array.from(selectedIds)}
          action={bulkAction}
          onSuccess={handleBulkSuccess}
        />
      )}
    </div>
  );
}
