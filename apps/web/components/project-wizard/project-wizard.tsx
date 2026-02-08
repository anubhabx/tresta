/**
 * Project Wizard - Main Container Component
 *
 * A split-view project creation experience with real-time preview.
 * Left panel: Configuration form
 * Right panel: Live preview of testimonial widget
 */

"use client";

import * as React from "react";
import { useCallback, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

// UI Components
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";

// Icons
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

// Project Wizard Components
import { ProjectWizardHeader } from "./project-wizard-header";
import { ProjectWizardPreview } from "./project-wizard-preview";
import { IdentitySection } from "./sections/identity-section";
import { BrandingWizardSection } from "./sections/branding-section";
import { AdvancedSection } from "./sections/advanced-section";

// Hooks & Schema
import { useApi } from "@/hooks/use-api";
import { useSubscription } from "@/hooks/use-subscription";
import { projects } from "@/lib/queries";
import {
  projectFormSchema,
  ProjectFormData,
  generateSlug,
} from "@/lib/schemas/project-schema";
import { ProjectType, ProjectVisibility, type SocialLinks } from "@/types/api";

// Types
import type {
  ProjectWizardFormData,
  IndustryPreset,
  ProjectIdentity,
} from "./types";

// ============================================================================
// CONSTANTS
// ============================================================================

// Soft solid colors for project identity (when no logo)
const PROJECT_COLORS = [
  {
    id: "violet",
    bg: "bg-violet-100",
    text: "text-violet-600",
    hex: "#8b5cf6",
  },
  { id: "blue", bg: "bg-blue-100", text: "text-blue-600", hex: "#3b82f6" },
  {
    id: "emerald",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    hex: "#10b981",
  },
  { id: "amber", bg: "bg-amber-100", text: "text-amber-600", hex: "#f59e0b" },
  { id: "rose", bg: "bg-rose-100", text: "text-rose-600", hex: "#f43f5e" },
  { id: "slate", bg: "bg-slate-100", text: "text-slate-600", hex: "#64748b" },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRandomColor(): (typeof PROJECT_COLORS)[number] {
  const index = Math.floor(Math.random() * PROJECT_COLORS.length);
  return PROJECT_COLORS[index]!;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ProjectWizardProps {
  /** Initial data for editing (optional) */
  initialData?: Partial<ProjectFormData>;
  /** Mode: create or edit */
  mode?: "create" | "edit";
}

export function ProjectWizard({
  initialData,
  mode = "create",
}: ProjectWizardProps) {
  const router = useRouter();
  const api = useApi();
  const createProject = projects.mutations.useCreate();
  const {
    isPro,
    usage,
    plan,
    isLoading: subscriptionLoading,
  } = useSubscription();

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() => getRandomColor());
  const [selectedPreset, setSelectedPreset] = useState<IndustryPreset>("OTHER");

  // Initialize form with react-hook-form
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      slug: initialData?.slug || "",
      logoUrl: initialData?.logoUrl || "",
      projectType: initialData?.projectType || ProjectType.OTHER,
      websiteUrl: initialData?.websiteUrl || "",
      collectionFormUrl: initialData?.collectionFormUrl || "",
      brandColorPrimary: initialData?.brandColorPrimary || "",
      brandColorSecondary: initialData?.brandColorSecondary || "",
      visibility: initialData?.visibility || ProjectVisibility.PRIVATE,
      twitter: initialData?.twitter || "",
      linkedin: initialData?.linkedin || "",
      github: initialData?.github || "",
      facebook: initialData?.facebook || "",
      instagram: initialData?.instagram || "",
      youtube: initialData?.youtube || "",
      tagsInput: initialData?.tagsInput || "",
    },
  });

  const watchedValues = form.watch();

  // Watch specific values to ensure preview updates
  const watchedLogoUrl = form.watch("logoUrl");
  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const watchedPrimaryColor = form.watch("brandColorPrimary");
  const watchedSecondaryColor = form.watch("brandColorSecondary");

  // Compute project identity for preview
  const projectIdentity = useMemo<ProjectIdentity>(
    () => ({
      name: watchedName || "My Project",
      slug: watchedSlug || "my-project",
      logoUrl: watchedLogoUrl,
      accentColor: selectedColor,
      primaryColor: watchedPrimaryColor,
      secondaryColor: watchedSecondaryColor,
    }),
    [
      watchedName,
      watchedSlug,
      watchedLogoUrl,
      watchedPrimaryColor,
      watchedSecondaryColor,
      selectedColor,
    ],
  );

  // Handle preset change
  const handlePresetChange = useCallback(
    (preset: IndustryPreset) => {
      setSelectedPreset(preset);
      // Map preset to ProjectType
      const typeMap: Record<IndustryPreset, ProjectType> = {
        SAAS: ProjectType.SAAS_APP,
        ECOMMERCE: ProjectType.E_COMMERCE,
        AGENCY: ProjectType.AGENCY,
        OTHER: ProjectType.OTHER,
      };
      form.setValue("projectType", typeMap[preset]);
    },
    [form],
  );

  // Handle form submission
  const handleSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);

      // Build social links object
      const socialLinks: SocialLinks = {};
      if (data.twitter) socialLinks.twitter = data.twitter;
      if (data.linkedin) socialLinks.linkedin = data.linkedin;
      if (data.github) socialLinks.github = data.github;
      if (data.facebook) socialLinks.facebook = data.facebook;
      if (data.instagram) socialLinks.instagram = data.instagram;
      if (data.youtube) socialLinks.youtube = data.youtube;

      // Parse tags from comma-separated string
      const tags = data.tagsInput
        ? data.tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

      // Create project payload
      const payload = {
        name: data.name,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        slug: data.slug,
        logoUrl: data.logoUrl || undefined,
        projectType: data.projectType,
        websiteUrl: data.websiteUrl || undefined,
        collectionFormUrl: data.collectionFormUrl || undefined,
        brandColorPrimary: data.brandColorPrimary || undefined,
        brandColorSecondary: data.brandColorSecondary || undefined,
        socialLinks:
          Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        tags: tags.length > 0 ? tags : undefined,
        visibility: data.visibility,
        // Store emoji and gradient as metadata (if your schema supports it)
        // metadata: { emoji: selectedEmoji, gradient: selectedGradient },
      };

      await createProject.mutateAsync(payload);

      toast.success("Project created successfully!", {
        description: "You can now start collecting testimonials.",
      });
      router.push(`/projects/${data.slug}`);
    } catch (error: any) {
      toast.error(
        error.message || "Failed to create project. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check project limit
  const isLimitReached =
    !isPro &&
    usage?.projects !== undefined &&
    plan?.limits?.projects !== undefined &&
    usage.projects >= plan.limits.projects;

  if (subscriptionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLimitReached) {
    return (
      <div className="container mx-auto max-w-lg py-16 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-destructive/10">
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
            <Link href="/account?tab=billing">Upgrade to Pro</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ProjectWizardHeader
        mode={mode}
        isSubmitting={isSubmitting}
        onBack={() => router.back()}
      />

      {/* Main Content - Split View */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Configuration Form */}
          <div className="lg:col-span-5 xl:col-span-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    e.target instanceof HTMLInputElement
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                {/* Identity Section */}
                <IdentitySection
                  control={form.control}
                  setValue={form.setValue}
                  getValues={form.getValues}
                  watch={form.watch}
                  selectedColor={selectedColor}
                  selectedPreset={selectedPreset}
                  onColorChange={setSelectedColor}
                  onPresetChange={handlePresetChange}
                />

                {/* Branding Section */}
                <BrandingWizardSection control={form.control} isPro={isPro} />

                {/* Advanced Section (Accordion) */}
                <AdvancedSection
                  control={form.control}
                  register={form.register}
                  isPro={isPro}
                />

                <Separator />

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Column - Live Preview */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="lg:sticky lg:top-6">
              <ProjectWizardPreview
                projectIdentity={projectIdentity}
                theme={watchedValues.brandColorPrimary ? "custom" : "auto"}
                isPro={isPro}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectWizard;
