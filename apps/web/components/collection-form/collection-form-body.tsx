"use client";

import { CSSProperties } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@workspace/ui/components/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import {
  MessageSquare,
  ShieldCheck,
  Star,
  ChevronDown,
  Upload,
  Lock,
  CheckCircle2
} from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { cn } from "@workspace/ui/lib/utils";
import { CustomFormField } from "@/components/custom-form-field";
import { AzureFileUpload } from "@/components/azure-file-upload";
import type { FormConfig } from "@/types/api";
import type { TestimonialFormData } from "./schema";

// ============================================================================
// HELPERS
// ============================================================================

const normalizeHexColor = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  const shortHexMatch = /^#([0-9a-fA-F]{3})$/.exec(trimmed);
  if (shortHexMatch?.[1]) {
    const [r, g, b] = shortHexMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  return null;
};

const withAlpha = (hex: string, alpha: string) => `${hex}${alpha}`;

// ============================================================================
// PREVIEW SUB-COMPONENTS
// ============================================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/75 whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function PreviewInput({
  label,
  placeholder,
  required,
  optional,
  type = "text"
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
  type?: "text" | "textarea" | "email" | "url";
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium leading-none text-foreground">
          {label}
        </span>
        {required && (
          <span className="text-destructive text-xs leading-none">*</span>
        )}
        {optional && (
          <span className="text-xs text-muted-foreground leading-none">
            (optional)
          </span>
        )}
      </div>
      {type === "textarea" ? (
        <div className="min-h-[112px] w-full rounded-lg border border-input/80 bg-muted/[0.14] px-3 py-2.5 text-sm text-muted-foreground/40 leading-relaxed">
          {placeholder}
        </div>
      ) : (
        <div className="h-10 w-full rounded-lg border border-input/80 bg-muted/[0.14] px-3 flex items-center text-sm text-muted-foreground/40">
          {placeholder}
        </div>
      )}
    </div>
  );
}

function PreviewStarRating({ required }: { required?: boolean }) {
  return (
    <div className="space-y-3 text-center">
      <div className="flex items-center justify-center gap-1">
        <span className="text-sm font-medium text-foreground">
          How would you rate us?
        </span>
        {required && (
          <span className="text-destructive text-xs leading-none">*</span>
        )}
      </div>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-6 w-6",
              i <= 4
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function FakeGoogleButton() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-md border border-border/80 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </div>
  );
}

function ProjectContextPanel({
  projectName,
  projectTagline,
  projectDescription,
  logoUrl,
  brandHex,
  compact
}: {
  projectName: string;
  projectTagline: string;
  projectDescription: string;
  logoUrl?: string | null;
  brandHex: string | null;
  compact: boolean;
}) {
  const projectInitial = projectName.trim().charAt(0).toUpperCase() || "T";
  const accentHex = brandHex ?? "#3B82F6";

  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.38)] w-full max-w-[560px] mx-auto",
        compact ? "p-5" : "p-6 sm:p-8 lg:p-10"
      )}
      style={{
        background: `radial-gradient(135% 120% at 0% 0%, ${withAlpha(accentHex, "24")} 0%, transparent 56%), radial-gradient(120% 120% at 100% 100%, ${withAlpha(accentHex, "14")} 0%, transparent 62%), hsl(var(--card) / 0.88)`
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-14 -top-16 h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: withAlpha(accentHex, "30") }}
        />
        <div
          className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full blur-3xl"
          style={{ backgroundColor: withAlpha(accentHex, "1A") }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,transparent_42%)] opacity-45" />
      </div>

      <div
        className={cn(
          "relative flex h-fit flex-col",
          compact ? "justify-start gap-4" : "justify-center gap-6"
        )}
      >
        {logoUrl ? (
          <Avatar className="h-24 w-24 rounded-2xl ring-1 ring-border/65 shadow-[0_16px_35px_-20px_rgba(15,23,42,0.5)]">
            <AvatarImage src={logoUrl} alt={`${projectName} logo`} />
            <AvatarFallback
              className={cn(
                "text-2xl font-semibold text-foreground",
                brandHex &&
                  "bg-[var(--collection-brand-soft)] text-[var(--collection-brand-primary)]"
              )}
            >
              {projectInitial}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-2xl font-semibold text-foreground shadow-[0_16px_35px_-20px_rgba(15,23,42,0.5)]",
              brandHex &&
                "border-[var(--collection-brand-soft)] bg-[var(--collection-brand-soft)] text-[var(--collection-brand-primary)]"
            )}
          >
            {projectInitial}
          </div>
        )}

        <div className="space-y-3">
          <h2
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compact ? "text-xl" : "text-2xl sm:text-[2rem]"
            )}
          >
            {projectName}
          </h2>
          <p
            className={cn(
              "font-medium leading-relaxed text-foreground/75",
              compact ? "text-sm" : "text-sm sm:text-base"
            )}
          >
            {projectTagline}
          </p>
          <p
            className={cn(
              "max-w-md leading-relaxed text-muted-foreground",
              compact ? "text-xs" : "text-sm sm:text-[0.95rem]"
            )}
          >
            {projectDescription}
          </p>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// PROPS
