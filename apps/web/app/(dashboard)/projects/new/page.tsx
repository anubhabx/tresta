"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { Separator } from "@workspace/ui/components/separator";
import { useProjectForm } from "@/hooks/use-project-form";
import {
  BasicInfoSection,
  URLsSection,
  BrandingSection,
  SocialLinksSection,
  TagsSection,
} from "@/components/forms/project";

import { useSubscription } from "@/hooks/use-subscription";

export default function NewProjectPage() {
  const { form, isSubmitting, handleLogoUpload, onSubmit } = useProjectForm();
  const { isPro } = useSubscription();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Set up your project to start collecting testimonials
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="space-y-8"
          onKeyDown={(e) => {
            // Prevent form submission on Enter key
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
        >
          <BasicInfoSection
            control={form.control}
            setValue={form.setValue}
            getValues={form.getValues}
            watch={form.watch}
          />

          <URLsSection control={form.control} />

          <BrandingSection
            control={form.control}
            onLogoUpload={handleLogoUpload}
            isPro={isPro}
          />

          <SocialLinksSection control={form.control} />

          <TagsSection register={form.register} />

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
