'use client';

import { useUser } from '@/lib/hooks/use-users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Download, Loader2 } from 'lucide-react';
import { formatDate, formatNumber, formatRelativeTime } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserDetailClientProps {
  userId: string;
}

export function UserDetailClient({ userId }: UserDetailClientProps) {
  const router = useRouter();
  const { data: user, isLoading, error, refetch } = useUser(userId);
  
  const handleExport = () => {
    toast.info('Export functionality not yet implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Failed to Load User
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="destructive" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center text-gray-600 dark:text-gray-400">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          User Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
            <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
              {user.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
            <div className="mt-1">
              <Badge variant={user.plan === 'PRO' ? 'default' : 'secondary'}>
                {user.plan}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(user.stats.projectCount)} projects
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Testimonials</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {formatNumber(user.stats.testimonialCount)} testimonials
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {user.lastLogin ? (
                <span title={formatDate(user.lastLogin)}>
                  {formatRelativeTime(user.lastLogin)}
                </span>
              ) : (
                'Never'
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Projects ({user.projects.length})
        </h2>
        {user.projects.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No projects yet
          </p>
        ) : (
          <div className="space-y-4">
            {user.projects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      /{project.slug}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total: {formatNumber(project.testimonialCounts.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Pending: {formatNumber(project.testimonialCounts.pending)}
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    Approved: {formatNumber(project.testimonialCounts.approved)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
