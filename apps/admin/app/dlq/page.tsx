import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getDLQJobs, getDLQStats } from "@/lib/api";
import { Header } from "@/components/header";
import { DLQTable } from "@/components/dlq-table";
import { DLQStats } from "@/components/dlq-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

async function checkAdminAccess() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}

async function DLQContent() {
  await checkAdminAccess();

  try {
    const [jobsData, statsData] = await Promise.all([
      getDLQJobs({ limit: 50 }),
      getDLQStats(),
    ]);

    return (
      <>
        <DLQStats data={statsData.data} />
        <DLQTable jobs={jobsData.data.jobs} total={jobsData.data.total} />
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
            {error instanceof Error ? error.message : "You don't have admin access."}
          </p>
        </CardContent>
      </Card>
    );
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DLQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dead Letter Queue</h1>
          <p className="text-muted-foreground">
            Failed jobs and retry management
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <DLQContent />
        </Suspense>
      </main>
    </div>
  );
}
