"use client";

import { useForm } from "react-hook-form";
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
import { WidgetPreview } from "./widget-preview";

const widgetFormSchema = z.object({
  embedType: z.string().min(1, "Embed type is required"),
  layout: z.enum(["carousel", "grid", "masonry", "wall"]),
  theme: z.enum(["light", "dark", "auto"]),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  showRating: z.boolean(),
  showDate: z.boolean(),
  showAvatar: z.boolean(),
  maxTestimonials: z.number().min(1).max(100),
  autoRotate: z.boolean(),
  rotateInterval: z.number().min(1000).max(30000),
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
}

export function WidgetForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WidgetFormProps) {
  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: initialData
      ? {
          embedType: initialData.embedType,
          layout: (initialData.config?.layout as any) || "carousel",
          theme: (initialData.config?.theme as any) || "light",
          primaryColor: initialData.config?.primaryColor || "#0066FF",
          secondaryColor: initialData.config?.secondaryColor || "#00CC99",
          showRating: initialData.config?.showRating ?? true,
          showDate: initialData.config?.showDate ?? true,
          showAvatar: initialData.config?.showAvatar ?? false,
          maxTestimonials: initialData.config?.maxTestimonials || 10,
          autoRotate: initialData.config?.autoRotate ?? false,
          rotateInterval: initialData.config?.rotateInterval || 5000,
          columns: initialData.config?.columns || 3,
          cardStyle: (initialData.config?.cardStyle as any) || "default",
          animation: (initialData.config?.animation as any) || "fade",
        }
      : {
          embedType: "carousel",
          layout: "carousel",
          theme: "light",
          primaryColor: "#0066FF",
          secondaryColor: "#00CC99",
          showRating: true,
          showDate: true,
          showAvatar: false,
          maxTestimonials: 10,
          autoRotate: false,
          rotateInterval: 5000,
          columns: 3,
          cardStyle: "default",
          animation: "fade",
        },
  });

  const watchLayout = form.watch("layout");
  const watchAutoRotate = form.watch("autoRotate");
  const watchedValues = form.watch(); // Watch all form values for preview

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

        {/* Live Preview */}
        <WidgetPreview
          config={watchedValues}
          widgetId={initialData?.id}
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
