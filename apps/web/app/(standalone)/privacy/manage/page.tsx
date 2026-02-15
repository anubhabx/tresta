"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import {
  Shield,
  Download,
  Trash2,
  CheckCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { usePrivacyData, useAnonymizeData } from "@/lib/queries/privacy";

function PrivacyManageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    data: responseData,
    isLoading: loading,
    error,
  } = usePrivacyData(token);
  const {
    mutate: anonymize,
    isPending: isDeleting,
    isSuccess: isDeleted,
  } = useAnonymizeData();

  const data = responseData?.data;

  const handleDownload = () => {
    if (!data) return;

    // Create blob and download
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tresta-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const handleDelete = () => {
    if (!token) return;
    anonymize(token, {
      onSuccess: () => {
        toast.success("Data successfully anonymized");
      },
      onError: () => {
        toast.error("Failed to delete data");
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "Invalid or expired session. Please request a new link."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
              <a href="/privacy/request">Request New Link</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDeleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <CardTitle>Data Anonymized</CardTitle>
            <CardDescription>
              Your personal identifiable information (IP, User Agent, Email) has
              been removed from our records.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href="/">Return Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Data Privacy Portal</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Identity Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold">
                    Email
                  </label>
                  <p className="font-medium truncate" title={data?.email}>
                    {data?.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-bold">
                    Records Found
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{data?.count}</span>
                    <Badge variant="outline">Testimonials</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Your Data Controls</CardTitle>
              <CardDescription>
                You can download a copy of your data or permanently anonymize
                it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center gap-2">
                    <Download className="h-4 w-4" /> Export Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Download a JSON copy of all your testimonials and associated
                    metadata.
                  </p>
                </div>
                <Button onClick={handleDownload} variant="outline">
                  Download JSON
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                <div className="space-y-1">
                  <h3 className="font-medium text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Anonymize Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your IP address, User Agent, and Email
                    from our records.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Anonymize</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. We will permanently
                        nullify your IP address, user agent, and remove your
                        email link from all {data?.count} testimonials.
                        <br />
                        <br />
                        The content of the testimonials will remain, but will be
                        attributed to "Anonymous".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Yes, Anonymize My Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyManagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PrivacyManageContent />
    </Suspense>
  );
}
