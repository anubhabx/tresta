"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Zap,
} from "lucide-react";

interface ModerationStats {
  pending: number;
  flagged: number;
  approved: number;
  rejected: number;
  oauthVerified?: number;
  autoModerated?: number;
}

interface ModerationStatsDashboardProps {
  stats: ModerationStats;
}

export function ModerationStatsDashboard({
  stats,
}: ModerationStatsDashboardProps) {
  const total = stats.pending + stats.flagged + stats.approved + stats.rejected;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b">
      {/* Total */}
      <div className="flex items-center gap-2">
        <Badge
          variant={"outline"}
          className="px-3 py-1.5 sm:py-1 rounded-md border bg-muted/30 text-xs sm:text-sm font-semibold"
        >
          {total} Total
        </Badge>
      </div>

      {/* Stats Grid - Mobile: 2 columns, Desktop: horizontal */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 flex-1">
        {/* Pending */}
        {stats.pending > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {stats.pending} Pending
            </span>
          </div>
        )}

        {/* Flagged */}
        {stats.flagged > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <AlertTriangle className="h-3 w-3 text-destructive/60 flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {stats.flagged} Flagged
            </span>
          </div>
        )}

        {/* Approved */}
        {stats.approved > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="h-2 w-2 rounded-full bg-primary/30 flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {stats.approved} Approved
            </span>
          </div>
        )}

        {/* Rejected */}
        {stats.rejected > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <XCircle className="h-3 w-3 text-destructive/60 flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {stats.rejected} Rejected
            </span>
          </div>
        )}

        {/* OAuth Verified */}
        {stats.oauthVerified !== undefined && stats.oauthVerified > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Shield className="h-3 w-3 text-primary/60 flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {stats.oauthVerified} Verified
            </span>
          </div>
        )}

        {/* Auto-Moderated */}
        {stats.autoModerated !== undefined && stats.autoModerated > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Zap className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {stats.autoModerated} Auto-Moderated
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