// ============================================================================

export interface CollectionFormBodyProps {
  mode: "preview" | "hosted";
  /** Viewport hint for preview-mode responsive rendering */
  previewViewport?: "desktop" | "tablet" | "mobile";
  formConfig?: FormConfig | null;
  projectName?: string;
  projectTagline?: string | null;
  projectDescription?: string | null;
  logoUrl?: string | null;
  brandColorPrimary?: string | null;
  /** react-hook-form instance (hosted mode) */
  form?: UseFormReturn<TestimonialFormData>;
  isSubmitting?: boolean;
  /** Whether the user has verified with Google (hosted mode) */
  isGoogleVerified?: boolean;
  onGoogleSuccess?: (credentialResponse: CredentialResponse) => void;
  onGoogleError?: () => void;
  /** Video collapsible open state (hosted mode) */
  isVideoOpen?: boolean;
  onVideoOpenChange?: (open: boolean) => void;
  /** Fingerprint opt-out checkbox state (hosted mode) */
  fingerprintOptOut?: boolean;
  onFingerprintOptOutChange?: (checked: boolean) => void;
  /** HTML form onSubmit handler (hosted mode) */
  onFormSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CollectionFormBody({
  mode,
  previewViewport = "desktop",
  formConfig,
  projectName = "Your Project",
  projectTagline,
  projectDescription,
  logoUrl,
  brandColorPrimary,
  form,
  isSubmitting = false,
  isGoogleVerified = false,
  onGoogleSuccess,
  onGoogleError,
  isVideoOpen = false,
  onVideoOpenChange,
  fingerprintOptOut = false,
  onFingerprintOptOutChange,
  onFormSubmit,
  className
}: CollectionFormBodyProps) {
  const isPreview = mode === "preview";
  const isHosted = mode === "hosted";
  const previewIsCompact = isPreview && previewViewport === "mobile";

  // ── formConfig flags ──────────────────────────────────────────────────────
  const isRatingEnabled = formConfig?.enableRating !== false;
  const isJobTitleEnabled = formConfig?.enableJobTitle !== false;
  const isCompanyEnabled = formConfig?.enableCompany !== false;
  const isAvatarEnabled = formConfig?.enableAvatar !== false;
  const isVideoEnabled = formConfig?.enableVideoUrl !== false;
  const isGoogleEnabled = formConfig?.enableGoogleVerification !== false;
  const showFingerprintOptOut = formConfig?.allowFingerprintOptOut === true;

  const requireRating = isRatingEnabled && formConfig?.requireRating === true;
  const requireJobTitle =
    isJobTitleEnabled && formConfig?.requireJobTitle === true;
  const requireCompany =
    isCompanyEnabled && formConfig?.requireCompany === true;
  const requireAvatar = isAvatarEnabled && formConfig?.requireAvatar === true;
  const requireVideoUrl =
    isVideoEnabled && formConfig?.requireVideoUrl === true;
  const requireGoogleVerification =
    isGoogleEnabled && formConfig?.requireGoogleVerification === true;

  const headerTitle = formConfig?.headerTitle || "Share your experience";
  const headerDescription =
    formConfig?.headerDescription ||
    `Tell us about your experience with ${projectName}`;

  const normalizedProjectName = projectName.trim() || "Your Project";
  const contextTagline =
    projectTagline?.trim() ||
    formConfig?.headerDescription?.trim() ||
    `Trusted by customers using ${normalizedProjectName}`;
  const contextDescription =
    projectDescription?.trim() ||
    `Share your honest experience with ${normalizedProjectName}. Your feedback helps others understand what to expect and gives the team clear social proof.`;

  // ── Brand theming ─────────────────────────────────────────────────────────
  const brandHex = normalizeHexColor(brandColorPrimary);
  const brandStyles = brandHex
    ? ({
        "--collection-brand-primary": brandHex,
        "--collection-brand-soft": withAlpha(brandHex, "1A"),
        "--collection-brand-hover": withAlpha(brandHex, "E6"),
        "--collection-brand-subtle": withAlpha(brandHex, "0D")
      } as CSSProperties)
    : undefined;

  // ── Card header ───────────────────────────────────────────────────────────
  const cardHeader = (
    <CardHeader className="relative overflow-hidden px-6 pt-9 pb-6 text-center">
      {brandHex && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -20%, ${brandHex}22 0%, transparent 65%)`
          }}
        />
      )}
      <div className="relative">
        {logoUrl ? (
          <Avatar
            className={cn(
              "h-16 w-16 mx-auto mb-4 ring-2 ring-offset-2 ring-offset-card",
              brandHex
                ? "ring-[var(--collection-brand-soft)]"
                : "ring-border/40"
            )}
          >
            <AvatarImage src={logoUrl} alt={`${projectName} logo`} />
            <AvatarFallback
              className={cn(
                "bg-primary/10",
                brandHex && "bg-[var(--collection-brand-soft)]"
              )}
            >
              <MessageSquare
                className={cn(
                  "h-7 w-7 text-primary",
                  brandHex && "text-[var(--collection-brand-primary)]"
                )}
              />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              "h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10 ring-2 ring-offset-2 ring-offset-card ring-border/30",
              brandHex && "bg-[var(--collection-brand-soft)]"
            )}
          >
            <MessageSquare
              className={cn(
                "h-7 w-7 text-primary",
                brandHex && "text-[var(--collection-brand-primary)]"
              )}
            />
          </div>
        )}
        <CardTitle className="text-[2rem] font-semibold tracking-tight">
          {headerTitle}
        </CardTitle>
        <CardDescription className="mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          {headerDescription}
        </CardDescription>
      </div>
    </CardHeader>
  );

  // ── Google section ────────────────────────────────────────────────────────
  const googleSection = isGoogleEnabled ? (
    isHosted && isGoogleVerified ? (
      <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">
              Verified with Google
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Your identity has been confirmed and your profile can be used for
              this testimonial.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-success/15 text-success border-0 text-xs flex-shrink-0"
          >
            Verified
          </Badge>
        </div>
      </div>
    ) : (
      <div className="rounded-xl border border-border/65 bg-muted/[0.14] p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-lg p-1.5 mt-0.5 bg-primary/8 flex-shrink-0",
              brandHex && "bg-[var(--collection-brand-subtle)]"
            )}
          >
            <ShieldCheck
              className={cn(
                "h-4 w-4 text-primary",
                brandHex && "text-[var(--collection-brand-primary)]"
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground leading-tight">
              Verify with Google
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {requireGoogleVerification
                ? "Required before submitting your testimonial"
                : "Auto-fill your details and earn a verified badge"}
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex justify-center">
          {isPreview ? (
            <FakeGoogleButton />
          ) : (
            <GoogleLogin
              onSuccess={onGoogleSuccess!}
              onError={onGoogleError}
              useOneTap
              size="medium"
              text="continue_with"
              shape="rectangular"
            />
          )}
        </div>
      </div>
    )
  ) : null;

  // ── Fields ────────────────────────────────────────────────────────────────
  const fields = (
    <div className="space-y-7">
      {googleSection}

      <div className="space-y-4">
        <SectionLabel>Your Experience</SectionLabel>

        {/* Rating */}
        {isRatingEnabled &&
          (isPreview ? (
            <PreviewStarRating required={requireRating} />
          ) : (
            <div className="text-center">
              <CustomFormField
                type="rating"
                control={form!.control}
                name="rating"
                label="How would you rate us?"
                max={5}
                required={requireRating}
                optional={!requireRating}
              />
            </div>
          ))}

        {/* Testimonial textarea */}
        {isPreview ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium leading-none text-foreground">
                Your testimonial
              </span>
              <span className="text-destructive text-xs leading-none">*</span>
            </div>
            <div className="min-h-[112px] w-full rounded-lg border border-input/80 bg-muted/[0.14] px-3 py-2.5 text-sm text-muted-foreground/40 leading-relaxed">
              What did you like? How did it help you?
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] text-muted-foreground/35">
                0 / 2000
              </span>
            </div>
          </div>
        ) : (
          <CustomFormField
            type="textarea"
            control={form!.control}
            name="content"
            label="Your testimonial"
            placeholder="What did you like? How did it help you?"
            maxLength={2000}
            showCharacterCount
            required
          />
        )}
      </div>

      <div className="space-y-4">
        <SectionLabel>About You</SectionLabel>

        {/* Name + Email */}
        {isPreview ? (
          <div
            className={cn(
              "grid gap-3",
              previewIsCompact ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            <PreviewInput label="Your Name" placeholder="John Doe" required />
            <PreviewInput
              label="Email"
              placeholder="john@example.com"
              type="email"
              required
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomFormField
              type="text"
              control={form!.control}
              name="authorName"
              label="Your Name"
              placeholder="John Doe"
              required
            />
            <CustomFormField
              type="email"
              control={form!.control}
              name="authorEmail"
              label="Email"
              placeholder="john@example.com"
              required
            />
          </div>
        )}

        {/* Role + Company */}
        {(isJobTitleEnabled || isCompanyEnabled) &&
          (isPreview ? (
            <div
              className={cn(
                "grid gap-3",
                isJobTitleEnabled && isCompanyEnabled
                  ? previewIsCompact
                    ? "grid-cols-1"
                    : "grid-cols-2"
                  : "grid-cols-1"
              )}
            >
              {isJobTitleEnabled && (
                <PreviewInput
                  label="Role"
                  placeholder="CEO, Developer..."
                  required={requireJobTitle}
                  optional={!requireJobTitle}
                />
              )}
              {isCompanyEnabled && (
                <PreviewInput
                  label="Company"
                  placeholder="Acme Inc."
                  required={requireCompany}
                  optional={!requireCompany}
                />
              )}
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-1 gap-3",
                isJobTitleEnabled && isCompanyEnabled && "sm:grid-cols-2"
              )}
            >
              {isJobTitleEnabled && (
                <CustomFormField
                  type="text"
                  control={form!.control}
                  name="authorRole"
                  label="Role"
                  placeholder="CEO, Developer, etc."
                  required={requireJobTitle}
                  optional={!requireJobTitle}
                />
              )}
              {isCompanyEnabled && (
                <CustomFormField
                  type="text"
                  control={form!.control}
                  name="authorCompany"
                  label="Company"
                  placeholder="Acme Inc."
                  required={requireCompany}
                  optional={!requireCompany}
                />
              )}
            </div>
          ))}
      </div>

      {/* Avatar upload */}
      {isAvatarEnabled &&
        (isPreview || !isGoogleVerified) &&
        (isPreview ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium leading-none text-foreground">
                Profile Picture
              </span>
              {requireAvatar ? (
                <span className="text-destructive text-xs leading-none">*</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              )}
            </div>
            <div className="rounded-lg border-2 border-dashed border-border/55 py-6 text-center text-sm text-muted-foreground/50 flex flex-col items-center gap-2 bg-muted/[0.08]">
              <Upload className="h-5 w-5" />
              <span>Click to upload photo</span>
              <span className="text-xs">JPG, PNG, or WebP · max 2MB</span>
            </div>
          </div>
        ) : (
          <AzureFileUpload
            control={form!.control}
            name="authorAvatar"
            label={
              requireAvatar ? "Profile Picture (Required)" : "Profile Picture"
            }
            directory="avatars"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            maxSizeMB={2}
            description={
              requireAvatar
                ? "Required · JPG, PNG, or WebP (max 2MB)"
                : "Optional · JPG, PNG, or WebP (max 2MB)"
            }
          />
        ))}

      {/* Video URL */}
      {isVideoEnabled &&
        (isPreview ? (
          <div className="flex items-center justify-between rounded-lg border border-border/55 bg-muted/[0.12] px-3.5 py-2.5 text-sm font-medium text-foreground/85">
            <span>
              {requireVideoUrl
                ? "Video testimonial required"
                : "Add a video testimonial"}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2 text-muted-foreground" />
          </div>
        ) : (
          <Collapsible open={isVideoOpen} onOpenChange={onVideoOpenChange}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-full justify-between rounded-lg border border-border/55 bg-muted/[0.12] px-3.5 py-2.5 text-sm font-medium text-foreground/85 hover:bg-muted/30"
              >
                <span>
                  {requireVideoUrl
                    ? "Video testimonial required"
                    : "Add video testimonial"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isVideoOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <CustomFormField
                type="url"
                control={form!.control}
                name="videoUrl"
                label="Video URL"
                placeholder="https://youtube.com/watch?v=..."
                description="YouTube, Vimeo, or Loom link"
                required={requireVideoUrl}
                optional={!requireVideoUrl}
              />
            </CollapsibleContent>
          </Collapsible>
        ))}

      <Separator />

      {/* Fingerprint opt-out */}
      {showFingerprintOptOut &&
        (isPreview ? (
          <div className="rounded-lg border border-border/45 bg-muted/[0.12] px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <div className="h-4 w-4 rounded border border-input bg-background flex-shrink-0 mt-0.5" />
              <span className="text-xs text-muted-foreground leading-relaxed">
                Don&apos;t log my IP address or device information
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/45 bg-muted/[0.12] px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="fingerprint-opt-out"
                checked={fingerprintOptOut}
                onCheckedChange={(checked) =>
                  onFingerprintOptOutChange?.(!!checked)
                }
                className="mt-0.5"
              />
              <label
                htmlFor="fingerprint-opt-out"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
              >
                Don&apos;t log my IP address or device information
              </label>
            </div>
          </div>
        ))}

      {/* Submit button */}
      <div className="pt-1">
        <Button
          type={isHosted ? "submit" : "button"}
          size="lg"
          className={cn(
            "w-full h-11 text-sm font-semibold rounded-lg tracking-[0.01em]",
            !brandHex &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
            brandHex &&
              "border-0 text-white hover:opacity-90 active:opacity-95 focus-visible:ring-[var(--collection-brand-primary)]"
          )}
          style={brandHex ? { backgroundColor: brandHex } : undefined}
          disabled={
            isSubmitting ||
            (isHosted && requireGoogleVerification && !isGoogleVerified)
          }
        >
          {isSubmitting ? "Submitting..." : "Submit Testimonial"}
        </Button>
      </div>

      {/* Privacy link */}
      <div className="flex justify-center">
        {isHosted ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-muted-foreground/60 gap-1.5 hover:text-muted-foreground rounded-lg"
              >
                <Lock className="h-3 w-3" />
                How we use your data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How we use your data</DialogTitle>
                <DialogDescription>
                  We value your privacy and transparency.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Publicly Visible
                  </h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Name, Role &amp; Company</li>
                    <li>Profile Picture</li>
                    <li>Testimonial Content &amp; Video</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-warning" />
                    Kept Private
                  </h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Email Address (verification only)</li>
                    <li>IP &amp; Device Info (spam prevention)</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/55">
            <Lock className="h-3 w-3" />
            <span>How we use your data</span>
          </div>
        )}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const contextPanel = (
    <ProjectContextPanel
      projectName={normalizedProjectName}
      projectTagline={contextTagline}
      projectDescription={contextDescription}
      logoUrl={logoUrl}
      brandHex={brandHex}
      compact={isPreview ? previewViewport !== "desktop" : false}
    />
  );

  const card = (
    <Card
      className={cn(
        "mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)]",
        className
      )}
    >
      {cardHeader}
      <CardContent className="px-6 pb-8 pt-2">{fields}</CardContent>
    </Card>
  );

  const formCard =
    isHosted && form ? (
      <Form {...form}>
        <form onSubmit={onFormSubmit} className="w-full">
          {card}
        </form>
      </Form>
    ) : (
      card
    );

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1120px]",
        isPreview
          ? previewViewport === "desktop"
            ? "grid grid-cols-[minmax(0,35%)_minmax(0,65%)] items-start gap-6"
            : "space-y-4"
          : "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,35%)_minmax(0,65%)] lg:items-start lg:gap-6"
      )}
      style={brandStyles}
    >
      <div
        className={cn(
          "w-full",
          isPreview
            ? previewViewport === "desktop" && "sticky top-4 self-start"
            : "lg:sticky lg:top-6 lg:self-start"
        )}
      >
        {contextPanel}
      </div>
      <div
        className={cn(
          "w-full",
          isPreview
            ? previewViewport === "desktop"
              ? "flex items-start justify-start"
              : "flex items-start justify-center"
            : "flex items-start justify-center lg:justify-start"
        )}
      >
        {formCard}
      </div>
    </div>
  );
}
