"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Form } from "@workspace/ui/components/form";
import { toast } from "sonner";
import { Loader2, Save, Shield, Info } from "lucide-react";
import type { Project } from "@/types/api";
import {
  moderationSettingsFormSchema,
  ModerationSettingsFormData,
  convertModerationFormToPayload,
  convertModerationPayloadToForm,
} from "@/lib/schemas/moderation-settings-schema";
import {
  CoreModerationSettings,
  AdvancedModerationSettings,
} from "@/components/forms/moderation";
import { projects } from "@/lib/queries";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

interface ModerationSettingsTabProps {
  project: Project;
}

export function ModerationSettingsTab({ project }: ModerationSettingsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = projects.mutations.useUpdate(project.slug);

  const form = useForm<ModerationSettingsFormData>({
    resolver: zodResolver(moderationSettingsFormSchema),
    defaultValues: convertModerationPayloadToForm(project),
  });

  const onSubmit = async (data: ModerationSettingsFormData) => {
    setIsSubmitting(true);
    try {
      const payload = convertModerationFormToPayload(data);
      
      await updateMutation.mutateAsync(payload);

      toast.success("Moderation settings updated successfully!");
    } catch (error: any) {
      console.error("Failed to update moderation settings:", error);
      toast.error(error?.message || "Failed to update moderation settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoModerationEnabled = form.watch("autoModeration");

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>About Auto-Moderation</AlertTitle>
        <AlertDescription>
          Auto-moderation uses advanced heuristics to analyze testimonials for
          spam, profanity, negative sentiment, and suspicious patterns. High-quality
          submissions can be auto-approved, while problematic content is flagged
          for manual review.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Core Settings */}
          <CoreModerationSettings
            control={form.control}
            watch={form.watch}
          />

          {/* Advanced Settings */}
          {autoModerationEnabled && (
            <AdvancedModerationSettings
              control={form.control}
              watch={form.watch}
            />
          )}

          {/* Info Card */}
          {autoModerationEnabled && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How Auto-Moderation Works
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  The system analyzes each testimonial using multiple checks:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>
                    <strong>Profanity Detection:</strong> Blocks severe profanity, flags mild profanity
                  </li>
                  <li>
                    <strong>Spam Detection:</strong> Checks for excessive URLs, caps, special characters, promotional language
                  </li>
                  <li>
                    <strong>Sentiment Analysis:</strong> Detects negative sentiment with negation handling ("not great" → negative)
                  </li>
                  <li>
                    <strong>Duplicate Detection:</strong> Identifies similar or identical content
                  </li>
                  <li>
                    <strong>Quality Scoring:</strong> Evaluates length, rating, and OAuth verification
                  </li>
                </ul>
                <p className="text-muted-foreground pt-2">
                  Testimonials are assigned a status: <strong>APPROVED</strong> (auto-approved),{" "}
                  <strong>PENDING</strong> (needs review), <strong>FLAGGED</strong> (suspicious),
                  or <strong>REJECTED</strong> (blocked).
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
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
