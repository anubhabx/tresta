import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Mail, Users, AlertCircle, Clock, Database, Inbox } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface MetricsGridProps {
  data: {
    emailQuota: {
      used: number;
      limit: number;
      percentage: number;
      remaining: number;
      locked: boolean;
    };
    ablyConnections: {
      current: number;
      limit: number;
      percentage: number;
    };
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
  };
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      title: "Email Quota",
      value: `${data.emailQuota.used}/${data.emailQuota.limit}`,
      description: `${data.emailQuota.remaining} remaining`,
      icon: Mail,
      color: data.emailQuota.percentage > 90 ? "text-destructive" : data.emailQuota.percentage > 70 ? "text-yellow-600" : "text-green-600",
    },
    {
      title: "Ably Connections",
      value: formatNumber(data.ablyConnections.current),
      description: `${data.ablyConnections.percentage}% of limit`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Notifications Sent",
      value: formatNumber(data.metrics.notificationsSent),
      description: `${formatNumber(data.metrics.emailsSent)} emails`,
      icon: Inbox,
      color: "text-purple-600",
    },
    {
      title: "Failed Jobs",
      value: formatNumber(data.queues.dlqCount),
      description: `${formatNumber(data.queues.outboxPending)} pending`,
      icon: AlertCircle,
      color: data.queues.dlqCount > 0 ? "text-destructive" : "text-green-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
