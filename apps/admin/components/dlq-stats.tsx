import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface DLQStatsProps {
  data: {
    totalFailed: number;
    totalRetried: number;
    byQueue: Array<{ queue: string; count: number }>;
    byErrorType: Array<{ errorType: string | null; count: number }>;
  };
}

export function DLQStats({ data }: DLQStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalFailed)}</div>
          <p className="text-xs text-muted-foreground">
            Pending retry
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retried Jobs</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalRetried)}</div>
          <p className="text-xs text-muted-foreground">
            Successfully requeued
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Queue</CardTitle>
          <Database className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {data.byQueue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No failed jobs</p>
            ) : (
              data.byQueue.map((q) => (
                <div key={q.queue} className="flex justify-between text-sm">
                  <span className="font-medium">{q.queue}</span>
                  <span className="text-muted-foreground">{q.count}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
