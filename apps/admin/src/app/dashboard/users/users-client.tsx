'use client';

import { useMemo, useState } from 'react';
import { useUsers, type User } from '@/lib/hooks/use-users';
import { DataTable, type DataTableColumn } from '@/components/tables/data-table';
import { TableSearch } from '@/components/tables/table-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

export function UsersClient() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');

  const params = {
    ...(search && { search }),
    ...(plan && { plan }),
  };

  const { data, isLoading, error, refetch } = useUsers(
    Object.keys(params).length > 0 ? params : undefined,
  );

  const columns: DataTableColumn<User>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (user) => (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        render: (user) => (
          <Badge variant={user.plan === 'PRO' ? 'default' : 'secondary'}>
            {user.plan}
          </Badge>
        ),
      },
      {
        key: 'projects',
        header: 'Projects',
        render: (user) => (
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {formatNumber(user.projectCount)}
          </span>
        ),
      },
      {
        key: 'testimonials',
        header: 'Testimonials',
        render: (user) => (
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {formatNumber(user.testimonialCount)}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        header: 'Last Login',
        render: (user) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
          </span>
        ),
      },
      {
        key: 'joinedAt',
        header: 'Joined',
        render: (user) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(user.joinedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor user accounts
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
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name or email..."
            />
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Plans</option>
              <option value="FREE">Free</option>
              <option value="PRO">Pro</option>
            </select>
          </div>
          {(search || plan) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setPlan('');
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
            Failed to Load Users
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(data.users.length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Free Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(data.users.filter((u) => u.plan === 'FREE').length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pro Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(data.users.filter((u) => u.plan === 'PRO').length)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {data && !isLoading && (
        <DataTable
          data={data.users}
          columns={columns}
          onRowClick={(user) => router.push(`/dashboard/users/${user.id}`)}
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}
