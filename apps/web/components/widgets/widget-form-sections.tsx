import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Slider } from "@workspace/ui/components/slider";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import {
  LayoutGrid,
  List,
  Columns3,
  Heart,
  GalleryHorizontal,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import type { WidgetFormData } from "./widget-form";

// Layout options with visual icons
const layouts = [
  {
    id: "carousel",
    label: "Carousel",
    icon: GalleryHorizontal,
    description: "Rotating testimonials",
  },
  {
    id: "grid",
    label: "Grid",
    icon: LayoutGrid,
    description: "Card-based layout",
  },
  {
    id: "masonry",
    label: "Masonry",
    icon: Columns3,
    description: "Pinterest-style",
  },
  {
    id: "wall",
    label: "Wall of Love",
    icon: Heart,
    description: "Dense, impactful",
  },
  { id: "list", label: "List", icon: List, description: "Vertical stack" },
] as const;

// Theme options with icons
const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "auto", label: "Auto", icon: Monitor },
] as const;

interface WidgetBasicSectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetBasicSection({ control }: WidgetBasicSectionProps) {
  return (
    <div className="space-y-6">
      {/* Layout Selector - Visual Thumbnails */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Layout
        </h3>
        <FormField
          control={control}
          name="layout"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {layouts.map((layout) => {
                    const Icon = layout.icon;
                    const isSelected = field.value === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => field.onChange(layout.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all text-center",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {layout.label}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {layout.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Theme Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Theme
        </h3>
        <FormField
          control={control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((theme) => {
                    const Icon = theme.icon;
                    const isSelected = field.value === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => field.onChange(theme.id)}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {theme.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

interface WidgetAppearanceSectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetAppearanceSection({
  control,
}: WidgetAppearanceSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Appearance
      </h3>
      <FormField
        control={control}
        name="primaryColor"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Accent Color</FormLabel>
                <FormDescription>
                  Brand color for highlights and actions
                </FormDescription>
              </div>
              <FormControl>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-10 w-10 rounded-md border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-24 h-10 px-3 text-sm font-mono rounded-md border border-border bg-background"
                    placeholder="#2563EB"
                  />
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

interface WidgetDisplaySectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetDisplaySection({ control }: WidgetDisplaySectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Display Options
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="showRating"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">
                  Show ratings
                </FormLabel>
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
          control={control}
          name="showAvatar"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">
                  Show avatars
                </FormLabel>
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
      </div>
    </div>
  );
}

interface WidgetLayoutSectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetLayoutSection({ control }: WidgetLayoutSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Limits
      </h3>
      <FormField
        control={control}
        name="maxTestimonials"
        render={({ field }) => (
          <FormItem className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <FormLabel className="text-sm font-medium">
                Maximum testimonials
              </FormLabel>
              <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {field.value}
              </span>
            </div>
            <FormControl>
              <Slider
                min={1}
                max={20}
                step={1}
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                className="py-2"
              />
            </FormControl>
            <FormDescription className="mt-2">
              Limit how many testimonials the embed renders
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
