import { Control, useController } from "react-hook-form";
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
import { cn } from "@workspace/ui/lib/utils";
import {
  LayoutGrid,
  List,
  Columns3,
  Heart,
  GalleryHorizontal,
  MoveHorizontal,
  Sun,
  Moon,
  Monitor,
  Crown,
} from "lucide-react";
import type { WidgetFormData } from "./widget-form";
import { PRO_LAYOUTS } from "@workspace/types";
import {
  PremiumWarningBanner,
  LockedToggle,
} from "@/components/paywall/PaywallComponents";
import { ConditionalColorPicker } from "@/components/conditional-color-picker";

// Layout options with visual icons
const layouts = [
  {
    id: "grid",
    label: "Grid",
    icon: LayoutGrid,
    description: "Card-based layout",
  },
  { id: "list", label: "List", icon: List, description: "Vertical stack" },
  {
    id: "carousel",
    label: "Carousel",
    icon: GalleryHorizontal,
    description: "Rotating testimonials",
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
  {
    id: "marquee",
    label: "Marquee",
    icon: MoveHorizontal,
    description: "Infinite scroll",
  },
] as const;

// Theme options with icons
const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "auto", label: "Auto", icon: Monitor },
] as const;

interface WidgetBasicSectionProps {
  control: Control<WidgetFormData>;
  isPro?: boolean;
}

export function WidgetBasicSection({
  control,
  isPro = false,
}: WidgetBasicSectionProps) {
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                  {layouts.map((layout) => {
                    const Icon = layout.icon;
                    const isSelected = field.value === layout.id;
                    const isPro = (PRO_LAYOUTS as readonly string[]).includes(
                      layout.id,
                    );
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => field.onChange(layout.id)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 p-4 rounded-lg border transition-all text-center",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50",
                        )}
                      >
                        {isPro && (
                          <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Crown className="h-2.5 w-2.5" />
                            Pro
                          </span>
                        )}
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

        {/* Pro Layout Warning Banner — teaser pattern */}
        <FormField
          control={control}
          name="layout"
          render={({ field }) => {
            const isProLayout = (PRO_LAYOUTS as readonly string[]).includes(
              field.value,
            );
            return (
              <PremiumWarningBanner
                show={!isPro && isProLayout}
                featureName={`${field.value.charAt(0).toUpperCase() + field.value.slice(1)} layout`}
                requiredPlan="pro"
              />
            );
          }}
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
  isPro?: boolean;
}

export function WidgetAppearanceSection({
  control,
  isPro = false,
}: WidgetAppearanceSectionProps) {
  const { field: primaryColorField } = useController({
    control,
    name: "primaryColor",
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Appearance
      </h3>
      <div className="rounded-lg border p-4">
        <ConditionalColorPicker
          isPro={isPro}
          value={primaryColorField.value || ""}
          onChange={(hex) => primaryColorField.onChange(hex)}
          label="Accent Color"
          description="Brand color for highlights and actions"
        />
      </div>
    </div>
  );
}

interface WidgetDisplaySectionProps {
  control: Control<WidgetFormData>;
  isPro?: boolean;
}

export function WidgetDisplaySection({
  control,
  isPro = false,
}: WidgetDisplaySectionProps) {
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

      {/* Branding Toggle — Pro gated with LockedToggle */}
      <FormField
        control={control}
        name="showBranding"
        render={({ field }) => (
          <FormItem>
            <LockedToggle
              isPro={isPro}
              featureName="remove_branding"
              checked={!field.value}
              onCheckedChange={(checked) => field.onChange(!checked)}
              label="Remove 'Powered by Tresta'"
              description="Hide the attribution badge from your widget"
            />
          </FormItem>
        )}
      />
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

interface WidgetAdvancedSectionProps {
  control: Control<WidgetFormData>;
  isPro?: boolean;
}

export function WidgetAdvancedSection({
  control,
  isPro = false,
}: WidgetAdvancedSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Advanced
        </h3>
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Crown className="h-2.5 w-2.5" />
          Pro
        </span>
      </div>

      <FormField
        control={control}
        name="customCss"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custom CSS</FormLabel>
            <FormDescription>
              Inject custom styles to override default widget styling.
            </FormDescription>
            <FormControl>
              {isPro ? (
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder=".tresta-card { background: black; }"
                  {...field}
                />
              ) : (
                <div className="relative">
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono opacity-50 cursor-not-allowed"
                    placeholder=".tresta-card { background: black; }"
                    disabled
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/5 backdrop-blur-[1px]">
                    <div className="bg-background/80 px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Upgrade to edit Custom CSS
                    </div>
                  </div>
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
