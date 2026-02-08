"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useApi } from "@/hooks/use-api";
import {
  DownloadIcon,
  Trash2Icon,
  ShieldAlertIcon,
  Loader2,
  InfoIcon,
} from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

interface DataPrivacySectionProps {
  onAccountDeleted?: () => void;
}

export function DataPrivacySection({
  onAccountDeleted,
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
      const projectsResponse = await api.get("/api/projects");
      const projects = projectsResponse.data?.data || [];

      // Fetch user's widgets (from all projects)
      const widgetsPromises = projects.map((project: any) =>
        api
          .get(`/api/projects/${project.slug}/widgets`)
          .catch(() => ({ data: { data: [] } })),
      );
      const widgetsResponses = await Promise.all(widgetsPromises);
      const widgets = widgetsResponses.flatMap(
        (response) => response.data?.data || [],
      );

      // Fetch user's testimonials (from all projects)
      const testimonialsPromises = projects.map((project: any) =>
        api
          .get(`/api/projects/${project.slug}/testimonials`)
          .catch(() => ({ data: { data: [] } })),
      );
      const testimonialsResponses = await Promise.all(testimonialsPromises);
      const testimonials = testimonialsResponses.flatMap(
        (response) => response.data?.data || [],
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
          updatedAt: user.updatedAt,
        },
        externalAccounts: user.externalAccounts?.map((account) => ({
          provider: account.provider,
          emailAddress: account.emailAddress,
          username: account.username,
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
          updatedAt: project.updatedAt,
        })),
        widgets: widgets.map((widget: any) => ({
          id: widget.id,
          name: widget.name,
          projectId: widget.projectId,
          layout: widget.layout,
          config: widget.config,
          createdAt: widget.createdAt,
          updatedAt: widget.updatedAt,
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
          createdAt: testimonial.createdAt,
        })),
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
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

        {/* Danger Zone */}
        <div className="border border-red-500/20 rounded-lg overflow-hidden mt-8">
          <div className="bg-red-500/5 p-6">
            <h3 className="text-red-900 dark:text-red-200 font-medium mb-1 flex items-center gap-2">
              <ShieldAlertIcon className="h-4 w-4" />
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-6">
              Irreversible and destructive actions.
            </p>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently remove your Personal Account and all of its
                  contents from the Tresta platform. This action is not
                  reversible, so please continue with caution.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 dark:bg-red-950 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </p>
                      <div className="p-3 bg-red-50 text-red-800 rounded text-sm border border-red-100 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900">
                        <p className="font-semibold">
                          Warning: This will delete:
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Your personal profile and settings</li>
                          <li>All projects owned by you</li>
                          <li>
                            All widgets and testimonials within those projects
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="confirm-delete">
                          To confirm, type{" "}
                          <span className="font-mono font-bold">
                            delete my account
                          </span>{" "}
                          below:
                        </Label>
                        <Input
                          id="confirm-delete"
                          placeholder=""
                          autoComplete="off"
                          onChange={(e) => {
                            const btn = document.getElementById(
                              "confirm-delete-btn",
                            ) as HTMLButtonElement;
                            if (btn)
                              btn.disabled =
                                e.target.value !== "delete my account";
                          }}
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      id="confirm-delete-btn"
                      variant="destructive"
                      disabled={true}
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete my account"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
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
            <Link href="/privacy-policy">View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
