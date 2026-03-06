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
      <div className="relative group">
        <Card className="relative backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-lg sm:text-xl text-white">
              Share Collection Link
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Send this link to your customers to start collecting testimonials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 p-3.5 border border-white/10 rounded-lg flex items-center overflow-hidden">
                <span className="font-mono text-sm text-foreground truncate select-all">
                  {collectionUrl}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleCopyUrl}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all h-12 px-6"
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" asChild className="h-12 w-12 p-0">
                  <a
                    href={collectionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="h-5 w-5" />
                    <span className="sr-only">Visit</span>
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-white/10 rounded-lg">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Ready to receive submissions
                </p>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                  Anyone with this link can submit a testimonial. You'll be able
                  to review and approve all submissions before they become
                  visible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Next Steps */}
      <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/5 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-zinc-400">
            Common tasks for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!hasTestimonials && (
              <div className="p-4 border border-white/5 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">
                      No testimonials yet
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share your collection URL to start gathering testimonials
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="w-full text-foreground transition-colors"
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy Collection URL
                </Button>
              </div>
            )}

            {!hasWidgets && (
              <div className="p-4 border border-white/5 rounded-lg ">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">
                      Create a widget
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Display testimonials on your website
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full transition-colors"
                >
                  <a href={`/projects/${project.slug}?tab=widgets`}>
                    Go to Widgets
                  </a>
                </Button>
              </div>
            )}

            {hasTestimonials && (
              <div className="p-4 border border-white/5 rounded-lg ">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">
                      Review testimonials
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Moderate and approve submissions
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full transition-colors"
                >
                  <a href={`/projects/${project.slug}?tab=moderation`}>
                    Go to Moderation
                  </a>
                </Button>
              </div>
            )}

            {hasWidgets && (
              <div className="p-4 border border-white/5 rounded-lg ">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">
                      Manage widgets
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Edit or create new display widgets
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full transition-colors"
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
        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/5 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Auto-Moderation Active
            </CardTitle>
            <CardDescription>
              Automated moderation is helping protect your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.autoModeration && (
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs uppercase tracking-wider"
                  >
                    Enabled
                  </Badge>
                  <span className="text-zinc-400">
                    AI-powered content moderation
                  </span>
                </div>
              )}
              {project.autoApproveVerified && (
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs uppercase tracking-wider"
                  >
                    Enabled
                  </Badge>
                  <span className="text-zinc-400">
                    Auto-approve verified users
                  </span>
                </div>
              )}
              {project.profanityFilterLevel && (
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs uppercase tracking-wider px-2"
                  >
                    {project.profanityFilterLevel}
                  </Badge>
                  <span className="text-zinc-400">Profanity filter level</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
