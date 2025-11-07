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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 slide-out-to-bottom-4 w-[90%] max-w-3xl">
      <Card className="shadow-2xl border-2">
        <CardContent className="px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-base font-semibold w-12"
              >
                {selectedCount}
              </Badge>
              <span className="text-sm font-medium">selected</span>
            </div>
            <div className="h-6 w-px bg-border" />
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
                        className="bg-green-500 hover:bg-green-600 w-full flex items-center justify-center gap-2"
                      >
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                          {validForApprove > 0 &&
                            validForApprove < selectedCount && (
                              <span className="ml-1 text-xs opacity-75">
                                ({validForApprove})
                              </span>
                            )}
                        </div>
                        <KeyboardShortcutBadge shortcut="A" />
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
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Flag
                          {validForFlag > 0 && validForFlag < selectedCount && (
                            <span className="ml-1 text-xs opacity-75">
                              ({validForFlag})
                            </span>
                          )}
                        </div>
                        <KeyboardShortcutBadge shortcut="F" />
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
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                          {validForReject > 0 &&
                            validForReject < selectedCount && (
                              <span className="ml-1 text-xs opacity-75">
                                ({validForReject})
                              </span>
                            )}
                        </div>
                        <KeyboardShortcutBadge shortcut="R" />
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
            <div className="h-6 w-px bg-border" />
            <Button
              onClick={onClear}
              size="sm"
              variant="ghost"
              className="flex items-center gap-2"
            >
              Clear
              <KeyboardShortcutBadge shortcut="X" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
