"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { Separator } from "@workspace/ui/components/separator";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";
import type { Project } from "@/types/api";
import {
  formConfigSchema,
  FormConfigFormData,
  convertFormConfigToPayload,
  convertFormConfigToForm,
} from "@/lib/schemas/form-config-schema";
import { projects } from "@/lib/queries";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

interface FormConfigSettingsProps {
  project: Project;
}

export function FormConfigSettings({ project }: FormConfigSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = projects.mutations.useUpdate(project.slug);

  const form = useForm<FormConfigFormData>({
    resolver: zodResolver(formConfigSchema),
    defaultValues: convertFormConfigToForm(project.formConfig),
  });

  const onSubmit = async (data: FormConfigFormData) => {
    setIsSubmitting(true);
    try {
      const payload = convertFormConfigToPayload(data);
      await updateMutation.mutateAsync({ formConfig: payload });
      toast.success("Collection form settings updated successfully!");
    } catch (error: any) {
      console.error("Failed to update form config:", error);
      toast.error(error?.message || "Failed to update form settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const enableRating = form.watch("enableRating");
  const enableJobTitle = form.watch("enableJobTitle");
  const enableCompany = form.watch("enableCompany");
  const enableAvatar = form.watch("enableAvatar");
  const enableVideoUrl = form.watch("enableVideoUrl");
  const enableGoogleVerification = form.watch("enableGoogleVerification");

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Collection Form Settings</AlertTitle>
        <AlertDescription>
          Customize the testimonial collection form that your customers see.
          Changes apply immediately to your public collection page.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Custom Text Section */}
          <div>
            <h3 className="text-base font-semibold mb-4">Custom Text</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="headerTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Header Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Share Your Experience" {...field} />
                    </FormControl>
                    <FormDescription>
                      Custom heading shown at the top of the form. Leave empty
                      for the default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headerDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="We'd love to hear about your experience..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Custom description below the heading. Leave empty for the
                      default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thankYouMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thank You Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Thank you for sharing your experience!"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Shown on the success screen after submission. Leave empty
                      for the default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Field Visibility Section */}
          <div>
            <h3 className="text-base font-semibold mb-1">Field Visibility</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which optional fields appear on your collection form. Name,
              email, and testimonial content are always required.
            </p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enableRating"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Star Rating</FormLabel>
                      <FormDescription>
                        Allow customers to give a 1–5 star rating
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // If disabling rating, also disable requireRating
                          if (!checked) {
                            form.setValue("requireRating", false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableJobTitle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Job Title / Role
                      </FormLabel>
                      <FormDescription>
                        Show field for role or job title (e.g., "CEO",
                        "Developer")
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("requireJobTitle", false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableCompany"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Company</FormLabel>
                      <FormDescription>
                        Show field for company or organization name
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("requireCompany", false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableAvatar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Photo / Avatar Upload
                      </FormLabel>
                      <FormDescription>
                        Allow customers to upload a profile photo
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("requireAvatar", false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableVideoUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Video Testimonial URL
                      </FormLabel>
                      <FormDescription>
                        Show field for video testimonial link (YouTube, Loom,
                        etc.)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("requireVideoUrl", false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableGoogleVerification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Google Verification
                      </FormLabel>
                      <FormDescription>
                        Show "Sign in with Google" for identity verification
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("requireGoogleVerification", false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Field Requirements Section */}
          <div>
            <h3 className="text-base font-semibold mb-1">Field Requirements</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Make optional fields mandatory for submission.
            </p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="requireRating"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Star Rating
                      </FormLabel>
                      <FormDescription>
                        Customers must select a star rating before submitting
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enableRating}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireJobTitle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Job Title / Role
                      </FormLabel>
                      <FormDescription>
                        Customers must provide their role when submitting
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enableJobTitle}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireCompany"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Company</FormLabel>
                      <FormDescription>
                        Customers must provide their company name
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enableCompany}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireAvatar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Profile Picture
                      </FormLabel>
                      <FormDescription>
                        Customers must provide an avatar image
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enableAvatar}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireVideoUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Video URL
                      </FormLabel>
                      <FormDescription>
                        Customers must include a video testimonial link
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enableVideoUrl}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Submission Behavior Section */}
          <div>
            <h3 className="text-base font-semibold mb-1">Submission Behavior</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Control how users can submit testimonials.
            </p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="requireGoogleVerification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require Google Verification
                      </FormLabel>
                      <FormDescription>
                        Only users verified through Google can submit
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!enableGoogleVerification}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowAnonymousSubmissions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Anonymous Submissions
                      </FormLabel>
                      <FormDescription>
                        Allow users to submit without storing IP and device data
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Fingerprint Opt-Out
                      </FormLabel>
                      <FormDescription>
                        Show reviewers a checkbox to opt out of IP/device logging
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
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div>
            <h3 className="text-base font-semibold mb-1">Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure notifications for new submissions.
            </p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notifyOnSubmission"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Notify on New Submission
                      </FormLabel>
                      <FormDescription>
                        Send project owner notifications when a testimonial is submitted
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isDirty}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
