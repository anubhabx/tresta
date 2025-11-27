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
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{log.adminName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{log.adminEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(log.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Action</p>
                <Badge variant="outline">{log.actionType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Target</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{log.targetType}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {log.targetId}
                  </span>
                </div>
              </div>
            </div>

            {/* Request ID */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request ID (for Sentry correlation)
              </p>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1">
                  {log.requestId}
                </code>
                <button
                  onClick={copyRequestId}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Before Snapshot */}
            {log.beforeSnapshot && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Before
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(log.beforeSnapshot, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* After Snapshot */}
            {log.afterSnapshot && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  After
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-900 dark:text-gray-100">
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
