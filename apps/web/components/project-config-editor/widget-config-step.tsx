"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@workspace/ui/components/form";
import { Separator } from "@workspace/ui/components/separator";
import { DEFAULT_WIDGET_CONFIG } from "@workspace/types";
import type { WidgetConfig } from "@workspace/types";
import type { WidgetFormData } from "@/components/widgets/widget-form";
import { widgetFormSchema } from "@/components/widgets/widget-form";
import {
  WidgetBasicSection,
  WidgetAppearanceSection,
  WidgetDisplaySection,
  WidgetLayoutSection,
  WidgetAdvancedSection,
} from "@/components/widgets/widget-form-sections";
import { WidgetPreview } from "@/components/widgets/widget-preview";

// ============================================================================
// TYPES
// ============================================================================

export interface WidgetConfigStepRef {
  submit: () => Promise<WidgetFormData | null>;
}

interface WidgetConfigStepProps {
  initialConfig?: WidgetConfig | null;
  widgetId?: string;
  isPro?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

const isTheme = (v: unknown): v is WidgetFormData["theme"] =>
  v === "light" || v === "dark" || v === "auto";

const VALID_LAYOUTS = ["carousel", "grid", "masonry", "wall", "list", "marquee"] as const;

function buildInitialValues(config?: WidgetConfig | null): WidgetFormData {
  const rawLayout = config?.layout ?? "grid";
  const layout = VALID_LAYOUTS.includes(rawLayout as (typeof VALID_LAYOUTS)[number])
    ? (rawLayout as WidgetFormData["layout"])
    : "grid";

  return {
    layout,
    theme: isTheme(config?.theme) ? config!.theme : DEFAULT_WIDGET_CONFIG.theme,
    primaryColor: config?.primaryColor ?? DEFAULT_WIDGET_CONFIG.primaryColor,
    showRating:
      typeof config?.showRating === "boolean"
        ? config.showRating
        : DEFAULT_WIDGET_CONFIG.showRating,
    showAvatar:
      typeof config?.showAvatar === "boolean"
        ? config.showAvatar
        : DEFAULT_WIDGET_CONFIG.showAvatar,
    showBranding:
      typeof config?.showBranding === "boolean"
        ? config.showBranding
        : DEFAULT_WIDGET_CONFIG.showBranding,
    maxTestimonials: Math.min(
      Math.max(config?.maxTestimonials ?? DEFAULT_WIDGET_CONFIG.maxTestimonials, 1),
      20,
    ),
    autoRotate: config?.autoRotate ?? false,
    rotateInterval:
      config?.rotateInterval ?? DEFAULT_WIDGET_CONFIG.rotateInterval,
    customCss: config?.customCss ?? "",
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export const WidgetConfigStep = forwardRef<
  WidgetConfigStepRef,
  WidgetConfigStepProps
>(function WidgetConfigStep(
  { initialConfig, widgetId, isPro = false },
  ref,
) {
  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: buildInitialValues(initialConfig),
  });

  // Re-populate when config loads (edit mode async)
  useEffect(() => {
    if (initialConfig) {
      form.reset(buildInitialValues(initialConfig));
    }
  }, [initialConfig, form]);

  // Expose submit via ref
  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise<WidgetFormData | null>((resolve) => {
        form.handleSubmit(
          (data) => resolve(data),
          () => resolve(null),
        )();
      }),
  }));

  // Debounced preview config state
  const [previewConfig, setPreviewConfig] = useState<WidgetFormData>(
    buildInitialValues(initialConfig),
  );
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleConfigChange = useCallback((config: WidgetFormData) => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
      setPreviewConfig(config);
    }, 150);
  }, []);

  // Subscribe to form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      handleConfigChange(value as WidgetFormData);
    });
    return () => subscription.unsubscribe();
  }, [form, handleConfigChange]);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-5 items-start">
      {/* Left: Form settings */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <WidgetBasicSection control={form.control} isPro={isPro} />
            <Separator />
            <WidgetAppearanceSection control={form.control} isPro={isPro} />
            <Separator />
            <WidgetDisplaySection control={form.control} isPro={isPro} />
            <Separator />
            <WidgetLayoutSection control={form.control} />
            <WidgetAdvancedSection control={form.control} isPro={isPro} />
          </form>
        </Form>
      </div>

      {/* Right: Live preview */}
      <div className="lg:col-span-3 lg:sticky lg:top-24 lg:h-fit lg:self-start">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b p-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Live Preview</h3>
                <p className="text-xs text-muted-foreground">
                  {previewConfig.layout.charAt(0).toUpperCase() +
                    previewConfig.layout.slice(1)}{" "}
                  ·{" "}
                  {previewConfig.theme === "auto"
                    ? "System"
                    : previewConfig.theme.charAt(0).toUpperCase() +
                      previewConfig.theme.slice(1)}{" "}
                  theme
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: previewConfig.primaryColor }}
                title={`Accent: ${previewConfig.primaryColor}`}
              />
            </div>
          </div>
          <div className="p-4">
            <WidgetPreview config={previewConfig} widgetId={widgetId} />
          </div>
        </div>
      </div>
    </div>
  );
});
