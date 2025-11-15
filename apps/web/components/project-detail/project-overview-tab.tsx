"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  CopyIcon,
  ExternalLinkIcon,
  LinkIcon,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/api";

interface ProjectOverviewTabProps {
  project: Project;
  collectionUrl: string;
}

export function ProjectOverviewTab({
  project,
  collectionUrl,
}: ProjectOverviewTabProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(collectionUrl);
    toast.success("Collection URL copied to clipboard!");
  };

  // Calculate stats
  const totalTestimonials = project._count?.testimonials || 0;
  const totalWidgets = project._count?.widgets || 0;
  const hasTestimonials = totalTestimonials > 0;
  const hasWidgets = totalWidgets > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Collection URL Card */}
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Collection URL</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Share this URL to collect testimonials from your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-xs break-all">
              {collectionUrl}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex-1 sm:flex-none touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <a
                href={collectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Visit
                </Button>
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-info-highlight-bg border border-border/50 rounded-lg">
            <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
              <LinkIcon className="h-4 w-4 text-primary dark:text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium">
                Share this link with your customers
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Anyone with this link can submit a testimonial for your project.
                You can moderate submissions before they appear publicly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions / Next Steps */}
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Common tasks for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!hasTestimonials && (
              <div className="p-3 sm:p-4 border border-border/50 rounded-lg bg-warning-muted">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium">No testimonials yet</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share your collection URL to start gathering testimonials
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="w-full mt-2 touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy Collection URL
                </Button>
              </div>
            )}

            {!hasWidgets && (
              <div className="p-3 sm:p-4 border border-border/50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium">Create a widget</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Display testimonials on your website
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full mt-2 touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  <a href={`/projects/${project.slug}?tab=widgets`}>
                    Go to Widgets
                  </a>
                </Button>
              </div>
            )}

            {hasTestimonials && (
              <div className="p-3 sm:p-4 border border-border/50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium">Review testimonials</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Moderate and approve submissions
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full mt-2 touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  <a href={`/projects/${project.slug}?tab=moderation`}>
                    Go to Moderation
                  </a>
                </Button>
              </div>
            )}

            {hasWidgets && (
              <div className="p-3 sm:p-4 border border-border/50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium">Manage widgets</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Edit or create new display widgets
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full mt-2 touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  <a href={`/projects/${project.slug}?tab=widgets`}>
                    Go to Widgets
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Moderation Info (if enabled) */}
      {(project.autoModeration || project.autoApproveVerified) && (
        <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Auto-Moderation Active
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Automated moderation is helping protect your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.autoModeration && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Badge variant="secondary" className="text-xs">Enabled</Badge>
                  <span className="text-muted-foreground">AI-powered content moderation</span>
                </div>
              )}
              {project.autoApproveVerified && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Badge variant="secondary" className="text-xs">Enabled</Badge>
                  <span className="text-muted-foreground">Auto-approve verified users</span>
                </div>
              )}
              {project.profanityFilterLevel && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {project.profanityFilterLevel.toLowerCase()}
                  </Badge>
                  <span className="text-muted-foreground">Profanity filter level</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
