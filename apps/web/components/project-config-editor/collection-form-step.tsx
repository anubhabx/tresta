"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
  RefreshCw,
  Star,
  Briefcase,
  Building2,
  Camera,
  Video,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AzureFileUpload } from "@/components/forms/fields/azure-file-upload";
import { UploadDirectory } from "@/hooks/use-azure-sas";
import { ConditionalColorPicker } from "@/components/forms/fields/conditional-color-picker";
import type { FormConfig, Project } from "@/types/api";

// ============================================================================
// SCHEMA
// ============================================================================

export const step1Schema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Name must be less than 255 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  logoUrl: z.string().optional().or(z.literal("")),
  brandColorPrimary: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  headerTitle: z
    .string()
    .max(200, "Header title must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  headerDescription: z
    .string()
    .max(500, "Header description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  thankYouMessage: z
    .string()
    .max(500, "Thank you message must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  enableRating: z.boolean(),
  enableJobTitle: z.boolean(),
  enableCompany: z.boolean(),
  enableAvatar: z.boolean(),
  enableVideoUrl: z.boolean(),
  enableGoogleVerification: z.boolean(),
  requireRating: z.boolean(),
  requireJobTitle: z.boolean(),
  requireCompany: z.boolean(),
  requireAvatar: z.boolean(),
  requireVideoUrl: z.boolean(),
  requireGoogleVerification: z.boolean(),
  allowAnonymousSubmissions: z.boolean(),
  allowFingerprintOptOut: z.boolean(),
  notifyOnSubmission: z.boolean(),
});

export type Step1FormData = z.infer<typeof step1Schema>;

// ============================================================================
// HELPERS
// ============================================================================

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

function getDefaultValues(project?: Project | null): Step1FormData {
  return {
    name: project?.name ?? "",
    slug: project?.slug ?? "",
    logoUrl: project?.logoUrl ?? "",
    brandColorPrimary: project?.brandColorPrimary ?? "#3B82F6",
    headerTitle: project?.formConfig?.headerTitle ?? "",
    headerDescription: project?.formConfig?.headerDescription ?? "",
    thankYouMessage: project?.formConfig?.thankYouMessage ?? "",
    enableRating: project?.formConfig?.enableRating ?? true,
    enableJobTitle: project?.formConfig?.enableJobTitle ?? true,
    enableCompany: project?.formConfig?.enableCompany ?? true,
    enableAvatar: project?.formConfig?.enableAvatar ?? true,
    enableVideoUrl: project?.formConfig?.enableVideoUrl ?? false,
    enableGoogleVerification:
      project?.formConfig?.enableGoogleVerification ?? false,
    requireRating: project?.formConfig?.requireRating ?? false,
    requireJobTitle: project?.formConfig?.requireJobTitle ?? false,
    requireCompany: project?.formConfig?.requireCompany ?? false,
    requireAvatar: project?.formConfig?.requireAvatar ?? false,
    requireVideoUrl: project?.formConfig?.requireVideoUrl ?? false,
    requireGoogleVerification:
      project?.formConfig?.requireGoogleVerification ?? false,
    allowAnonymousSubmissions:
      project?.formConfig?.allowAnonymousSubmissions ?? true,
    allowFingerprintOptOut:
      project?.formConfig?.allowFingerprintOptOut ?? false,
    notifyOnSubmission: project?.formConfig?.notifyOnSubmission ?? false,
  };
}

// ============================================================================
// FIELD TOGGLE ROW
// ============================================================================

interface FieldToggleRowProps {
  icon: React.ReactNode;
  label: string;
  enabledValue: boolean;
  requiredValue: boolean;
  onEnableChange: (v: boolean) => void;
  onRequireChange: (v: boolean) => void;
  disabled?: boolean;
}

function FieldToggleRow({
  icon,
  label,
  enabledValue,
  requiredValue,
  onEnableChange,
  onRequireChange,
  disabled,
}: FieldToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded-lg border transition-colors",
        enabledValue ? "bg-background border-border" : "bg-muted/30 border-border/50",
        disabled && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-muted-foreground flex-shrink-0">{icon}</span>
        <span
          className={cn(
            "text-sm font-medium truncate",
            !enabledValue && "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        {enabledValue && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Required</span>
            <Switch
              checked={requiredValue}
              onCheckedChange={onRequireChange}
              disabled={disabled}
              className="scale-75 origin-right"
            />
          </div>
        )}
        <Switch
          checked={enabledValue}
          onCheckedChange={onEnableChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export interface CollectionFormStepRef {
  submit: () => Promise<Step1FormData | null>;
}

interface CollectionFormStepProps {
  project?: Project | null;
  isPro?: boolean;
  onPreviewChange?: (data: Step1FormData) => void;
}

export const CollectionFormStep = forwardRef<
  CollectionFormStepRef,
  CollectionFormStepProps
>(function CollectionFormStep({ project, isPro = false, onPreviewChange }, ref) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    !!project?.slug,
  );

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: getDefaultValues(project),
  });

  // Re-populate form when project data loads
  useEffect(() => {
    if (project) {
      form.reset(getDefaultValues(project));
      setIsSlugManuallyEdited(true);
    }
  }, [project, form]);

  // Expose submit via ref
  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise<Step1FormData | null>((resolve) => {
        form.handleSubmit(
          (data) => resolve(data),
          () => resolve(null),
        )();
      }),
  }));

  // Notify parent of preview changes with debounce
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const watched = useWatch({ control: form.control });

  useEffect(() => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
      if (onPreviewChange) {
        onPreviewChange(watched as Step1FormData);
      }
    }, 150);
    return () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
  }, [watched, onPreviewChange]);

  // Auto-generate slug from name (only when not manually edited)
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isSlugManuallyEdited && watchedName) {
      const generated = generateSlug(watchedName);
      form.setValue("slug", generated, { shouldValidate: false });
    }
  }, [watchedName, isSlugManuallyEdited, form]);

  const watchedSlug = form.watch("slug");
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const collectionUrl = `${origin}/testimonials/${watchedSlug || "your-project"}`;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* ── Project Identity ─────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Project Identity
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basic info shown to people filling out your form
            </p>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Product" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <div className="flex flex-1 items-center rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                      <span className="px-3 py-2 text-xs text-muted-foreground bg-muted border-r border-input whitespace-nowrap">
                        /testimonials/
                      </span>
                      <input
                        {...field}
                        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                        placeholder="your-project"
                        onChange={(e) => {
                          field.onChange(e);
                          setIsSlugManuallyEdited(true);
                        }}
                      />
                    </div>
                  </FormControl>
                  {isSlugManuallyEdited && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 flex-shrink-0"
                      title="Reset to auto-generated slug"
                      onClick={() => {
                        setIsSlugManuallyEdited(false);
                        const generated = generateSlug(form.getValues("name"));
                        form.setValue("slug", generated, {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <FormDescription className="text-xs">
                  <span className="font-mono text-xs">{collectionUrl}</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <AzureFileUpload
            control={form.control}
            name="logoUrl"
            label="Project Logo"
            directory={UploadDirectory.LOGOS}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            maxSizeMB={5}
            description="PNG, JPG, SVG or WebP (max 5MB)"
          />

          <FormField
            control={form.control}
            name="brandColorPrimary"
            render={({ field }) => (
              <FormItem>
                <ConditionalColorPicker
                  isPro={isPro}
                  value={field.value || "#3B82F6"}
                  onChange={field.onChange}
                  label="Brand Color"
                  description="Accent color shown on your collection form"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* ── Form Text ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Form Text
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize the text shown on your collection form
            </p>
          </div>

          <FormField
            control={form.control}
            name="headerTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Header Title{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Share your experience"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headerDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Header Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your experience with us"
                    className="resize-none"
                    rows={2}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thankYouMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Thank You Message{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="We truly appreciate your feedback!"
                    className="resize-none"
                    rows={2}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Shown after a successful submission
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* ── Field Visibility ─────────────────────────────────────── */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Form Fields
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose which fields appear on your form and whether they&apos;re
              required
            </p>
          </div>

          <div className="space-y-2">
            <FieldToggleRow
              icon={<Star className="h-4 w-4" />}
              label="Star Rating"
              enabledValue={form.watch("enableRating")}
              requiredValue={form.watch("requireRating")}
              onEnableChange={(v) => {
                form.setValue("enableRating", v);
                if (!v) form.setValue("requireRating", false);
              }}
              onRequireChange={(v) => form.setValue("requireRating", v)}
            />

            <FieldToggleRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Job Title"
              enabledValue={form.watch("enableJobTitle")}
              requiredValue={form.watch("requireJobTitle")}
              onEnableChange={(v) => {
                form.setValue("enableJobTitle", v);
                if (!v) form.setValue("requireJobTitle", false);
              }}
              onRequireChange={(v) => form.setValue("requireJobTitle", v)}
            />

            <FieldToggleRow
              icon={<Building2 className="h-4 w-4" />}
              label="Company"
              enabledValue={form.watch("enableCompany")}
              requiredValue={form.watch("requireCompany")}
              onEnableChange={(v) => {
                form.setValue("enableCompany", v);
                if (!v) form.setValue("requireCompany", false);
              }}
              onRequireChange={(v) => form.setValue("requireCompany", v)}
            />

            <FieldToggleRow
              icon={<Camera className="h-4 w-4" />}
              label="Profile Photo"
              enabledValue={form.watch("enableAvatar")}
              requiredValue={form.watch("requireAvatar")}
              onEnableChange={(v) => {
                form.setValue("enableAvatar", v);
                if (!v) form.setValue("requireAvatar", false);
              }}
              onRequireChange={(v) => form.setValue("requireAvatar", v)}
            />

            <FieldToggleRow
              icon={<Video className="h-4 w-4" />}
              label="Video URL"
              enabledValue={form.watch("enableVideoUrl")}
              requiredValue={form.watch("requireVideoUrl")}
              onEnableChange={(v) => {
                form.setValue("enableVideoUrl", v);
                if (!v) form.setValue("requireVideoUrl", false);
              }}
              onRequireChange={(v) => form.setValue("requireVideoUrl", v)}
            />

            <FieldToggleRow
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Google Verification"
              enabledValue={form.watch("enableGoogleVerification")}
              requiredValue={form.watch("requireGoogleVerification")}
              onEnableChange={(v) => {
                form.setValue("enableGoogleVerification", v);
                if (!v) form.setValue("requireGoogleVerification", false);
              }}
              onRequireChange={(v) =>
                form.setValue("requireGoogleVerification", v)
              }
            />
          </div>
        </div>

        {/* ── Submission Behavior (Advanced) ───────────────────────── */}
        <Accordion type="single" collapsible>
          <AccordionItem value="submission" className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                Submission Behavior
                <Badge variant="outline" className="text-xs font-normal">
                  Advanced
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-0 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="allowAnonymousSubmissions"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">
                        Allow Anonymous Submissions
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Let users submit without sharing their IP/device data
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
                name="allowFingerprintOptOut"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">
                        Allow Fingerprint Opt-Out
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Show reviewers a checkbox to skip IP/device logging
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
                name="notifyOnSubmission"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">
                        Email Notifications
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Get notified by email when a new testimonial is
                        submitted
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
});
