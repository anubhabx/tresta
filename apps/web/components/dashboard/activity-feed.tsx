"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  MessageSquare,
  Check,
  FolderPlus,
  XCircle,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import type { Project } from "@/types/api";

type ActivityType =
  | "testimonial_submitted"
  | "testimonial_approved"
  | "testimonial_rejected"
  | "project_created";

interface ActivityItem {
  id: string;
  type: ActivityType;
  projectName: string;
  projectSlug: string;
  authorName?: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  projects: Project[];
  maxItems?: number;
}

/**
 * Activity icon component with appropriate colors
 */
function ActivityIcon({ type }: { type: ActivityType }) {
  const config = {
    testimonial_submitted: {
      icon: MessageSquare,
      className: "bg-primary/10 text-primary",
    },
    testimonial_approved: {
      icon: Check,
      className: "bg-success/10 text-success",
    },
    testimonial_rejected: {
      icon: XCircle,
      className: "bg-destructive/10 text-destructive",
    },
    project_created: {
      icon: FolderPlus,
      className: "bg-warning/10 text-warning",
    },
  };

  const { icon: Icon, className } = config[type];

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

/**
 * Activity description based on type
 */
function ActivityDescription({ item }: { item: ActivityItem }) {
  switch (item.type) {
    case "testimonial_submitted":
      return (
        <>
          <strong className="font-medium text-foreground">
            {item.authorName || "Someone"}
          </strong>{" "}
          submitted a testimonial to{" "}
          <strong className="font-medium text-foreground">
            {item.projectName}
          </strong>
        </>
      );
    case "testimonial_approved":
      return (
        <>
          Testimonial approved in{" "}
          <strong className="font-medium text-foreground">
            {item.projectName}
          </strong>
        </>
      );
    case "testimonial_rejected":
      return (
        <>
          Testimonial rejected in{" "}
          <strong className="font-medium text-foreground">
            {item.projectName}
          </strong>
        </>
      );
    case "project_created":
      return (
        <>
          Created project{" "}
          <strong className="font-medium text-foreground">
            {item.projectName}
          </strong>
        </>
      );
    default:
      return null;
  }
}

/**
 * Activity Feed component for the dashboard
 * Shows recent activity across all projects
 *
 * Note: This generates activity items from project data.
 * In a full implementation, this would come from an activity log API.
 */
export function ActivityFeed({ projects, maxItems = 5 }: ActivityFeedProps) {
  // Generate activity items from projects
  // In production, this would come from an activity log API
  const activityItems: ActivityItem[] = projects
    .slice(0, maxItems)
    .map((project) => ({
      id: `project-created-${project.id}`,
      type: "project_created" as ActivityType,
      projectName: project.name,
      projectSlug: project.slug,
      timestamp: new Date(project.createdAt),
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  if (activityItems.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No recent activity yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear here as you use Tresta
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <ActivityIcon type={item.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">
                  <ActivityDescription item={item} />
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
