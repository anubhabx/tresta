import { Mail, Send, Clock, XCircle, AlertTriangle, Inbox } from 'lucide-react';
import { MetricsCard } from './metrics-card';
import { formatNumber } from '@/lib/utils/format';

interface StatsGridProps {
  metrics: {
    notificationsSent: number;
    emailsSent: number;
    emailsDeferred: number;
    emailsFailed: number;
  };
  queues: {
    dlqCount: number;
    outboxPending: number;
  };
}

export function StatsGrid({ metrics, queues }: StatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MetricsCard
        title="Notifications Sent"
        value={formatNumber(metrics.notificationsSent)}
        icon={Send}
        subtitle="Total notifications delivered"
      />
      <MetricsCard
        title="Emails Sent"
        value={formatNumber(metrics.emailsSent)}
        icon={Mail}
        subtitle="Successfully delivered"
      />
      <MetricsCard
        title="Emails Deferred"
        value={formatNumber(metrics.emailsDeferred)}
        icon={Clock}
        subtitle="Queued for retry"
      />
      <MetricsCard
        title="Emails Failed"
        value={formatNumber(metrics.emailsFailed)}
        icon={XCircle}
        subtitle="Permanent failures"
      />
      <MetricsCard
        title="Dead Letter Queue"
        value={formatNumber(queues.dlqCount)}
        icon={AlertTriangle}
        subtitle="Failed jobs requiring attention"
      />
      <MetricsCard
        title="Outbox Pending"
        value={formatNumber(queues.outboxPending)}
        icon={Inbox}
        subtitle="Messages awaiting processing"
      />
    </div>
  );
}
