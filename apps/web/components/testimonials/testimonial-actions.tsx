import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
} from "lucide-react";
import type { ModerationStatus } from "@/types/api";

interface TestimonialActionsProps {
  testimonialId: string;
  moderationStatus?: ModerationStatus | null;
  isApproved?: boolean;
  isPublished?: boolean;
  loadingState?: { id: string; action: string } | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onDelete?: (id: string) => void;
  moderationMode?: boolean;
}

export function TestimonialActions({
  testimonialId,
  moderationStatus,
  isApproved,
  isPublished,
  loadingState,
  onApprove,
  onReject,
  onPublish,
  onUnpublish,
  onDelete,
  moderationMode = false,
}: TestimonialActionsProps) {
  const isLoading = loadingState?.id === testimonialId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {moderationMode ? (
          <>
            {/* Moderation actions */}
            {moderationStatus !== "APPROVED" && onApprove && (
              <DropdownMenuItem
                onClick={() => onApprove(testimonialId)}
                disabled={isLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-success" />
                Approve
              </DropdownMenuItem>
            )}
            {moderationStatus !== "REJECTED" && onReject && (
              <DropdownMenuItem
                onClick={() => onReject(testimonialId)}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                Reject
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            {/* Regular actions */}
            {moderationStatus && moderationStatus !== "PENDING" && (
              <>
                {isApproved && (
                  <>
                    {isPublished && onUnpublish && (
                      <DropdownMenuItem
                        onClick={() => onUnpublish(testimonialId)}
                        disabled={isLoading}
                      >
                        <EyeOff className="mr-2 h-4 w-4" />
                        Unpublish
                      </DropdownMenuItem>
                    )}
                    {!isPublished && onPublish && (
                      <DropdownMenuItem
                        onClick={() => onPublish(testimonialId)}
                        disabled={isLoading}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Delete action (always available) */}
        {onDelete && (
          <>
            {(onApprove || onReject || onPublish || onUnpublish) && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              onClick={() => onDelete(testimonialId)}
              disabled={isLoading}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
