"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

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
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/errors/http-error";
import type { Project } from "@/types/api";
import { ModerationSettingsForm } from "./moderation-settings-form";
import { FormConfigSettings } from "./form-config-settings";
import { projects } from "@/lib/queries";

interface ProjectSettingsTabProps {
  project: Project;
  onDelete: () => Promise<void>;
}

export function ProjectSettingsTab({
  project,
  onDelete,
}: ProjectSettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const updateProject = projects.mutations.useUpdate(project.slug);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error: unknown) {
      console.error("Failed to delete project:", error);
      toast.error(
        getHttpErrorMessage(
          error,
          "Failed to delete project. Please try again.",
        ),
      );
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      await updateProject.mutateAsync({
        isActive: !project.isActive,
      });
      toast.success(
        `Project successfully ${project.isActive ? "deactivated" : "activated"}.`,
      );
    } catch (error: unknown) {
      console.error("Failed to toggle project state:", error);
      toast.error(
        getHttpErrorMessage(
          error,
          `Failed to ${project.isActive ? "deactivate" : "activate"} project. Details have been logged.`,
        ),
      );
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleUpdateVisibility = async (visibility: string) => {
    try {
      await updateProject.mutateAsync({ visibility });
      toast.success("Project visibility updated.");
    } catch (error: unknown) {
      console.error("Failed to update visibility:", error);
      toast.error(getHttpErrorMessage(error, "Failed to update visibility."));
    }
  };

  const [activeTab, setActiveTab] = useState<
    "general" | "moderation" | "form-config" | "danger"
  >("general");

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
      {/* Vertical Navigation Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1">
        <Card className="backdrop-blur-xl border border-white/5 shadow-2xl py-0">
          <CardContent className="p-2 flex flex-col gap-1">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("general")}
              className={`justify-start ${activeTab === "general" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              General Settings
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("moderation")}
              className={`justify-start ${activeTab === "moderation" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Auto-Moderation
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("form-config")}
              className={`justify-start ${activeTab === "form-config" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Form Configuration
            </Button>
            <div className="h-px bg-border/50 my-2 mx-2" />
            <Button
              variant="ghost"
              onClick={() => setActiveTab("danger")}
              className={`justify-start ${activeTab === "danger" ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400" : "text-red-500/80 hover:text-red-400 hover:bg-red-500/10"}`}
            >
              Danger Zone
            </Button>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <Card className="backdrop-blur-xl border border-white/5 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            {/* General Settings Content */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-foreground tracking-tight">
                    Project Information
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Basic details and metadata about your project.
                  </p>
                </div>
                <div className="h-px bg-border/50" />

                <div className="space-y-4 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">Project Name</span>
                    <span className="font-medium text-foreground text-base">
                      {project.name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">Project ID</span>
                    <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      {project.id}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {project.isActive ? "Active" : "Locked"}
                      </span>
                      <Switch
                        checked={project.isActive}
                        onCheckedChange={handleToggleActive}
                        disabled={isTogglingActive}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">Visibility</span>
                    <Select
                      value={project.visibility || "PRIVATE"}
                      onValueChange={handleUpdateVisibility}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">
                      {new Date(project.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">
                      Total Testimonials
                    </span>
                    <span className="font-medium text-foreground">
                      {project._count?.testimonials || 0}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-2">
                    <span className="text-muted-foreground">
                      Active Widgets
                    </span>
                    <span className="font-medium text-foreground">
                      {project._count?.widgets || 0}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild variant="outline">
                    <a href={`/projects/${project.slug}/edit`}>
                      Edit Project Details
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Moderation Settings Content */}
            {activeTab === "moderation" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-foreground tracking-tight">
                    Auto-Moderation Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure AI moderation to protect your project from spam
                    and inappropriate content.
                  </p>
                </div>
                <div className="h-px bg-border/50" />
                <div className="pt-2">
                  <ModerationSettingsForm project={project} />
                </div>
              </div>
            )}

            {/* Form Config Settings Content */}
            {activeTab === "form-config" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-foreground tracking-tight">
                    Collection Form Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize the questions and appearance of your public
                    collection form.
                  </p>
                </div>
                <div className="h-px bg-border/50" />
                <div className="pt-2">
                  <FormConfigSettings project={project} />
                </div>
              </div>
            )}

            {/* Danger Zone Content */}
            {activeTab === "danger" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-destructive tracking-tight">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Irreversible and destructive actions.
                  </p>
                </div>
                <div className="h-px bg-destructive/20" />

                <div className="space-y-4">
                  <div className="p-4 border border-orange-500/20 bg-orange-500/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-1">
                      {project.isActive
                        ? "Deactivate Project"
                        : "Activate Project"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.isActive
                        ? "Deactivating this project will make it inaccessible and its public endpoints will return a 403 error. You can reactivate it later if you have enough quota."
                        : "Reactivate this project. This will consume your active project quota limit."}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-orange-500/50 text-orange-500 hover:bg-orange-500/20 focus:ring-orange-500"
                        >
                          {project.isActive
                            ? "Deactivate Project"
                            : "Activate Project"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#0a0a0a] border-white/5 sm:max-w-[425px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {project.isActive
                              ? "Deactivate Project?"
                              : "Activate Project?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {project.isActive
                              ? "This will make your collection form and widgets inaccessible until reactivated."
                              : "This will make your project endpoints accessible again."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                          <AlertDialogCancel
                            disabled={isTogglingActive}
                            className="bg-transparent border-border hover:bg-muted"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleToggleActive}
                            disabled={isTogglingActive}
                            className="bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500"
                          >
                            {isTogglingActive
                              ? "Processing..."
                              : project.isActive
                                ? "Yes, Deactivate"
                                : "Yes, Activate"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-1">
                      Delete Project
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete this project and all associated
                      testimonials, widgets, and analytics. This action cannot
                      be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Project
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#0a0a0a] border-white/5 sm:max-w-[425px]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the project{" "}
                            <span className="font-semibold text-foreground">
                              "{project.name}"
                            </span>{" "}
                            and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                          <AlertDialogCancel
                            disabled={isDeleting}
                            className="bg-transparent border-border hover:bg-muted"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
                          >
                            {isDeleting ? "Deleting..." : "Yes, delete project"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
