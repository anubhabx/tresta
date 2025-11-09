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
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Collection URL</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Share this URL to collect testimonials from your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-xs sm:text-sm truncate">
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
        <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-100/50 dark:bg-blue-900/20 border border-border/50 rounded-lg">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
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
  );
}
