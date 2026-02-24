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
        <div className="text-center text-muted-foreground">
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
            <h1 className="text-3xl font-bold text-foreground">
              {project.name}
            </h1>
            <p className="text-muted-foreground mt-1">/{project.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/projects/${projectId}/widgets`)}>
            Manage Widgets
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/projects/${projectId}/settings`)}>
            Settings
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Project Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Project ID</p>
            <p className="text-sm font-mono text-foreground mt-1">
              {project.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <div className="mt-1">
              <Badge variant="outline">{project.projectType}</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Visibility</p>
            <div className="mt-1">
              <Badge
                variant={project.visibility === 'PUBLIC' ? 'default' : 'secondary'}
              >
                {project.visibility}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="text-sm text-foreground mt-1">
              {project.owner.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {project.owner.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm text-foreground mt-1">
              {formatDate(project.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-sm text-foreground mt-1">
              {formatDate(project.updatedAt)}
            </p>
          </div>
        </div>
        {project.description && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm text-foreground mt-1">
              {project.description}
            </p>
          </div>
        )}
      </div>

      {/* Testimonial Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">
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
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recent Testimonials ({project.recentTestimonials.length})
        </h2>
        {project.recentTestimonials.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No testimonials yet
          </p>
        ) : (
          <div className="space-y-4">
            {project.recentTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
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
                    <p className="text-sm text-muted-foreground mt-2">
                      {testimonial.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Rating: {testimonial.rating}/5</span>
                      <span>{formatDate(testimonial.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {project.stats.testimonialCounts.total > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing {project.recentTestimonials.length} of {project.stats.testimonialCounts.total} testimonials
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
