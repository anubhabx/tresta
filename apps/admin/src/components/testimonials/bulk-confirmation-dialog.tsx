'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBulkUpdateTestimonials } from '@/lib/hooks/use-testimonials';
import { RefreshCw } from 'lucide-react';

interface BulkConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonialIds: string[];
  action: 'APPROVED' | 'REJECTED' | 'FLAGGED';
  onSuccess: () => void;
}

export function BulkConfirmationDialog({
  open,
  onOpenChange,
  testimonialIds,
  action,
  onSuccess,
}: BulkConfirmationDialogProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  
  const bulkUpdate = useBulkUpdateTestimonials();

  useEffect(() => {
    if (open && testimonialIds.length > 0) {
      setLoadingPreview(true);
      // Fetch dry-run preview
      bulkUpdate.mutateAsync({
        testimonialIds,
        status: action,
        dryRun: true,
      }).then((data) => {
        setPreview(data);
        setLoadingPreview(false);
      }).catch(() => {
        setLoadingPreview(false);
      });
    }
  }, [open, testimonialIds, action]);

  const handleConfirm = async () => {
    try {
      await bulkUpdate.mutateAsync({
        testimonialIds,
        status: action,
        dryRun: false,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component via toast
    }
  };

  const actionLabels = {
    APPROVED: 'Approve',
    REJECTED: 'Reject',
    FLAGGED: 'Flag',
  };

  const actionVariants = {
    APPROVED: 'default' as const,
    REJECTED: 'destructive' as const,
    FLAGGED: 'outline' as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>
            Confirm Bulk {actionLabels[action]}
          </DialogTitle>
          <DialogDescription>
            You are about to {action.toLowerCase()} {testimonialIds.length} testimonial
            {testimonialIds.length !== 1 ? 's' : ''}. Please review the changes below.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {loadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : preview && preview.preview ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {preview.affectedCount} testimonial{preview.affectedCount !== 1 ? 's' : ''} will be affected
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Author
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Project
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Content
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Current
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        New
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.preview.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {item.authorName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {item.projectName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {item.content}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{item.currentStatus}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={actionVariants[action]}>{item.newStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Failed to load preview
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkUpdate.isPending}
          >
            Cancel
          </Button>
          <Button
            variant={actionVariants[action]}
            onClick={handleConfirm}
            disabled={bulkUpdate.isPending || loadingPreview}
          >
            {bulkUpdate.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm ${actionLabels[action]}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
