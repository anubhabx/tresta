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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Slider } from "@workspace/ui/components/slider";
import { CustomFormField } from "@/components/custom-form-field";
import type { WidgetFormData } from "./widget-form";

interface WidgetBasicSectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetBasicSection({ control }: WidgetBasicSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Settings</CardTitle>
        <CardDescription>Configure the widget layout and theme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="layout"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layout Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormDescription>
                Choose how testimonials will be displayed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
  );
}

interface WidgetAppearanceSectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetAppearanceSection({
  control,
}: WidgetAppearanceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize colors and visual style</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomFormField
          type="text"
          control={control}
          name="primaryColor"
          label="Primary Color"
          placeholder="#0066FF"
          description="Main brand color for the widget"
        />

        <CustomFormField
          type="text"
          control={control}
          name="secondaryColor"
          label="Secondary Color"
          placeholder="#00CC99"
          description="Secondary accent color"
        />

        <FormField
          control={control}
          name="cardStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          control={control}
          name="animation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
  );
}

interface WidgetDisplaySectionProps {
  control: Control<WidgetFormData>;
}

export function WidgetDisplaySection({ control }: WidgetDisplaySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Options</CardTitle>
        <CardDescription>Choose what information to show</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
  );
}

interface WidgetLayoutSectionProps {
  control: Control<WidgetFormData>;
  layout: string;
  autoRotate: boolean;
}

export function WidgetLayoutSection({
  control,
  layout,
  autoRotate,
}: WidgetLayoutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout Settings</CardTitle>
        <CardDescription>Configure layout-specific options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
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

        {(layout === "grid" || layout === "masonry") && (
          <FormField
            control={control}
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
                <FormDescription>Number of columns in the grid</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {layout === "carousel" && (
          <>
            <FormField
              control={control}
              name="autoRotate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto Rotate</FormLabel>
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

            {autoRotate && (
              <FormField
                control={control}
                name="rotateInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rotation Interval (ms)</FormLabel>
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
                          {field.value / 1000}s between rotations
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
  );
}
