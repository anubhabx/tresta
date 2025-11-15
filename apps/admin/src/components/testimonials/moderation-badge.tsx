'use client';

import { Badge } from '@/components/ui/badge';

interface ModerationBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
}

export function ModerationBadge({ status }: ModerationBadgeProps) {
  const variants = {
    PENDING: { variant: 'warning' as const, label: 'Pending' },
    APPROVED: { variant: 'default' as const, label: 'Approved' },
    REJECTED: { variant: 'destructive' as const, label: 'Rejected' },
    FLAGGED: { variant: 'destructive' as const, label: 'Flagged' },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
