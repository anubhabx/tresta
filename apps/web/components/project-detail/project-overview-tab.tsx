"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CopyIcon, ExternalLinkIcon, LinkIcon } from "lucide-react";
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
              <a href={collectionUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
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
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-100/50 dark:bg-blue-900/20 border border-border/50 rounded-lg">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-500" />
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

      {/* Project Details Card */}
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Project Details</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Information about your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 sm:space-y-4">
            {project.shortDescription && (
              <div>
                <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Short Description
                </dt>
                <dd className="text-xs sm:text-sm">{project.shortDescription}</dd>
              </div>
            )}
            
            {project.websiteUrl && (
              <div>
                <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Website
                </dt>
                <dd className="text-xs sm:text-sm">
                  <a 
                    href={project.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {project.websiteUrl}
                  </a>
                </dd>
              </div>
            )}

            {project.projectType && (
              <div>
                <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Project Type
                </dt>
                <dd className="text-xs sm:text-sm capitalize">{project.projectType.toLowerCase()}</dd>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div>
                <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  Tags
                </dt>
                <dd className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-muted rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                Visibility
              </dt>
              <dd className="text-xs sm:text-sm capitalize">{project.visibility.toLowerCase()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Auto-Moderation Settings Card */}
      {(project.autoModeration || project.autoApproveVerified) && (
        <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Auto-Moderation</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Automated moderation settings for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 sm:space-y-4">
              {project.autoModeration && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Auto-Moderation
                  </dt>
                  <dd className="text-xs sm:text-sm text-green-600 dark:text-green-500">
                    Enabled
                  </dd>
                </div>
              )}

              {project.autoApproveVerified && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Auto-Approve Verified Users
                  </dt>
                  <dd className="text-xs sm:text-sm text-green-600 dark:text-green-500">
                    Enabled
                  </dd>
                </div>
              )}

              {project.profanityFilterLevel && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Profanity Filter Level
                  </dt>
                  <dd className="text-xs sm:text-sm capitalize">
                    {project.profanityFilterLevel.toLowerCase()}
                  </dd>
                </div>
              )}

              {project.moderationSettings?.minContentLength && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Minimum Content Length
                  </dt>
                  <dd className="text-xs sm:text-sm">
                    {project.moderationSettings.minContentLength} characters
                  </dd>
                </div>
              )}

              {project.moderationSettings?.maxUrlCount !== undefined && (
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Maximum URLs Allowed
                  </dt>
                  <dd className="text-xs sm:text-sm">
                    {project.moderationSettings.maxUrlCount}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
