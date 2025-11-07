"use client";

import { Badge } from "@workspace/ui/components/badge";
import { AlertTriangle, XCircle } from "lucide-react";
import type {
  StatusCounts,
  ModerationCounts,
} from "@/lib/testimonial-list-utils";

interface StatusHeaderProps {
  total: number;
  statusCounts: StatusCounts;
  moderationCounts: ModerationCounts;
}

export function StatusHeader({
  total,
  statusCounts,
  moderationCounts,
}: StatusHeaderProps) {
  return (
    <div className="flex items-center gap-4 pb-4 border-b flex-wrap">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="px-3 py-1 rounded-md border bg-muted/30"
        >
          {total} Total
        </Badge>
      </div>

      {statusCounts.pending > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground">
            {statusCounts.pending} Pending
          </span>
        </div>
      )}

      {statusCounts.approved > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-primary/30" />
          <span className="text-muted-foreground">
            {statusCounts.approved} Approved
          </span>
        </div>
      )}

      {statusCounts.published > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">
            {statusCounts.published} Published
          </span>
        </div>
      )}

      {moderationCounts.flagged > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-3 w-3 text-destructive/60" />
          <span className="text-muted-foreground">
            {moderationCounts.flagged} Flagged
          </span>
        </div>
      )}

      {moderationCounts.rejected > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <XCircle className="h-3 w-3 text-destructive/60" />
          <span className="text-muted-foreground">
            {moderationCounts.rejected} Rejected
          </span>
        </div>
      )}
    </div>
  );
}
