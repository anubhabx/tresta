"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
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
import type { Project } from "@/types/api";
import { ModerationSettingsForm } from "./moderation-settings-form";

interface ProjectSettingsTabProps {
  project: Project;
  onDelete: () => Promise<void>;
}

export function ProjectSettingsTab({
  project,
  onDelete,
}: ProjectSettingsTabProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["general", "moderation"]}
        className="w-full space-y-4"
      >
        {/* General Settings */}
        <AccordionItem value="general" className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-lg px-4">
          <AccordionTrigger className="text-base sm:text-lg font-semibold hover:no-underline">
            General Settings
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-4">
              {/* Project Information */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Project Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Project Name</span>
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Project ID</span>
                    <span className="font-mono text-xs">{project.id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={project.isActive ? "default" : "secondary"}>
                      {project.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Total Testimonials</span>
                    <span className="font-medium">{project._count?.testimonials || 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Active Widgets</span>
                    <span className="font-medium">{project._count?.widgets || 0}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild className="touch-manipulation min-h-[44px] sm:min-h-0">
                    <a href={`/projects/${project.slug}/edit`}>
                      Edit Project Details
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Moderation Settings */}
        <AccordionItem value="moderation" className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-lg px-4">
          <AccordionTrigger className="text-base sm:text-lg font-semibold hover:no-underline">
            Auto-Moderation Settings
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <ModerationSettingsForm project={project} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Danger Zone - Always at the bottom */}
      <div className="pt-6 border-t">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-destructive">
          Danger Zone
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
          Permanently delete this project and all associated data. This action cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="touch-manipulation min-h-[44px] sm:min-h-0">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently
                delete the project "{project.name}" and all associated
                testimonials and widgets.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
