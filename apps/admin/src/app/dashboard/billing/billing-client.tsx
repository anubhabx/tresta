'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/tables/data-table';
import { TableSearch } from '@/components/tables/table-search';
import { useBillingOverview, useBillingRecords, type BillingRecord } from '@/lib/hooks/use-billing';
import { usePlans } from '@/lib/hooks/use-plans';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { Filter, RefreshCw } from 'lucide-react';

const formatMoney = (amount: number | null, currency: string | null): string => {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }

  const ccy = currency || 'INR';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: ccy,
  }).format(amount / 100);
};

const getStatusBadgeVariant = (
  paymentStatus?: string | null,
  invoiceStatus?: string | null,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const normalized = (paymentStatus || invoiceStatus || '').toLowerCase();

  if (normalized === 'captured' || normalized === 'paid') {
    return 'default';
  }

  if (normalized === 'failed' || normalized === 'expired') {
    return 'destructive';
  }

  if (normalized === 'authorized' || normalized === 'partially_paid') {
    return 'secondary';
  }

  return 'outline';
};

export function BillingClient() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [planId, setPlanId] = useState('');

  const filters = {
    ...(search && { search }),
    ...(status && { status }),
    ...(planId && { planId }),
    limit: 50,
  };

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useBillingOverview();
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useBillingRecords(filters);
  const { plans } = usePlans();

  const columns: DataTableColumn<BillingRecord>[] = useMemo(
    () => [
      {
        key: 'user',
        header: 'User',
        render: (record) => (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {record.user.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{record.user.email}</div>
          </div>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        render: (record) => (
          <div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {record.plan?.name || record.user.currentPlan}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {record.plan ? `${record.plan.interval} • ${record.plan.type}` : 'No linked paid plan'}
            </div>
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (record) => (
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatMoney(record.payment.amount, record.payment.currency)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (record) => {
          const statusLabel = record.payment.paymentStatus || record.payment.invoiceStatus || 'unknown';
          return (
            <Badge
              variant={getStatusBadgeVariant(
                record.payment.paymentStatus,
                record.payment.invoiceStatus,
              )}
            >
              {statusLabel}
            </Badge>
          );
        },
      },
      {
        key: 'event',
        header: 'Event',
        render: (record) => (
          <div>
            <div className="text-sm text-gray-900 dark:text-gray-100">{record.payment.eventType}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {record.payment.eventCreatedAt ? formatDate(record.payment.eventCreatedAt) : 'N/A'}
            </div>
          </div>
        ),
      },
      {
        key: 'ids',
        header: 'Provider IDs',
        render: (record) => (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Pay: <span className="text-gray-700 dark:text-gray-300">{record.payment.paymentId || '—'}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Inv: <span className="text-gray-700 dark:text-gray-300">{record.payment.invoiceId || '—'}</span>
            </div>
          </div>
        ),
      },
    ],
    [],
  );

  const isLoading = overviewLoading || recordsLoading;
  const hasError = overviewError || recordsError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Billing</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Compact view of subscriptions, plans, and payment activity
          </p>
        </div>
        <Button
          onClick={() => {
            void refetchOverview();
            void refetchRecords();
          }}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {overview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Subs</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(overview.subscriptions.active)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Past Due</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatNumber(overview.subscriptions.pastDue)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Paused</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(overview.subscriptions.paused)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Canceled</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {formatNumber(overview.subscriptions.canceled)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Payments</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(overview.payments.successCount)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {formatNumber(overview.payments.failedCount)}
            </p>
          </div>
        </div>
      )}

      {overview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Gross Collected</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatMoney(overview.payments.grossCollected, overview.payments.currencyHint)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Collected Last 30 Days</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatMoney(
                overview.payments.grossCollectedLast30Days,
                overview.payments.currencyHint,
              )}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by user name/email..."
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All statuses</option>
              <option value="captured">Captured</option>
              <option value="authorized">Authorized</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially paid</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
          {(search || status || planId) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPlanId('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
            Failed to Load Billing Data
          </h3>
          <p className="mb-4 text-sm text-red-700 dark:text-red-300">
            {overviewError instanceof Error
              ? overviewError.message
              : recordsError instanceof Error
                ? recordsError.message
                : 'An error occurred'}
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              void refetchOverview();
              void refetchRecords();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && recordsData && (
        <div className="space-y-3">
          <DataTable
            data={recordsData.records}
            columns={columns}
            emptyMessage="No billing records found"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {formatNumber(recordsData.records.length)} records
            {recordsData.hasMore ? ' (more available; refine filters to narrow down)' : ''}.
          </p>
        </div>
      )}
    </div>
  );
}
