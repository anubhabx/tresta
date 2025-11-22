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
import { DEFAULT_WIDGET_CONFIG } from "@workspace/types";

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
    layout: "grid",
    theme: DEFAULT_WIDGET_CONFIG.theme,
    primaryColor: DEFAULT_WIDGET_CONFIG.primaryColor,
    showRating: DEFAULT_WIDGET_CONFIG.showRating,
    showAvatar: DEFAULT_WIDGET_CONFIG.showAvatar,
    maxTestimonials: 6,
    autoRotate: false,
    rotateInterval: DEFAULT_WIDGET_CONFIG.rotateInterval
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
        layout: widget.config.layout === "carousel" ? "carousel" : "grid",
        theme: (widget.config.theme as any) || DEFAULT_WIDGET_CONFIG.theme,
        primaryColor:
          widget.config.primaryColor || DEFAULT_WIDGET_CONFIG.primaryColor,
        showRating: widget.config.showRating ?? DEFAULT_WIDGET_CONFIG.showRating,
        showAvatar: widget.config.showAvatar ?? DEFAULT_WIDGET_CONFIG.showAvatar,
        maxTestimonials:
          widget.config.maxTestimonials || DEFAULT_WIDGET_CONFIG.maxTestimonials,
        autoRotate: widget.config.layout === "carousel" && widget.config.autoRotate
          ? true
          : false,
        rotateInterval:
          widget.config.rotateInterval || DEFAULT_WIDGET_CONFIG.rotateInterval
      });
    }
  }, [mode, widget]);

  const createWidget = widgets.mutations.useCreate();
  const updateWidget = widgets.mutations.useUpdate(widgetId || "");

  const handleSubmit = async (data: WidgetFormData) => {
    try {
      const mutationPayload = {
        layout: data.layout,
        theme: data.theme,
        primaryColor: data.primaryColor,
        showRating: data.showRating,
        showAvatar: data.showAvatar,
        maxTestimonials: data.maxTestimonials,
        autoRotate: data.layout === "carousel" ? data.autoRotate : false,
        rotateInterval: data.rotateInterval
      };

      if (mode === "create") {
        await createWidget.mutateAsync({
          projectId,
          config: mutationPayload
        });
        toast.success("Widget created successfully!");
      } else {
        await updateWidget.mutateAsync({
          config: mutationPayload
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
