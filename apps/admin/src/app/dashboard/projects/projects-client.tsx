'use client';

import { useState } from 'react';
import { useProjects } from '@/lib/hooks/use-projects';
import { DataTable } from '@/components/tables/data-table';
import { TableSearch } from '@/components/tables/table-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

export function ProjectsClient() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [visibility, setVisibility] = useState('');

  const params = {
    ...(search && { search }),
    ...(type && { type }),
    ...(visibility && { visibility }),
  };

  const { data, isLoading, error, refetch } = useProjects(
    Object.keys(params).length > 0 ? params : undefined
  );

  const columns = [
    {
      key: 'name',
      header: 'Project',
      render: (project: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {project.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            /{project.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (project: any) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {project.owner.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {project.owner.email}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (project: any) => (
        <Badge variant="outline">{project.projectType}</Badge>
      ),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (project: any) => (
        <Badge variant={project.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
          {project.visibility}
        </Badge>
      ),
    },
    {
      key: 'testimonials',
      header: 'Testimonials',
      render: (project: any) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-gray-100">
            Total: {formatNumber(project.testimonialCounts.total)}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Pending: {formatNumber(project.testimonialCounts.pending)} | Approved:{' '}
            {formatNumber(project.testimonialCounts.approved)}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (project: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(project.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor all projects
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
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name or owner..."
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="SAAS_APP">SaaS App</option>
              <option value="PORTFOLIO">Portfolio</option>
              <option value="ECOMMERCE">E-commerce</option>
              <option value="COURSE">Course</option>
              <option value="AGENCY">Agency</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Visibility</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="INVITE_ONLY">Invite Only</option>
            </select>
          </div>
          {(search || type || visibility) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setType('');
                setVisibility('');
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
            Failed to Load Projects
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(data.projects.length)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Public Projects
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(
                data.projects.filter((p) => p.visibility === 'PUBLIC').length
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Testimonials
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(
                data.projects.reduce((sum, p) => sum + p.testimonialsCount, 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {data && !isLoading && (
        <DataTable
          data={data.projects}
          columns={columns}
          onRowClick={(project) => router.push(`/dashboard/projects/${project.id}`)}
          emptyMessage="No projects found"
        />
      )}
    </div>
  );
}
