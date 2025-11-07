import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle, Shield, AlertTriangle, XCircle } from "lucide-react";
import type { ModerationStatus } from "@/types/api";

interface StatusBadgeProps {
  moderationStatus?: ModerationStatus | null;
  isApproved?: boolean;
  isPublished?: boolean;
  moderationFlags?: string[];
  variant?: "simple" | "detailed";
}

export function StatusBadge({
  moderationStatus,
  isApproved,
  isPublished,
  moderationFlags,
  variant = "simple",
}: StatusBadgeProps) {
  // Show published status first if applicable
  if (isPublished) {
    return (
      <Badge variant="outline">
        <CheckCircle className="h-3 w-3 mr-1" />
        Published
      </Badge>
    );
  }

  // Show moderation status
  if (!moderationStatus) {
    if (isApproved) {
      return (
        <Badge variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Pending
      </Badge>
    );
  }

  switch (moderationStatus) {
    case "APPROVED":
      return (
        <Badge variant="outline">
          <Shield className="h-3 w-3 mr-1" />
          Moderated
        </Badge>
      );

    case "FLAGGED":
      if (
        variant === "detailed" &&
        moderationFlags &&
        moderationFlags.length > 0
      ) {
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Flagged
            </Badge>
            <div className="p-2 rounded-md bg-muted/50 border text-xs">
              <p className="font-medium mb-1">Issues:</p>
              <ul className="space-y-0.5">
                {moderationFlags.slice(0, 3).map((flag: string, i: number) => (
                  <li key={i} className="text-muted-foreground">
                    • {flag}
                  </li>
                ))}
                {moderationFlags.length > 3 && (
                  <li className="text-muted-foreground">
                    +{moderationFlags.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          </div>
        );
      }
      return (
        <Badge
          variant="outline"
          className="border-destructive/30 text-destructive"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Flagged
        </Badge>
      );

    case "REJECTED":
      if (
        variant === "detailed" &&
        moderationFlags &&
        moderationFlags.length > 0
      ) {
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
            <div className="p-2 rounded-md bg-muted/50 border text-xs">
              <p className="font-medium mb-1">Reasons:</p>
              <ul className="space-y-0.5">
                {moderationFlags.slice(0, 3).map((flag: string, i: number) => (
                  <li key={i} className="text-muted-foreground">
                    • {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }
      return (
        <Badge
          variant="outline"
          className="border-destructive/30 text-destructive"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );

    case "PENDING":
    default:
      return null;
  }
}
