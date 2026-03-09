"use client";

import { Card } from "@workspace/ui/components/card";
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
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
  }>;
  maxItems?: number;
}

const notificationTypeToActivityType: Record<string, ActivityType> = {
  NEW_TESTIMONIAL: "testimonial_submitted",
  TESTIMONIAL_APPROVED: "testimonial_approved",
  TESTIMONIAL_REJECTED: "testimonial_rejected",
};

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

export function ActivityFeed({
  projects,
  notifications,
  maxItems = 5,
}: ActivityFeedProps) {
  const notificationActivityItems: ActivityItem[] = (notifications ?? [])
    .map((notification) => ({
      id: notification.id,
      type: notificationTypeToActivityType[notification.type],
      projectName: "your project",
      projectSlug: "",
      timestamp: new Date(notification.createdAt),
    }))
    .filter((item): item is ActivityItem => Boolean(item.type));

  const fallbackProjectActivityItems: ActivityItem[] = projects
    .slice(0, maxItems)
    .map((project) => ({
      id: `project-created-${project.id}`,
      type: "project_created" as ActivityType,
      projectName: project.name,
      projectSlug: project.slug,
      timestamp: new Date(project.createdAt),
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const activityItems: ActivityItem[] =
    notificationActivityItems.length > 0
      ? notificationActivityItems
      : fallbackProjectActivityItems;

  const visibleItems = activityItems
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  if (visibleItems.length === 0) {
    return (
      <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5 flex-1 min-h-[300px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Recent Activity
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Activity className="h-8 w-8 text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-400">No recent activity yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Activity will appear here as you use Tresta
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5 flex-1 min-h-[300px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {visibleItems.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4 z-10">
            <div className="relative z-10 -ml-[11px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center bg-background rounded-full border border-white/10 shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)]">
              <ActivityIcon type={item.type} />
            </div>
            {/* Added left padding to account for the line and icon so text aligns nicely */}
            <div className="flex-1 min-w-0 md:ml-[calc(50%+24px)] pl-4 md:pl-0">
              <p className="text-sm text-zinc-300">
                <ActivityDescription item={item} />
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
