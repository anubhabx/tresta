"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/errors/http-error";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { projects, widgets } from "@/lib/queries";
import { useSubscription } from "@/hooks/use-subscription";
import type { FormConfig } from "@/types/api";
import {
  CollectionFormStep,
  type CollectionFormStepRef,
  type Step1FormData,
} from "./collection-form-step";
import { CollectionFormPreview } from "./collection-form-preview";
import {
  WidgetConfigStep,
  type WidgetConfigStepRef,
} from "./widget-config-step";

// ============================================================================
// TYPES
// ============================================================================

type EditorStep = 1 | 2;
type MobileView = "settings" | "preview";

interface ProjectConfigEditorProps {
  mode: "create" | "edit";
  slug?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProjectConfigEditor({ mode, slug }: ProjectConfigEditorProps) {
  const router = useRouter();
  const { isPro } = useSubscription();

  const [step, setStep] = useState<EditorStep>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("settings");

  // Track saved project identity for step 2
  const [savedProjectSlug, setSavedProjectSlug] = useState<string>(slug ?? "");
  const [savedProjectId, setSavedProjectId] = useState<string>("");

  // Live preview state (driven by CollectionFormStep changes)
  const [previewData, setPreviewData] = useState<Step1FormData | null>(null);

  // Refs for imperative step submission
  const step1Ref = useRef<CollectionFormStepRef>(null);
  const step2Ref = useRef<WidgetConfigStepRef>(null);

  // ── Data fetching ──────────────────────────────────────────────────────
  const { data: project, isLoading: isLoadingProject } =
    projects.queries.useDetail(mode === "edit" ? (slug ?? "") : "");

  const { data: widgetsList } = widgets.queries.useList(
    savedProjectSlug || slug || "",
  );

  const createProject = projects.mutations.useCreate();
  const updateProject = projects.mutations.useUpdate(
    savedProjectSlug || slug || "",
  );
  const createWidget = widgets.mutations.useCreate();
  const updateWidget = widgets.mutations.useUpdate(widgetsList?.[0]?.id ?? "");

  // Sync project data into local state (edit mode)
  useEffect(() => {
    if (project) {
      setSavedProjectId(project.id);
      setSavedProjectSlug(project.slug);
    }
  }, [project]);

  // ── Loading / Error states ─────────────────────────────────────────────
  if (mode === "edit" && isLoadingProject) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mode === "edit" && !isLoadingProject && !project) {
    return (
      <div className="flex flex-col gap-4 h-[60vh] items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access to it.
        </p>
        <Button asChild>
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  // ── Step 1 save ────────────────────────────────────────────────────────
  const handleStep1Save = async () => {
    if (!step1Ref.current) return;
    const data = await step1Ref.current.submit();
    if (!data) return; // validation failed — errors shown inline

    setIsSaving(true);
    try {
      const formConfig: FormConfig = {
        headerTitle: data.headerTitle || undefined,
        headerDescription: data.headerDescription || undefined,
        thankYouMessage: data.thankYouMessage || undefined,
        enableRating: data.enableRating,
        enableJobTitle: data.enableJobTitle,
        enableCompany: data.enableCompany,
        enableAvatar: data.enableAvatar,
        enableVideoUrl: data.enableVideoUrl,
        enableGoogleVerification: data.enableGoogleVerification,
        requireRating: data.requireRating,
        requireJobTitle: data.requireJobTitle,
        requireCompany: data.requireCompany,
        requireAvatar: data.requireAvatar,
        requireVideoUrl: data.requireVideoUrl,
        requireGoogleVerification: data.requireGoogleVerification,
        allowAnonymousSubmissions: data.allowAnonymousSubmissions,
        allowFingerprintOptOut: data.allowFingerprintOptOut,
        notifyOnSubmission: data.notifyOnSubmission,
      };

      const payload = {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || undefined,
        brandColorPrimary: data.brandColorPrimary || undefined,
        formConfig,
      };

      if (mode === "create") {
        const result = await createProject.mutateAsync(payload);
        setSavedProjectSlug(result.slug);
        setSavedProjectId(result.id);
        toast.success("Project created! Now configure your display widget.");
      } else {
        const result = await updateProject.mutateAsync(payload);
        setSavedProjectSlug(result.slug);
        setSavedProjectId(result.id);
        toast.success("Collection form saved!");
      }

      setStep(2);
    } catch (error: unknown) {
      toast.error(
        getHttpErrorMessage(error, "Failed to save. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Step 2 save ────────────────────────────────────────────────────────
  const handleStep2Save = async () => {
    if (!step2Ref.current) return;
    const data = await step2Ref.current.submit();
    if (!data) return;

    setIsSaving(true);
    try {
      const config = {
        layout: data.layout,
        theme: data.theme,
        primaryColor: data.primaryColor,
        showRating: data.showRating,
        showAvatar: data.showAvatar,
        showBranding: data.showBranding,
        maxTestimonials: data.maxTestimonials,
        autoRotate: data.autoRotate ?? false,
        rotateInterval: data.rotateInterval ?? 5000,
        customCss: data.customCss || "",
      };

      const existingWidget = widgetsList?.[0];
      if (existingWidget) {
        await updateWidget.mutateAsync({ config });
        toast.success("Widget updated!");
      } else {
        if (!savedProjectId) {
          toast.error("Project ID not found. Please go back and try again.");
          return;
        }
        await createWidget.mutateAsync({ projectId: savedProjectId, config });
        toast.success("Widget created!");
      }

      router.push(`/projects/${savedProjectSlug}`);
    } catch (error: unknown) {
      toast.error(
        getHttpErrorMessage(error, "Failed to save widget. Please try again."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived display values ─────────────────────────────────────────────
  const headerTitle =
    mode === "create" ? "New Project" : (project?.name ?? "Edit Project");
  const headerBackHref = mode === "edit" ? `/projects/${slug}` : "/dashboard";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                asChild
              >
                <Link href={headerBackHref}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <span className="font-semibold text-sm truncate">
                {headerTitle}
              </span>
            </div>

            {/* Center: Step pill tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (step === 2) setStep(1);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  step === 1
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground cursor-pointer",
                )}
              >
                <StepBadge num={1} completed={step > 1} active={step === 1} />
                Collection Form
              </button>
              <button
                type="button"
                onClick={() => {
                  if (step === 1) handleStep1Save();
                }}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  step === 2
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground cursor-pointer",
                  isSaving && "pointer-events-none opacity-50",
                )}
              >
                <StepBadge num={2} completed={false} active={step === 2} />
                Widget Display
              </button>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {step === 1 ? (
                <Button size="sm" onClick={handleStep1Save} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isSaving}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleStep2Save}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Finish
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile step label ────────────────────────────────────────────── */}
      <div className="sm:hidden border-b bg-muted/20 px-4 py-2">
        <div className="container mx-auto flex items-center gap-2">
          <StepBadge num={step} completed={false} active />
          <span className="text-sm font-medium">
            {step === 1 ? "Collection Form" : "Widget Display"}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            Step {step} of 2
          </span>
        </div>
      </div>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6">
        {step === 1 ? (
          // ── STEP 1 ────────────────────────────────────────────────────────
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            {/* Mobile view toggle */}
            <div className="lg:hidden col-span-full flex gap-1 bg-muted rounded-lg p-1 w-fit">
              <MobileViewButton
                active={mobileView === "settings"}
                onClick={() => setMobileView("settings")}
              >
                Settings
              </MobileViewButton>
              <MobileViewButton
                active={mobileView === "preview"}
                onClick={() => setMobileView("preview")}
              >
                Preview
              </MobileViewButton>
            </div>

            {/* Settings panel */}
            <div
              className={cn(
                "lg:col-span-5 lg:block",
                mobileView === "settings" ? "block" : "hidden",
              )}
            >
              <CollectionFormStep
                ref={step1Ref}
                project={project}
                isPro={isPro}
                onPreviewChange={setPreviewData}
              />

              {/* Mobile next button */}
              <div className="mt-6 lg:hidden">
                <Button
                  className="w-full"
                  onClick={handleStep1Save}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Next: Configure Widget
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview panel */}
            <div
              className={cn(
                "lg:col-span-7 lg:block lg:sticky lg:top-24 lg:self-start",
                mobileView === "preview" ? "block" : "hidden",
              )}
            >
              <div className="mx-auto">
                <CollectionFormPreview
                  formConfig={
                    previewData
                      ? {
                          headerTitle: previewData.headerTitle,
                          headerDescription: previewData.headerDescription,
                          thankYouMessage: previewData.thankYouMessage,
                          enableRating: previewData.enableRating,
                          enableJobTitle: previewData.enableJobTitle,
                          enableCompany: previewData.enableCompany,
                          enableAvatar: previewData.enableAvatar,
                          enableVideoUrl: previewData.enableVideoUrl,
                          enableGoogleVerification:
                            previewData.enableGoogleVerification,
                          requireRating: previewData.requireRating,
                          requireJobTitle: previewData.requireJobTitle,
                          requireCompany: previewData.requireCompany,
                          requireAvatar: previewData.requireAvatar,
                          requireVideoUrl: previewData.requireVideoUrl,
                          requireGoogleVerification:
                            previewData.requireGoogleVerification,
                          allowAnonymousSubmissions:
                            previewData.allowAnonymousSubmissions,
                          allowFingerprintOptOut:
                            previewData.allowFingerprintOptOut,
                          notifyOnSubmission: previewData.notifyOnSubmission,
                        }
                      : project?.formConfig
                  }
                  projectName={previewData?.name || project?.name}
                  projectTagline={project?.shortDescription}
                  projectDescription={project?.description}
                  logoUrl={previewData?.logoUrl || project?.logoUrl}
                  brandColorPrimary={
                    previewData?.brandColorPrimary || project?.brandColorPrimary
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          // ── STEP 2 ────────────────────────────────────────────────────────
          <>
            <WidgetConfigStep
              ref={step2Ref}
              initialConfig={widgetsList?.[0]?.config ?? null}
              widgetId={widgetsList?.[0]?.id}
              isPro={isPro}
            />

            {/* Mobile finish button */}
            <div className="mt-6 lg:hidden">
              <Button
                className="w-full"
                onClick={handleStep2Save}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Finish & Go to Project
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StepBadge({
  num,
  completed,
  active,
}: {
  num: number;
  completed: boolean;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0",
        active
          ? "bg-primary text-primary-foreground"
          : completed
            ? "bg-success/20 text-success"
            : "bg-muted-foreground/20 text-muted-foreground",
      )}
    >
      {completed ? <Check className="h-3 w-3" /> : num}
    </span>
  );
}

function MobileViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
