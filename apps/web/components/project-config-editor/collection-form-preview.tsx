"use client";

import { CSSProperties, memo } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Star,
  ChevronDown,
  Upload,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import type { FormConfig } from "@/types/api";

const normalizeHex = (v?: string | null): string | null => {
  if (!v) return null;
  const t = v.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return t;
  const m = /^#([0-9a-fA-F]{3})$/.exec(t);
  if (m?.[1]) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
};

interface PreviewFieldProps {
  label: string;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
  type?: "text" | "textarea" | "url" | "email";
}

function PreviewField({
  label,
  placeholder,
  required,
  optional,
  type = "text",
}: PreviewFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {required && <span className="text-destructive text-xs">*</span>}
        {optional && (
          <span className="text-muted-foreground text-xs">(optional)</span>
        )}
      </div>
      {type === "textarea" ? (
        <div className="min-h-[64px] w-full rounded-md border border-input bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground/70 leading-relaxed">
          {placeholder}
        </div>
      ) : (
        <div className="h-7 w-full rounded-md border border-input bg-muted/30 px-2.5 flex items-center text-xs text-muted-foreground/70">
          {placeholder}
        </div>
      )}
    </div>
  );
}

function PreviewStarRating({ required }: { required?: boolean }) {
  return (
    <div className="space-y-1 text-center">
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs font-medium">How would you rate us?</span>
        {required && <span className="text-destructive text-xs">*</span>}
      </div>
      <div className="flex justify-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-5 w-5",
              i <= 4
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export interface CollectionFormPreviewProps {
  formConfig?: FormConfig | null;
  projectName?: string;
  logoUrl?: string | null;
  brandColorPrimary?: string | null;
  className?: string;
}

export const CollectionFormPreview = memo(function CollectionFormPreview({
  formConfig,
  projectName = "Your Project",
  logoUrl,
  brandColorPrimary,
  className,
}: CollectionFormPreviewProps) {
  const brandHex = normalizeHex(brandColorPrimary);
  const brandStyles = brandHex
    ? ({
        "--collection-brand-primary": brandHex,
        "--collection-brand-soft": `${brandHex}1A`,
        "--collection-brand-hover": `${brandHex}E6`,
      } as CSSProperties)
    : undefined;

  const isRatingEnabled = formConfig?.enableRating !== false;
  const isJobTitleEnabled = formConfig?.enableJobTitle !== false;
  const isCompanyEnabled = formConfig?.enableCompany !== false;
  const isAvatarEnabled = formConfig?.enableAvatar !== false;
  const isVideoEnabled = formConfig?.enableVideoUrl !== false;
  const isGoogleEnabled = formConfig?.enableGoogleVerification !== false;

  const requireRating = isRatingEnabled && formConfig?.requireRating === true;
  const requireJobTitle =
    isJobTitleEnabled && formConfig?.requireJobTitle === true;
  const requireCompany =
    isCompanyEnabled && formConfig?.requireCompany === true;
  const requireAvatar = isAvatarEnabled && formConfig?.requireAvatar === true;

  const headerTitle =
    formConfig?.headerTitle ||
    (projectName ? `Share your experience` : "Share your experience");
  const headerDescription =
    formConfig?.headerDescription ||
    `Tell us about your experience with ${projectName || "us"}`;

  return (
    <div
      className={cn("pointer-events-none select-none w-full", className)}
      aria-hidden="true"
    >
      {/* Preview Label */}
      <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        <span>Live Preview</span>
      </div>

      <Card
        className="w-full border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        style={brandStyles}
      >
        <CardHeader className="text-center pb-2 pt-5 px-5">
          {logoUrl ? (
            <Avatar className="h-12 w-12 mx-auto mb-3">
              <AvatarImage src={logoUrl} alt={`${projectName} Logo`} />
              <AvatarFallback
                className={cn(
                  "bg-primary/10",
                  brandHex && "bg-[var(--collection-brand-soft)]",
                )}
              >
                <MessageSquare
                  className={cn(
                    "h-5 w-5 text-primary",
                    brandHex && "text-[var(--collection-brand-primary)]",
                  )}
                />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={cn(
                "h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-primary/10",
                brandHex && "bg-[var(--collection-brand-soft)]",
              )}
            >
              <MessageSquare
                className={cn(
                  "h-5 w-5 text-primary",
                  brandHex && "text-[var(--collection-brand-primary)]",
                )}
              />
            </div>
          )}
          <CardTitle className="text-base leading-tight">{headerTitle}</CardTitle>
          <CardDescription className="text-xs mt-1 line-clamp-2">
            {headerDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-3 px-5 pb-5 space-y-3">
          {/* Google verification */}
          {isGoogleEnabled && (
            <div className="rounded-lg border border-dashed bg-muted/30 p-2.5 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Verify with Google
              </div>
              <p className="text-xs text-muted-foreground">
                {formConfig?.requireGoogleVerification
                  ? "Required to submit"
                  : "Auto-fill your info"}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border rounded text-xs bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
                <svg className="h-3 w-3" viewBox="0 0 24 24">
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
            </div>
          )}

          <Separator />

          {/* Star Rating */}
          {isRatingEnabled && <PreviewStarRating required={requireRating} />}

          {/* Testimonial content */}
          <PreviewField
            label="Your testimonial"
            placeholder="What did you like? How did it help you?"
            type="textarea"
            required
          />

          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-2">
            <PreviewField label="Your Name" placeholder="John Doe" required />
            <PreviewField
              label="Email"
              placeholder="john@example.com"
              type="email"
              required
            />
          </div>

          {/* Role & Company */}
          {(isJobTitleEnabled || isCompanyEnabled) && (
            <div className="grid grid-cols-2 gap-2">
              {isJobTitleEnabled && (
                <PreviewField
                  label="Role"
                  placeholder="CEO, Developer..."
                  required={requireJobTitle}
                  optional={!requireJobTitle}
                />
              )}
              {isCompanyEnabled && (
                <PreviewField
                  label="Company"
                  placeholder="Acme Inc."
                  required={requireCompany}
                  optional={!requireCompany}
                />
              )}
            </div>
          )}

          {/* Avatar upload */}
          {isAvatarEnabled && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">Profile Picture</span>
                {requireAvatar ? (
                  <span className="text-destructive text-xs">*</span>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                )}
              </div>
              <div className="border-2 border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Click to upload photo
              </div>
            </div>
          )}

          {/* Video URL */}
          {isVideoEnabled && (
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground py-0.5">
              <span>
                {formConfig?.requireVideoUrl
                  ? "Video testimonial required"
                  : "Add video testimonial"}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          )}

          <Separator />

          {/* Submit */}
          <div
            className={cn(
              "w-full h-8 rounded-md text-xs font-medium flex items-center justify-center",
              !brandHex && "bg-primary text-primary-foreground",
            )}
            style={
              brandHex
                ? {
                    backgroundColor: brandHex,
                    color: "white",
                  }
                : undefined
            }
          >
            Submit Testimonial
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
