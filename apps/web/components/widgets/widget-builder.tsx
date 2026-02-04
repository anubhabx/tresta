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
      // Normalize layout to one of the 5 valid options
      const validLayouts = ["carousel", "grid", "masonry", "wall", "list"];
      const normalizedLayout = validLayouts.includes(widget.config.layout || "")
        ? widget.config.layout
        : "grid";

      setPreviewConfig({
        layout: normalizedLayout as WidgetFormData["layout"],
        theme: (widget.config.theme as any) || DEFAULT_WIDGET_CONFIG.theme,
        primaryColor:
          widget.config.primaryColor || DEFAULT_WIDGET_CONFIG.primaryColor,
        showRating: widget.config.showRating ?? DEFAULT_WIDGET_CONFIG.showRating,
        showAvatar: widget.config.showAvatar ?? DEFAULT_WIDGET_CONFIG.showAvatar,
        maxTestimonials:
          widget.config.maxTestimonials || DEFAULT_WIDGET_CONFIG.maxTestimonials,
        autoRotate: false,
        rotateInterval: DEFAULT_WIDGET_CONFIG.rotateInterval
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
        autoRotate: false,
        rotateInterval: DEFAULT_WIDGET_CONFIG.rotateInterval
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
            {mode === "create" ? "Create Widget" : "Edit Widget"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your testimonial display and see changes instantly
          </p>
        </div>
      </div>

      {/* Split Layout: Form (Left) | Preview (Right) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <WidgetForm
              initialData={mode === "edit" ? widget : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              onConfigChange={handleConfigChange}
            />
          </div>
        </div>

        {/* Right Column: Live Preview - Sticky */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="border-b p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Live Preview</h3>
                  <p className="text-xs text-muted-foreground">
                    {previewConfig.layout.charAt(0).toUpperCase() + previewConfig.layout.slice(1)} · {previewConfig.theme === "auto" ? "System" : previewConfig.theme.charAt(0).toUpperCase() + previewConfig.theme.slice(1)} theme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: previewConfig.primaryColor }}
                    title={`Accent: ${previewConfig.primaryColor}`}
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              <WidgetPreview config={previewConfig} widgetId={widgetId} />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
