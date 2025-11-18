"use client";

import { useRouter } from "next/navigation";
import { widgets } from "@/lib/queries";
import { WidgetBuilderSkeleton } from "@/components/skeletons/widget-skeleton";
import { WidgetForm } from "@/components/widgets/widget-form";
import { WidgetPreview } from "@/components/widgets/widget-preview";
import type { WidgetFormData } from "@/components/widgets/widget-form";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";

interface WidgetBuilderProps {
  projectSlug: string;
  projectId: string;
  widgetId?: string;
  mode: "create" | "edit";
}

export function WidgetBuilder({
  projectSlug,
  projectId,
  widgetId,
  mode
}: WidgetBuilderProps) {
  const router = useRouter();

  // Default config for preview
  const defaultConfig: WidgetFormData = {
    layout: "carousel",
    theme: "light",
    primaryColor: "#0066FF",
    secondaryColor: "#00CC99",
    showRating: true,
    showDate: true,
    showAvatar: false,
    showAuthorRole: true,
    showAuthorCompany: true,
    maxTestimonials: 10,
    autoRotate: false,
    rotateInterval: 5000,
    showNavigation: true,
    columns: 3,
    cardStyle: "default",
    animation: "fade"
  };

  const [previewConfig, setPreviewConfig] =
    useState<WidgetFormData>(defaultConfig);

  // Memoize the callback to prevent infinite loops
  const handleConfigChange = useCallback((config: WidgetFormData) => {
    setPreviewConfig(config);
  }, []);

  // Fetch widgets list and find the specific widget if editing
  const { data: widgetsList, isLoading: isLoadingWidget } =
    widgets.queries.useList(projectSlug);

  const widget =
    mode === "edit" && widgetsList
      ? widgetsList.find((w) => w.id === widgetId)
      : undefined;

  // Initialize preview config with widget data when editing
  useEffect(() => {
    if (mode === "edit" && widget?.config) {
      setPreviewConfig({
        layout: (widget.config.layout as any) || "carousel",
        theme: (widget.config.theme as any) || "light",
        primaryColor: widget.config.primaryColor || "#0066FF",
        secondaryColor: widget.config.secondaryColor || "#00CC99",
        showRating: widget.config.showRating ?? true,
        showDate: widget.config.showDate ?? true,
        showAvatar: widget.config.showAvatar ?? false,
        showAuthorRole: widget.config.showAuthorRole ?? true,
        showAuthorCompany: widget.config.showAuthorCompany ?? true,
        maxTestimonials: widget.config.maxTestimonials || 10,
        autoRotate: widget.config.autoRotate ?? false,
        rotateInterval: widget.config.rotateInterval || 5000,
        showNavigation: widget.config.showNavigation ?? true,
        columns: widget.config.columns || 3,
        cardStyle: (widget.config.cardStyle as any) || "default",
        animation: (widget.config.animation as any) || "fade"
      });
    }
  }, [mode, widget]);

  const createWidget = widgets.mutations.useCreate();
  const updateWidget = widgets.mutations.useUpdate(widgetId || "");

  const handleSubmit = async (data: WidgetFormData) => {
    try {
      if (mode === "create") {
        await createWidget.mutateAsync({
          projectId,
          config: {
            layout: data.layout,
            theme: data.theme,
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            showRating: data.showRating,
            showDate: data.showDate,
            showAvatar: data.showAvatar,
            showAuthorRole: data.showAuthorRole,
            showAuthorCompany: data.showAuthorCompany,
            maxTestimonials: data.maxTestimonials,
            autoRotate: data.autoRotate,
            rotateInterval: data.rotateInterval,
            showNavigation: data.showNavigation,
            columns: data.columns,
            cardStyle: data.cardStyle,
            animation: data.animation
          }
        });
        toast.success("Widget created successfully!");
      } else {
        await updateWidget.mutateAsync({
          config: {
            layout: data.layout,
            theme: data.theme,
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            showRating: data.showRating,
            showDate: data.showDate,
            showAvatar: data.showAvatar,
            showAuthorRole: data.showAuthorRole,
            showAuthorCompany: data.showAuthorCompany,
            maxTestimonials: data.maxTestimonials,
            autoRotate: data.autoRotate,
            rotateInterval: data.rotateInterval,
            showNavigation: data.showNavigation,
            columns: data.columns,
            cardStyle: data.cardStyle,
            animation: data.animation
          }
        });
        toast.success("Widget updated successfully!");
      }
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${mode} widget`);
    }
  };

  const handleCancel = () => {
    router.push(`/projects/${projectSlug}?tab=widgets`);
  };

  if (mode === "edit" && isLoadingWidget) {
    return <WidgetBuilderSkeleton />;
  }

  const isSubmitting = createWidget.isPending || updateWidget.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create New Widget" : "Edit Widget"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Configure and preview your widget in real-time"
              : "Update widget configuration and see changes instantly"}
          </p>
        </div>
      </div>

      {/* Split Layout: Form (Left) | Preview (Right) */}
      <div className="relative grid space-x-6 lg:gap-6 space-y-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="space-y-6 w-full">
          <div className="rounded-lg border bg-card">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold">Widget Settings</h2>
              <p className="text-sm text-muted-foreground">
                Customize your widget appearance and behavior
              </p>
            </div>
            <div className="p-6">
              <WidgetForm
                initialData={mode === "edit" ? widget : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                onConfigChange={handleConfigChange}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview - Sticky */}
        <div className="lg:sticky lg:top-6 lg:h-fit lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <WidgetPreview config={previewConfig} widgetId={widgetId} />
          </div>
        </div>
      </div>
    </div>
  );
}
