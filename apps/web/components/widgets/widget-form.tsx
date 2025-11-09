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
import {
  WidgetBasicSection,
  WidgetAppearanceSection,
  WidgetDisplaySection,
  WidgetLayoutSection,
} from "./widget-form-sections";

const widgetFormSchema = z.object({
  layout: z.enum(["carousel", "grid", "masonry", "wall"]),
  theme: z.enum(["light", "dark", "auto"]),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  showRating: z.boolean(),
  showDate: z.boolean(),
  showAvatar: z.boolean(),
  showAuthorRole: z.boolean(),
  showAuthorCompany: z.boolean(),
  maxTestimonials: z.number().min(1).max(100),
  autoRotate: z.boolean(),
  rotateInterval: z.number().min(1000).max(30000),
  showNavigation: z.boolean(),
  columns: z.number().min(1).max(6),
  cardStyle: z.enum(["default", "minimal", "bordered"]),
  animation: z.enum(["fade", "slide", "none"]),
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
    defaultValues: initialData
      ? {
          layout: (initialData.config?.layout as any) || "carousel",
          theme: (initialData.config?.theme as any) || "light",
          primaryColor: initialData.config?.primaryColor || "#0066FF",
          secondaryColor: initialData.config?.secondaryColor || "#00CC99",
          showRating: initialData.config?.showRating ?? true,
          showDate: initialData.config?.showDate ?? true,
          showAvatar: initialData.config?.showAvatar ?? false,
          showAuthorRole: initialData.config?.showAuthorRole ?? true,
          showAuthorCompany: initialData.config?.showAuthorCompany ?? true,
          maxTestimonials: initialData.config?.maxTestimonials || 10,
          autoRotate: initialData.config?.autoRotate ?? false,
          rotateInterval: initialData.config?.rotateInterval || 5000,
          showNavigation: initialData.config?.showNavigation ?? true,
          columns: initialData.config?.columns || 3,
          cardStyle: (initialData.config?.cardStyle as any) || "default",
          animation: (initialData.config?.animation as any) || "fade",
        }
      : {
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
          animation: "fade",
        },
  });

  const watchLayout = form.watch("layout");
  const watchAutoRotate = form.watch("autoRotate");

  // Use ref to store the callback to avoid dependency issues
  const onConfigChangeRef = useRef(onConfigChange);

  useEffect(() => {
    onConfigChangeRef.current = onConfigChange;
  }, [onConfigChange]);

  // Subscribe to form changes and notify parent
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onConfigChangeRef.current) {
        onConfigChangeRef.current(value as WidgetFormData);
      }
    });

    return () => subscription.unsubscribe();
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
          layout={watchLayout}
          autoRotate={watchAutoRotate}
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
