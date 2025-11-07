"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Zap
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
  stats
}: ModerationStatsDashboardProps) {
  const total = stats.pending + stats.flagged + stats.approved + stats.rejected;

  return (
    <div className="flex items-center gap-4 pb-4 border-b flex-wrap">
      {/* Total */}
      <div className="flex items-center gap-2">
        <Badge
          variant={"outline"}
          className="px-3 py-1 rounded-md border bg-muted/30 text-xs"
        >
          {total} Total
        </Badge>
      </div>

      {/* Pending */}
      {stats.pending > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground">{stats.pending} Pending</span>
        </div>
      )}

      {/* Flagged */}
      {stats.flagged > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-3 w-3 text-destructive/60" />
          <span className="text-muted-foreground">{stats.flagged} Flagged</span>
        </div>
      )}

      {/* Approved */}
      {stats.approved > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-primary/30" />
          <span className="text-muted-foreground">
            {stats.approved} Approved
          </span>
        </div>
      )}

      {/* Rejected */}
      {stats.rejected > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <XCircle className="h-3 w-3 text-destructive/60" />
          <span className="text-muted-foreground">
            {stats.rejected} Rejected
          </span>
        </div>
      )}

      {/* OAuth Verified */}
      {stats.oauthVerified !== undefined && stats.oauthVerified > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-3 w-3 text-primary/60" />
          <span className="text-muted-foreground">
            {stats.oauthVerified} Verified
          </span>
        </div>
      )}

      {/* Auto-Moderated */}
      {stats.autoModerated !== undefined && stats.autoModerated > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-muted-foreground">
            {stats.autoModerated} Auto-Moderated
          </span>
        </div>
      )}
    </div>
  );
}
