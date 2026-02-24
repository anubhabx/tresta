'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { AuditLog } from '@/lib/hooks/use-audit-logs';

interface AuditDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

export function AuditDetailModal({ open, onOpenChange, log }: AuditDetailModalProps) {
  if (!log) return null;

  const copyRequestId = () => {
    navigator.clipboard.writeText(log.requestId);
    toast.success('Request ID copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin</p>
                <p className="text-sm text-foreground">{log.adminName}</p>
                <p className="text-xs text-muted-foreground">{log.adminEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p className="text-sm text-foreground">
                  {formatDate(log.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Action</p>
                <Badge variant="outline">{log.actionType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{log.targetType}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {log.targetId}
                  </span>
                </div>
              </div>
            </div>

            {/* Request ID */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Request ID (for Sentry correlation)
              </p>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                <code className="text-sm font-mono text-foreground flex-1">
                  {log.requestId}
                </code>
                <button
                  onClick={copyRequestId}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Before Snapshot */}
            {log.beforeSnapshot && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Before
                </p>
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-foreground">
                    {JSON.stringify(log.beforeSnapshot, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* After Snapshot */}
            {log.afterSnapshot && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  After
                </p>
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-foreground">
                    {JSON.stringify(log.afterSnapshot, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
