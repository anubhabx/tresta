/**
 * Project Wizard Preview Component
 *
 * Real-time preview panel showing testimonial widget appearance
 */

"use client";

import * as React from "react";
import { useState } from "react";
import { Monitor, Smartphone, Tablet, Eye, Folder } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { SasImage } from "@/components/sas-image";
import type { ProjectIdentity } from "./types";

// ============================================================================
// TYPES
// ============================================================================

type PreviewMode = "widget" | "wall" | "form";
type DeviceMode = "desktop" | "tablet" | "mobile";

interface ProjectWizardPreviewProps {
  /** Project identity for preview */
  projectIdentity: ProjectIdentity;
  /** Current theme setting */
  theme?: "light" | "dark" | "auto" | "custom";
  /** Whether user is Pro */
  isPro?: boolean;
  /** Optional class name */
  className?: string;
}

// ============================================================================
// MOCK TESTIMONIAL DATA
// ============================================================================

const MOCK_TESTIMONIALS = [
  {
    id: "1",
    content:
      "This product has completely transformed how we collect customer feedback. Absolutely love it!",
    authorName: "Sarah Chen",
    authorRole: "Product Lead",
    authorCompany: "TechStartup Inc",
    rating: 5,
  },
  {
    id: "2",
    content:
      "Easy to set up, beautiful widgets, and great support. Highly recommended for any SaaS.",
    authorName: "Marcus Johnson",
    authorRole: "CEO",
    authorCompany: "GrowthLabs",
    rating: 5,
  },
  {
    id: "3",
    content:
      "The best testimonial solution we've tried. Our conversion rate improved by 23%!",
    authorName: "Emily Rodriguez",
    authorRole: "Marketing Director",
    authorCompany: "E-Commerce Plus",
    rating: 5,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProjectWizardPreview({
  projectIdentity,
  theme = "auto",
  isPro = false,
  className,
}: ProjectWizardPreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("widget");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

  // Compute preview styles based on identity
  const previewStyles = React.useMemo(() => {
    const primaryColor =
      projectIdentity.primaryColor ||
      projectIdentity.accentColor?.hex ||
      "#6366f1";
    return {
      "--preview-primary": primaryColor,
    } as React.CSSProperties;
  }, [projectIdentity]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Live Preview</h3>
          <Badge variant="secondary" className="text-xs">
            Updates instantly
          </Badge>
        </div>

        {/* Device Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={deviceMode === "desktop" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDeviceMode("desktop")}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={deviceMode === "tablet" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDeviceMode("tablet")}
          >
            <Tablet className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={deviceMode === "mobile" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDeviceMode("mobile")}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Mode Tabs */}
      <div className="flex gap-2">
        {(["widget", "wall", "form"] as PreviewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
              previewMode === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {mode === "wall"
              ? "Wall of Love"
              : mode === "form"
                ? "Collection Form"
                : "Widget"}
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 overflow-hidden transition-all duration-300",
          deviceMode === "desktop" && "min-h-[500px]",
          deviceMode === "tablet" && "min-h-[400px] max-w-[768px] mx-auto",
          deviceMode === "mobile" && "min-h-[500px] max-w-[375px] mx-auto",
        )}
        style={previewStyles}
      >
        {/* Project Header Preview */}
        <div className="p-4 border-b bg-background/50">
          <div className="flex items-center gap-3">
            {/* Avatar with Logo or Icon Fallback */}
            {projectIdentity.logoUrl ? (
              <SasImage
                src={projectIdentity.logoUrl}
                alt={projectIdentity.name}
                className="h-10 w-10 rounded-lg object-cover"
                skeletonClassName="h-10 w-10 rounded-lg"
                fallback={
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      projectIdentity.accentColor?.bg || "bg-violet-100",
                      projectIdentity.accentColor?.text || "text-violet-600",
                    )}
                  >
                    <Folder className="h-5 w-5" />
                  </div>
                }
              />
            ) : (
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  projectIdentity.accentColor?.bg || "bg-violet-100",
                  projectIdentity.accentColor?.text || "text-violet-600",
                )}
              >
                <Folder className="h-5 w-5" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {projectIdentity.name || "Your Project Name"}
              </h4>
              <p className="text-xs text-muted-foreground">
                tresta.co/p/{projectIdentity.slug || "your-slug"}
              </p>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4">
          {previewMode === "widget" && (
            <WidgetPreviewContent
              testimonials={MOCK_TESTIMONIALS}
              primaryColor={projectIdentity.primaryColor}
              isPro={isPro}
            />
          )}
          {previewMode === "wall" && (
            <WallPreviewContent
              testimonials={MOCK_TESTIMONIALS}
              primaryColor={projectIdentity.primaryColor}
            />
          )}
          {previewMode === "form" && (
            <FormPreviewContent
              projectName={projectIdentity.name}
              primaryColor={projectIdentity.primaryColor}
            />
          )}
        </div>

        {/* Powered By Badge */}
        {!isPro && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="text-[10px] opacity-70">
              Powered by Tresta
            </Badge>
          </div>
        )}
      </div>

      {/* Preview Tip */}
      <p className="text-xs text-muted-foreground text-center">
        Preview updates as you configure your project settings
      </p>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface WidgetPreviewContentProps {
  testimonials: typeof MOCK_TESTIMONIALS;
  primaryColor?: string;
  isPro?: boolean;
}

function WidgetPreviewContent({
  testimonials,
  primaryColor,
}: WidgetPreviewContentProps) {
  return (
    <div className="grid gap-3">
      {testimonials.slice(0, 2).map((testimonial) => (
        <div
          key={testimonial.id}
          className="p-4 rounded-lg bg-background border shadow-sm"
        >
          {/* Rating */}
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <svg
                key={i}
                className="h-4 w-4 fill-amber-400 text-amber-400"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Content */}
          <p className="text-sm text-foreground mb-3">{testimonial.content}</p>

          {/* Author */}
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: primaryColor || "#6366f1" }}
            >
              {testimonial.authorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-sm font-medium">{testimonial.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {testimonial.authorRole} at {testimonial.authorCompany}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WallPreviewContent({
  testimonials,
  primaryColor,
}: {
  testimonials: typeof MOCK_TESTIMONIALS;
  primaryColor?: string;
}) {
  return (
    <div className="columns-2 gap-3 space-y-3">
      {testimonials.map((testimonial, index) => (
        <div
          key={testimonial.id}
          className="break-inside-avoid p-3 rounded-lg bg-background border shadow-sm"
        >
          <p className="text-xs text-foreground mb-2 line-clamp-4">
            "{testimonial.content}"
          </p>
          <p className="text-[10px] font-medium">— {testimonial.authorName}</p>
        </div>
      ))}
    </div>
  );
}

function FormPreviewContent({
  projectName,
  primaryColor,
}: {
  projectName?: string;
  primaryColor?: string;
}) {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-sm">Share Your Experience</h4>
        <p className="text-xs text-muted-foreground">
          with {projectName || "this product"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Your Name</label>
          <div className="h-9 rounded-md border bg-background px-3 flex items-center text-xs text-muted-foreground">
            Enter your name...
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Your Testimonial</label>
          <div className="h-20 rounded-md border bg-background p-2 text-xs text-muted-foreground">
            Share your experience...
          </div>
        </div>

        <button
          className="w-full h-9 rounded-md text-xs font-medium text-white"
          style={{ backgroundColor: primaryColor || "#6366f1" }}
        >
          Submit Testimonial
        </button>
      </div>
    </div>
  );
}
