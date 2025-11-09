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
    <Card>
      <CardHeader>
        <CardTitle>Collection URL</CardTitle>
        <CardDescription>
          Share this URL to collect testimonials from your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm truncate">
            {collectionUrl}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            <CopyIcon className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <a href={collectionUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Visit
            </Button>
          </a>
        </div>
        <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <LinkIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              Share this link with your customers
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Anyone with this link can submit a testimonial for your project.
              You can moderate submissions before they appear publicly.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
