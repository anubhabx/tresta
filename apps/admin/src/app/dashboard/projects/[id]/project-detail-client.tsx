'use client';

import { useProject } from '@/lib/hooks/use-projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

interface ProjectDetailClientProps {
  projectId: string;
}

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const router = useRouter();
  const { data: project, isLoading, error, refetch } = useProject(projectId);

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
            Failed to Load Project
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

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center text-gray-600 dark:text-gray-400">
          Project not found
        </div>
      </div>
    );
  }

  const statusCounts = project.stats.testimonialCounts;

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
              {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">/{project.slug}</p>
          </div>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Project Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Project Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Project ID</p>
            <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1">
              {project.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
            <div className="mt-1">
              <Badge variant="outline">{project.type}</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
            <div className="mt-1">
              <Badge
                variant={project.visibility === 'PUBLIC' ? 'default' : 'secondary'}
              >
                {project.visibility}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Owner</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {project.owner.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {project.owner.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {formatDate(project.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {formatDate(project.updatedAt)}
            </p>
          </div>
        </div>
        {project.description && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {project.description}
            </p>
          </div>
        )}
      </div>

      {/* Testimonial Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {formatNumber(project.stats.testimonialCounts.total)}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
            {formatNumber(statusCounts.pending)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
          <p className="text-sm text-green-700 dark:text-green-400">Approved</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {formatNumber(statusCounts.approved)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
          <p className="text-sm text-red-700 dark:text-red-400">Rejected</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
            {formatNumber(statusCounts.rejected)}
          </p>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Testimonials ({project.recentTestimonials.length})
        </h2>
        {project.recentTestimonials.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No testimonials yet
          </p>
        ) : (
          <div className="space-y-4">
            {project.recentTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {testimonial.authorName}
                      </p>
                      <Badge
                        variant={
                          testimonial.moderationStatus === 'APPROVED'
                            ? 'default'
                            : testimonial.moderationStatus === 'PENDING'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {testimonial.moderationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {testimonial.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Rating: {testimonial.rating}/5</span>
                      <span>{formatDate(testimonial.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {project.stats.testimonialCounts.total > 10 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Showing {project.recentTestimonials.length} of {project.stats.testimonialCounts.total} testimonials
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
