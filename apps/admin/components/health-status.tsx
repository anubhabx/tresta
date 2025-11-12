import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface HealthStatusProps {
  data: {
    status: string;
    checks?: {
      database?: boolean;
      redis?: boolean;
      bullmq?: boolean;
    };
  };
}

export function HealthStatus({ data }: HealthStatusProps) {
  const checks = data.checks || {};
  const allHealthy = Object.values(checks).every((v) => v === true);

  const getStatusIcon = (status?: boolean) => {
    if (status === undefined) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const getStatusText = (status?: boolean) => {
    if (status === undefined) return "Unknown";
    return status ? "Healthy" : "Unhealthy";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allHealthy ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Database</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.database)}
            <span className="text-sm text-muted-foreground">
              {getStatusText(checks.database)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Redis</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.redis)}
            <span className="text-sm text-muted-foreground">
              {getStatusText(checks.redis)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">BullMQ</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.bullmq)}
            <span className="text-sm text-muted-foreground">
              {getStatusText(checks.bullmq)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
