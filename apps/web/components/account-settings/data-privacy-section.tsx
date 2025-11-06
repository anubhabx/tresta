"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@workspace/ui/components/alert-dialog";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";
import {
  DownloadIcon,
  Trash2Icon,
  ShieldAlertIcon,
  Loader2,
  InfoIcon
} from "lucide-react";

interface DataPrivacySectionProps {
  onAccountDeleted?: () => void;
}

export function DataPrivacySection({
  onAccountDeleted
}: DataPrivacySectionProps) {
  const { user } = useUser();
  const api = useApi();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    try {
      setIsExporting(true);

      // Fetch user's projects
      const projectsResponse = await api.get("/projects");
      const projects = projectsResponse.data?.data || [];

      // Fetch user's widgets (from all projects)
      const widgetsPromises = projects.map((project: any) =>
        api
          .get(`/projects/${project.slug}/widgets`)
          .catch(() => ({ data: { data: [] } }))
      );
      const widgetsResponses = await Promise.all(widgetsPromises);
      const widgets = widgetsResponses.flatMap(
        (response) => response.data?.data || []
      );

      // Fetch user's testimonials (from all projects)
      const testimonialsPromises = projects.map((project: any) =>
        api
          .get(`/projects/${project.slug}/testimonials`)
          .catch(() => ({ data: { data: [] } }))
      );
      const testimonialsResponses = await Promise.all(testimonialsPromises);
      const testimonials = testimonialsResponses.flatMap(
        (response) => response.data?.data || []
      );

      // Compile all user data
      const userData = {
        profile: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        externalAccounts: user.externalAccounts?.map((account) => ({
          provider: account.provider,
          emailAddress: account.emailAddress,
          username: account.username
        })),
        projects: projects.map((project: any) => ({
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          website: project.website,
          logo: project.logo,
          visibility: project.visibility,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        })),
        widgets: widgets.map((widget: any) => ({
          id: widget.id,
          name: widget.name,
          projectId: widget.projectId,
          layout: widget.layout,
          config: widget.config,
          createdAt: widget.createdAt,
          updatedAt: widget.updatedAt
        })),
        testimonials: testimonials.map((testimonial: any) => ({
          id: testimonial.id,
          projectId: testimonial.projectId,
          name: testimonial.name,
          email: testimonial.email,
          content: testimonial.content,
          rating: testimonial.rating,
          verified: testimonial.verified,
          featured: testimonial.featured,
          status: testimonial.status,
          createdAt: testimonial.createdAt
        })),
        exportedAt: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tresta-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Your data has been downloaded successfully.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export your data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await user.delete();

      toast.success("Your account has been permanently deleted.");

      if (onAccountDeleted) {
        onAccountDeleted();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete your account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlertIcon className="h-5 w-5" />
          Data Control &amp; Privacy
        </CardTitle>
        <CardDescription>
          Manage your data and account privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Data */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Export Your Data</h4>
            <p className="text-sm text-muted-foreground">
              Download a copy of your account data, including profile, projects,
              widgets, and testimonials.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isExporting}
            className="ml-4"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex items-start justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-destructive">
              Delete Account
            </h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting}
                className="ml-4"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers,
                  including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Profile information and settings</li>
                    <li>All projects and their configurations</li>
                    <li>All widgets and embed codes</li>
                    <li>All collected testimonials</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Link to Privacy Page */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">What data do we collect?</h4>
              <p className="text-sm text-muted-foreground">
                View our complete transparency report about data collection
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/privacy">View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
