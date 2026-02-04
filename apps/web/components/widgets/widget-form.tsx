"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { Separator } from "@workspace/ui/components/separator";
import { Loader2 } from "lucide-react";
import type { Widget, WidgetConfig } from "@/lib/queries/widgets";
import { DEFAULT_WIDGET_CONFIG } from "@workspace/types";
import {
  WidgetBasicSection,
  WidgetAppearanceSection,
  WidgetDisplaySection,
  WidgetLayoutSection,
} from "./widget-form-sections";

const MIN_MAX_TESTIMONIALS = 20;

const widgetFormSchema = z.object({
  layout: z.enum(["carousel", "grid", "masonry", "wall", "list"]),
  theme: z.enum(["light", "dark", "auto"]),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  showRating: z.boolean(),
  showAvatar: z.boolean(),
  maxTestimonials: z.number().min(1).max(MIN_MAX_TESTIMONIALS),
  autoRotate: z.boolean().optional(),
  rotateInterval: z.number().optional(),
});

export type WidgetFormData = z.infer<typeof widgetFormSchema>;

interface WidgetFormProps {
  initialData?: Widget;
  onSubmit: (data: WidgetFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onConfigChange?: (config: WidgetFormData) => void;
}

export function WidgetForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onConfigChange,
}: WidgetFormProps) {
  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: getInitialValues(initialData?.config),
  });



  // Use ref to store the callback to avoid dependency issues
  const onConfigChangeRef = useRef(onConfigChange);

  useEffect(() => {
    onConfigChangeRef.current = onConfigChange;
  }, [onConfigChange]);

  // Subscribe to form changes and notify parent with debounce
  useEffect(() => {
    const timeoutId = { current: undefined as ReturnType<typeof setTimeout> | undefined };

    const subscription = form.watch((value) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        if (onConfigChangeRef.current) {
          onConfigChangeRef.current(value as WidgetFormData);
        }
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Use extracted section components */}
        <WidgetBasicSection control={form.control} />
        <WidgetAppearanceSection control={form.control} />
        <WidgetDisplaySection control={form.control} />
        <WidgetLayoutSection
          control={form.control}
        />

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Widget" : "Create Widget"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function getInitialValues(config?: WidgetConfig) {
  // Normalize layout to one of the 5 valid options
  const validLayouts = ["carousel", "grid", "masonry", "wall", "list"];
  const normalizedLayout = validLayouts.includes(config?.layout || "")
    ? config!.layout
    : "grid";

  const normalized = {
    layout: normalizedLayout,
    theme: config?.theme || DEFAULT_WIDGET_CONFIG.theme,
    primaryColor: config?.primaryColor || DEFAULT_WIDGET_CONFIG.primaryColor,
    showRating:
      typeof config?.showRating === "boolean"
        ? config.showRating
        : DEFAULT_WIDGET_CONFIG.showRating,
    showAvatar:
      typeof config?.showAvatar === "boolean"
        ? config.showAvatar
        : DEFAULT_WIDGET_CONFIG.showAvatar,
    maxTestimonials:
      config?.maxTestimonials || DEFAULT_WIDGET_CONFIG.maxTestimonials,
    autoRotate: false,
    rotateInterval: DEFAULT_WIDGET_CONFIG.rotateInterval,
  } as WidgetFormData;

  normalized.maxTestimonials = Math.min(
    Math.max(normalized.maxTestimonials, 1),
    MIN_MAX_TESTIMONIALS
  );

  return normalized;
}
