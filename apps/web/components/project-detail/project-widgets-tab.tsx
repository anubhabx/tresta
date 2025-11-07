"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { widgets } from "@/lib/queries";
import { LoadingStars } from "@/components/loader";
import {
  WidgetCard,
  WidgetEmptyState,
  WidgetForm,
  EmbedCodeDialog,
} from "@/components/widgets";
import type { WidgetFormData } from "@/components/widgets/widget-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

interface ProjectWidgetsTabProps {
  projectSlug: string;
  projectId: string;
}

export function ProjectWidgetsTab({
  projectSlug,
  projectId,
}: ProjectWidgetsTabProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [embedWidgetId, setEmbedWidgetId] = useState<string | null>(null);

  const { data: widgetsList, isLoading } = widgets.queries.useList(projectSlug);
  const createWidget = widgets.mutations.useCreate();
  const updateWidget = widgets.mutations.useUpdate(selectedWidgetId || "");
  const deleteWidget = widgets.mutations.useDelete(selectedWidgetId || "");

  const handleCreateWidget = async (data: WidgetFormData) => {
    try {
      await createWidget.mutateAsync({
        projectId,
        embedType: data.embedType,
        config: {
          layout: data.layout,
          theme: data.theme,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          showRating: data.showRating,
          showDate: data.showDate,
          showAvatar: data.showAvatar,
          maxTestimonials: data.maxTestimonials,
          autoRotate: data.autoRotate,
          rotateInterval: data.rotateInterval,
          columns: data.columns,
          cardStyle: data.cardStyle,
          animation: data.animation,
        },
      });
      toast.success("Widget created successfully!");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create widget");
    }
  };

  const handleUpdateWidget = async (data: WidgetFormData) => {
    if (!selectedWidgetId) return;

    try {
      await updateWidget.mutateAsync({
        embedType: data.embedType,
        config: {
          layout: data.layout,
          theme: data.theme,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          showRating: data.showRating,
          showDate: data.showDate,
          showAvatar: data.showAvatar,
          maxTestimonials: data.maxTestimonials,
          autoRotate: data.autoRotate,
          rotateInterval: data.rotateInterval,
          columns: data.columns,
          cardStyle: data.cardStyle,
          animation: data.animation,
        },
      });
      toast.success("Widget updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedWidgetId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update widget");
    }
  };

  const handleEditWidget = (widgetId: string) => {
    setSelectedWidgetId(widgetId);
    setIsEditDialogOpen(true);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      await widgets.mutations.useDelete(widgetId).mutateAsync();
    } catch (error: any) {
      throw error;
    }
  };

  const handleViewEmbed = (widgetId: string) => {
    setEmbedWidgetId(widgetId);
  };

  const selectedWidget = widgetsList?.find((w) => w.id === selectedWidgetId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full h-64 items-center justify-center">
        <LoadingStars />
        <p className="text-sm text-muted-foreground">Loading widgets...</p>
      </div>
    );
  }

  const hasWidgets = widgetsList && widgetsList.length > 0;

  return (
    <>
      <div className="space-y-6">
        {!hasWidgets ? (
          <WidgetEmptyState
            onCreateWidget={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Widgets ({widgetsList.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Embed testimonials on your website
                </p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Widget
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {widgetsList.map((widget) => (
                <WidgetCard
                  key={widget.id}
                  widget={widget}
                  onEdit={handleEditWidget}
                  onDelete={handleDeleteWidget}
                  onViewEmbed={handleViewEmbed}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Widget Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Widget</DialogTitle>
            <DialogDescription>
              Configure how testimonials will be displayed on your website
            </DialogDescription>
          </DialogHeader>
          <WidgetForm
            onSubmit={handleCreateWidget}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createWidget.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Widget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
            <DialogDescription>
              Update your widget configuration
            </DialogDescription>
          </DialogHeader>
          {selectedWidget && (
            <WidgetForm
              initialData={selectedWidget}
              onSubmit={handleUpdateWidget}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedWidgetId(null);
              }}
              isSubmitting={updateWidget.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      {embedWidgetId && (
        <EmbedCodeDialog
          widgetId={embedWidgetId}
          isOpen={!!embedWidgetId}
          onClose={() => setEmbedWidgetId(null)}
        />
      )}
    </>
  );
}
