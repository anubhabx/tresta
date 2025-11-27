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
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { ErrorLog } from '@/lib/hooks/use-error-logs';

interface ErrorDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: ErrorLog | null;
}

export function ErrorDetailModal({ open, onOpenChange, error }: ErrorDetailModalProps) {
  if (!error) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const severityVariants = {
    LOW: 'secondary' as const,
    MEDIUM: 'warning' as const,
    HIGH: 'destructive' as const,
    CRITICAL: 'destructive' as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Error Details</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity</p>
                <Badge variant={severityVariants[error.severity]}>{error.severity}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
                <Badge variant="outline">{error.type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(error.createdAt)}
                </p>
              </div>
              {error.userId && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Affected User
                  </p>
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {error.userId}
                  </p>
                </div>
              )}
              {error.requestPath && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Request Path
                  </p>
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {error.requestPath}
                  </p>
                </div>
              )}
            </div>

            {/* Request ID */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request ID
              </p>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1">
                  {error.requestId}
                </code>
                <button
                  onClick={() => copyToClipboard(error.requestId, 'Request ID')}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sentry Event ID */}
            {error.sentryId && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sentry Event ID
                </p>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1">
                    {error.sentryId}
                  </code>
                  <button
                    onClick={() => copyToClipboard(error.sentryId!, 'Sentry Event ID')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={`https://sentry.io/organizations/your-org/issues/?query=${error.sentryId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Error Message */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Error Message
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-900 dark:text-red-100">{error.message}</p>
              </div>
            </div>

            {/* Stacktrace */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stacktrace
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                <pre className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {error.stacktrace}
                </pre>
              </div>
            </div>

            {/* Metadata */}
            {error.metadata && Object.keys(error.metadata).length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Context
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(error.metadata, null, 2)}
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
