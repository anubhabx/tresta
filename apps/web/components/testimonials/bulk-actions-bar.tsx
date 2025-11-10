"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { KeyboardShortcutBadge } from "../keyboard-shortcut-badge";

interface BulkActionsBarProps {
  selectedCount: number;
  validForApprove: number;
  validForReject: number;
  validForFlag: number;
  isPending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  validForApprove,
  validForReject,
  validForFlag,
  isPending,
  onApprove,
  onReject,
  onFlag,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 slide-out-to-bottom-4 w-[95%] sm:w-[90%] max-w-3xl">
      <Card className="shadow-2xl border-2">
        <CardContent className="p-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Selection Count */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-sm sm:text-base font-semibold w-10 sm:w-12 justify-center"
                >
                  {selectedCount}
                </Badge>
                <span className="text-xs sm:text-sm font-medium">selected</span>
              </div>
              {/* Clear button on mobile */}
              <Button
                onClick={onClear}
                size="sm"
                variant="ghost"
                className="sm:hidden text-xs"
              >
                Clear
              </Button>
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-border" />
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Button
                        onClick={onApprove}
                        disabled={isPending || validForApprove === 0}
                        size="sm"
                        variant="default"
                        className="bg-green-500 hover:bg-green-600 w-full flex items-center justify-center gap-1 sm:gap-2 touch-manipulation min-h-[44px] sm:min-h-0"
                      >
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Approve</span>
                          {validForApprove > 0 &&
                            validForApprove < selectedCount && (
                              <span className="ml-1 text-xs opacity-75">
                                ({validForApprove})
                              </span>
                            )}
                        </div>
                        <KeyboardShortcutBadge shortcut="A" className="hidden sm:flex" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {validForApprove === 0 && (
                    <TooltipContent>
                      <p className="text-xs">
                        All selected testimonials are already approved
                      </p>
                    </TooltipContent>
                  )}
                  {validForApprove > 0 && validForApprove < selectedCount && (
                    <TooltipContent>
                      <p className="text-xs">
                        {validForApprove} can be approved,{" "}
                        {selectedCount - validForApprove} already approved
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Button
                        onClick={onFlag}
                        disabled={isPending || validForFlag === 0}
                        size="sm"
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-1 sm:gap-2 touch-manipulation min-h-[44px] sm:min-h-0"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Flag</span>
                          {validForFlag > 0 && validForFlag < selectedCount && (
                            <span className="ml-1 text-xs opacity-75">
                              ({validForFlag})
                            </span>
                          )}
                        </div>
                        <KeyboardShortcutBadge shortcut="F" className="hidden sm:flex" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {validForFlag === 0 && (
                    <TooltipContent>
                      <p className="text-xs">
                        All selected testimonials are already flagged
                      </p>
                    </TooltipContent>
                  )}
                  {validForFlag > 0 && validForFlag < selectedCount && (
                    <TooltipContent>
                      <p className="text-xs">
                        {validForFlag} can be flagged,{" "}
                        {selectedCount - validForFlag} already flagged
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Button
                        onClick={onReject}
                        disabled={isPending || validForReject === 0}
                        size="sm"
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-1 sm:gap-2 touch-manipulation min-h-[44px] sm:min-h-0"
                      >
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Reject</span>
                          {validForReject > 0 &&
                            validForReject < selectedCount && (
                              <span className="ml-1 text-xs opacity-75">
                                ({validForReject})
                              </span>
                            )}
                        </div>
                        <KeyboardShortcutBadge shortcut="R" className="hidden sm:flex" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {validForReject === 0 && (
                    <TooltipContent>
                      <p className="text-xs">
                        All selected testimonials are already rejected
                      </p>
                    </TooltipContent>
                  )}
                  {validForReject > 0 && validForReject < selectedCount && (
                    <TooltipContent>
                      <p className="text-xs">
                        {validForReject} can be rejected,{" "}
                        {selectedCount - validForReject} already rejected
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-border" />
            
            {/* Clear button - desktop only */}
            <Button
              onClick={onClear}
              size="sm"
              variant="ghost"
              className="hidden sm:flex items-center gap-2"
            >
              Clear
              <KeyboardShortcutBadge shortcut="X" className="sm:inline-flex" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
