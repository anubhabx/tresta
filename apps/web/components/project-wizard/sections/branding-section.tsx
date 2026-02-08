/**
 * Branding Section (Wizard Version)
 *
 * Theme selection, color picker, and logo upload for the project wizard.
 */

"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import { Sun, Moon, Monitor, Lock, Palette } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { CustomFormField } from "@/components/custom-form-field";
import { AzureFileUpload } from "@/components/azure-file-upload";
import { UploadDirectory } from "@/hooks/use-azure-sas";
import { ProjectFormData } from "@/lib/schemas/project-schema";
import { LockedToggle, ProBadge } from "@/components/paywall";

// ============================================================================
// THEME OPTIONS
// ============================================================================

const THEMES = [
  { id: "light", label: "Light", icon: Sun, description: "Clean & bright" },
  { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
  {
    id: "auto",
    label: "Auto",
    icon: Monitor,
    description: "Match visitor's system",
  },
];

// ============================================================================
// TYPES
// ============================================================================

interface BrandingWizardSectionProps {
  control: Control<ProjectFormData>;
  isPro?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BrandingWizardSection({
  control,
  isPro = false,
}: BrandingWizardSectionProps) {
  const [selectedTheme, setSelectedTheme] = React.useState("auto");

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Branding
        </CardTitle>
        <CardDescription>
          Customize how your testimonials look to visitors
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Widget Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              const isSelected = selectedTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {theme.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {theme.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Logo</label>
          <AzureFileUpload
            control={control}
            name="logoUrl"
            directory={UploadDirectory.LOGOS}
            description="PNG, JPG, or SVG (max 5MB)"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            maxSizeMB={5}
            preview
          />
        </div>

        {/* Brand Color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Brand Color</label>
            {!isPro && <ProBadge size="sm" />}
          </div>

          <CustomFormField
            control={control}
            name="brandColorPrimary"
            type="color"
            label="Primary Brand Color"
            placeholder="#6366f1"
            description="Used for accents in your testimonial widgets"
            optional
            disabled={!isPro}
          />

          {!isPro && (
            <p className="text-xs text-muted-foreground">
              Upgrade to Pro to customize brand colors
            </p>
          )}
        </div>

        {/* Remove Branding Toggle */}
        <LockedToggle
          isPro={isPro}
          featureName="remove_branding"
          checked={false}
          onCheckedChange={() => {}}
          label="Remove 'Powered by Tresta'"
          description="Hide the attribution from your widgets"
        />
      </CardContent>
    </Card>
  );
}
