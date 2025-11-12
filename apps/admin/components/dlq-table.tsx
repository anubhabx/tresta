"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { RefreshCw, AlertCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { requeueJob } from "@/lib/api";

interface DLQTableProps {
  jobs: Array<{
    id: string;
    jobId: string;
    queue: string;
    data: any;
    error: string;
    errorType: string | null;
    statusCode: number | null;
    failedAt: string;
    retried: boolean;
  }>;
  total: number;
}

export function DLQTable({ jobs, total }: DLQTableProps) {
  const [requeueing, setRequeueing] = useState<string | null>(null);
  const [requeued, setRequeued] = useState<Set<string>>(new Set());

  const handleRequeue = async (jobId: string) => {
    setRequeueing(jobId);
    try {
      await requeueJob(jobId);
      setRequeued((prev) => new Set(prev).add(jobId));
      // Refresh page after 1 second
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to requeue job");
    } finally {
      setRequeueing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Failed Jobs ({total})</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No failed jobs in the queue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{job.queue}</Badge>
                      {job.errorType && (
                        <Badge
                          variant={
                            job.errorType === "transient"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {job.errorType}
                        </Badge>
                      )}
                      {job.statusCode && (
                        <Badge variant="outline">{job.statusCode}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">
                      {job.jobId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRequeue(job.id)}
                    disabled={requeueing === job.id || requeued.has(job.id)}
                  >
                    {requeueing === job.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Requeueing...
                      </>
                    ) : requeued.has(job.id) ? (
                      "Requeued"
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Requeue
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-destructive">{job.error}</p>
                  <p className="text-muted-foreground mt-1">
                    Failed {formatRelativeTime(job.failedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
