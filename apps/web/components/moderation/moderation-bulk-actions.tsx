/**
 * Moderation Bulk Actions Bar
 * Actions for selected testimonials in bulk
 */

"use client";

import { Button } from "@workspace/ui/components/button";
import { CheckCircle, Flag, XCircle } from "lucide-react";

interface ModerationBulkActionsProps {
  selectedCount: number;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onFlagAll: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function ModerationBulkActions({
  selectedCount,
  onApproveAll,
  onRejectAll,
  onFlagAll,
  onClearSelection,
  isLoading = false,
}: ModerationBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {selectedCount} testimonial{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={isLoading}>
            Clear Selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onApproveAll}
            disabled={isLoading}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRejectAll}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFlagAll}
            disabled={isLoading}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
          >
            <Flag className="h-4 w-4 mr-1" />
            Flag All
          </Button>
        </div>
      </div>
    </div>
  );
}
