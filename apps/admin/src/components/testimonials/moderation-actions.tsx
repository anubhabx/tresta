'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Check, X, Flag } from 'lucide-react';
import { useUpdateTestimonialStatus } from '@/lib/hooks/use-testimonials';
import { toast } from 'sonner';

interface ModerationActionsProps {
  testimonialId: string;
  currentStatus: string;
  testimonialContent: string;
  authorName: string;
}

export function ModerationActions({
  testimonialId,
  currentStatus,
  testimonialContent,
  authorName,
}: ModerationActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'APPROVED' | 'REJECTED' | 'FLAGGED' | null>(null);
  
  const updateStatus = useUpdateTestimonialStatus();

  const handleActionClick = (action: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    setSelectedAction(action);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;

    try {
      await updateStatus.mutateAsync({
        testimonialId,
        status: selectedAction,
      });

      toast.success(`Testimonial ${selectedAction.toLowerCase()} successfully`);
      setDialogOpen(false);
      setSelectedAction(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update testimonial status'
      );
    }
  };

  const actionConfig = {
    APPROVED: {
      label: 'Approve',
      icon: Check,
      variant: 'default' as const,
      color: 'text-green-600',
    },
    REJECTED: {
      label: 'Reject',
      icon: X,
      variant: 'destructive' as const,
      color: 'text-red-600',
    },
    FLAGGED: {
      label: 'Flag',
      icon: Flag,
      variant: 'outline' as const,
      color: 'text-orange-600',
    },
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {currentStatus !== 'APPROVED' && (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleActionClick('APPROVED')}
            disabled={updateStatus.isPending}
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        )}
        {currentStatus !== 'REJECTED' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleActionClick('REJECTED')}
            disabled={updateStatus.isPending}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
        )}
        {currentStatus !== 'FLAGGED' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('FLAGGED')}
            disabled={updateStatus.isPending}
          >
            <Flag className="h-4 w-4" />
            Flag
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setDialogOpen(false)}>
            <DialogTitle>
              Confirm {selectedAction && actionConfig[selectedAction].label}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedAction?.toLowerCase()} this testimonial?
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Author
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{authorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                  {testimonialContent}
                </p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={selectedAction ? actionConfig[selectedAction].variant : 'default'}
              onClick={handleConfirm}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Updating...' : `Confirm ${selectedAction && actionConfig[selectedAction].label}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
