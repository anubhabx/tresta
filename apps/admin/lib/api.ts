import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch wrapper with Clerk authentication
 */
export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
    }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get admin metrics
 */
export async function getMetrics() {
  return fetchAPI<{
    success: boolean;
    data: {
      emailQuota: {
        used: number;
        limit: number;
        percentage: number;
        remaining: number;
        locked: boolean;
        nextRetry: string | null;
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
      history: Array<{
        id: string;
        date: string;
        count: number;
        createdAt: string;
      }>;
      timestamp: string;
    };
  }>("/admin/metrics");
}

/**
 * Get DLQ jobs
 */
export async function getDLQJobs(params?: {
  queue?: string;
  limit?: number;
  errorType?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.queue) searchParams.set("queue", params.queue);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.errorType) searchParams.set("errorType", params.errorType);

  const query = searchParams.toString();
  return fetchAPI<{
    success: boolean;
    data: {
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
      limit: number;
    };
  }>(`/admin/dlq${query ? `?${query}` : ""}`);
}

/**
 * Get DLQ stats
 */
export async function getDLQStats() {
  return fetchAPI<{
    success: boolean;
    data: {
      totalFailed: number;
      totalRetried: number;
      byQueue: Array<{ queue: string; count: number }>;
      byErrorType: Array<{ errorType: string | null; count: number }>;
      recentFailures: Array<{
        id: string;
        queue: string;
        errorType: string | null;
        failedAt: string;
        error: string;
      }>;
    };
  }>("/admin/dlq/stats");
}

/**
 * Requeue a failed job
 */
export async function requeueJob(jobId: string) {
  return fetchAPI<{
    success: boolean;
    message: string;
    data: { jobId: string };
  }>(`/admin/dlq/${jobId}/requeue`, {
    method: "POST",
  });
}

/**
 * Get health status
 */
export async function getHealthStatus() {
  return fetch(`${API_URL}/readyz`)
    .then((res) => res.json())
    .catch(() => ({ status: "error", checks: {} }));
}
