"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { BulkActionHistory } from "@/lib/testimonial-list-utils";

interface ActionHistoryPanelProps {
  history: BulkActionHistory[];
  showHistory: boolean;
  isPending: boolean;
  onToggleHistory: () => void;
  onUndo: (actionId: string) => void;
}

export function ActionHistoryPanel({
  history,
  showHistory,
  isPending,
  onToggleHistory,
  onUndo,
}: ActionHistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Recent Actions</h3>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleHistory}>
            {showHistory ? "Hide" : "Show"} History
          </Button>
        </div>

        {showHistory && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {action.action === "approve" && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    {action.action === "reject" && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {action.action === "flag" && (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {action.action}d {action.count} testimonial
                      {action.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(action.timestamp).toLocaleTimeString()} -{" "}
                    {new Date(action.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUndo(action.id)}
                  disabled={isPending}
                >
                  Undo
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
