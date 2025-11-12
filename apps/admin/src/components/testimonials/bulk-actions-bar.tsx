'use client';

import { Button } from '@/components/ui/button';
import { Check, X, Flag } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  maxSelection: number;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  maxSelection,
  onApprove,
  onReject,
  onFlag,
  onClear,
  disabled = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} testimonial{selectedCount !== 1 ? 's' : ''} selected
            {selectedCount >= maxSelection && (
              <span className="text-blue-700 dark:text-blue-300 ml-2">
                (max {maxSelection})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={onApprove}
              disabled={disabled}
            >
              <Check className="h-4 w-4" />
              Approve All
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              Reject All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onFlag}
              disabled={disabled}
            >
              <Flag className="h-4 w-4" />
              Flag All
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={disabled}
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
}
