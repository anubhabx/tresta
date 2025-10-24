"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { CustomFormField } from "@/components/custom-form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Switch } from "@workspace/ui/components/switch";
import { Slider } from "@workspace/ui/components/slider";
import { Loader2 } from "lucide-react";
import type { Widget, WidgetConfig } from "@/lib/queries/widgets";

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
            <CardDescription>
              Configure the widget type and layout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="embedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select embed type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                      <SelectItem value="wall">Wall of Love</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how testimonials will be displayed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="layout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layout Style</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                      <SelectItem value="wall">Wall</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize colors and visual style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomFormField
              type="text"
              control={form.control}
              name="primaryColor"
              label="Primary Color"
              placeholder="#0066FF"
              description="Main brand color for the widget"
            />

            <CustomFormField
              type="text"
              control={form.control}
              name="secondaryColor"
              label="Secondary Color"
              placeholder="#00CC99"
              description="Secondary accent color"
            />

            <FormField
              control={form.control}
              name="cardStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Style</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="bordered">Bordered</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="animation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
            <CardDescription>
              Choose what information to show
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="showRating"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Rating</FormLabel>
                    <FormDescription>
                      Display star ratings on testimonials
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showDate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Date</FormLabel>
                    <FormDescription>
                      Display submission date on testimonials
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showAvatar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Avatar</FormLabel>
                    <FormDescription>
                      Display author avatar placeholders
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Layout Settings</CardTitle>
            <CardDescription>
              Configure layout-specific options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="maxTestimonials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Testimonials</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="text-sm text-muted-foreground text-right">
                        {field.value} testimonials
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Maximum number of testimonials to display
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchLayout === "grid" || watchLayout === "masonry") && (
              <FormField
                control={form.control}
                name="columns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Columns</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={1}
                          max={6}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="text-sm text-muted-foreground text-right">
                          {field.value} columns
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Number of columns in grid layout
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchLayout === "carousel" && (
              <>
                <FormField
                  control={form.control}
                  name="autoRotate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto Rotate
                        </FormLabel>
                        <FormDescription>
                          Automatically cycle through testimonials
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchAutoRotate && (
                  <FormField
                    control={form.control}
                    name="rotateInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rotation Interval</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Slider
                              min={1000}
                              max={30000}
                              step={1000}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                            <div className="text-sm text-muted-foreground text-right">
                              {field.value / 1000} seconds
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Time between automatic rotations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

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
