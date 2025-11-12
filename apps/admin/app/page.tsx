import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getMetrics, getHealthStatus } from "@/lib/api";
import { MetricsGrid } from "@/components/metrics-grid";
import { HealthStatus } from "@/components/health-status";
import { EmailHistory } from "@/components/email-history";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

async function checkAdminAccess() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Note: The actual admin check happens on the API side
  // This is just for UI routing
  return userId;
}

async function DashboardContent() {
  await checkAdminAccess();

  try {
    const [metricsData, healthData] = await Promise.all([
      getMetrics(),
      getHealthStatus(),
    ]);

    return (
      <>
        <MetricsGrid data={metricsData.data} />
        <div className="grid gap-6 md:grid-cols-2">
          <HealthStatus data={healthData} />
          <EmailHistory history={metricsData.data.history} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "You don't have admin access. Please contact an administrator."}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Admin access requires the "admin" role in your Clerk metadata.
          </p>
        </CardContent>
      </Card>
    );
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System metrics and monitoring
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
