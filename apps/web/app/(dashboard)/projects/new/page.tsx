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
  const { isPro, usage, plan, isLoading } = useSubscription();

  const isLimitReached =
    !isPro &&
    usage?.projects !== undefined &&
    plan?.limits?.projects !== undefined &&
    usage.projects >= plan.limits.projects;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLimitReached) {
    return (
      <div className="container mx-auto max-w-lg py-16 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <span className="text-4xl">🛑</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Project Limit Reached</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          You have reached the maximum number of projects for your current plan.
          Upgrade to Pro to create unlimited projects.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/dashboard/settings">Upgrade to Pro</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

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
