/**
 * Identity Section
 *
 * Project name, slug, color accent, and industry preset selection.
 * Users upload their own logos - no emoji picker needed.
 */

"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { Control, UseFormSetValue, UseFormGetValues } from "react-hook-form";
import { RefreshCw, Link2, Folder } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { CustomFormField } from "@/components/custom-form-field";
import { ProjectFormData, generateSlug } from "@/lib/schemas/project-schema";

import { IndustryPresetCards } from "../components/industry-preset-cards";
import type { IndustryPreset, ColorPreset } from "../types";

// ============================================================================
// COLOR PRESETS (soft solid colors)
// ============================================================================

const COLOR_PRESETS: ColorPreset[] = [
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
// TYPES
// ============================================================================

interface IdentitySectionProps {
  control: Control<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  getValues: UseFormGetValues<ProjectFormData>;
  watch: (name: keyof ProjectFormData) => any;
  selectedColor: ColorPreset;
  selectedPreset: IndustryPreset;
  onColorChange: (color: ColorPreset) => void;
  onPresetChange: (preset: IndustryPreset) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function IdentitySection({
  control,
  setValue,
  getValues,
  watch,
  selectedColor,
  selectedPreset,
  onColorChange,
  onPresetChange,
}: IdentitySectionProps) {
  const [lastAutoSlug, setLastAutoSlug] = useState("");
  const [userEditedSlug, setUserEditedSlug] = useState(false);

  const currentSlug = watch("slug");
  const currentName = watch("name");

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (value: string) => {
      const newSlug = generateSlug(value);
      if (!userEditedSlug) {
        setValue("slug", newSlug);
        setLastAutoSlug(newSlug);
      }
    },
    [userEditedSlug, setValue],
  );

  // Track manual slug edits
  const handleSlugChange = useCallback(
    (slug: string) => {
      if (slug !== lastAutoSlug) {
        setUserEditedSlug(true);
      }
    },
    [lastAutoSlug],
  );

  // Reset slug to auto-generated
  const handleResetSlug = () => {
    const newSlug = generateSlug(currentName || "");
    setValue("slug", newSlug);
    setLastAutoSlug(newSlug);
    setUserEditedSlug(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Project Identity
        </CardTitle>
        <CardDescription>
          Give your project a name and personality
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Name Field */}
        <CustomFormField
          type="text"
          control={control}
          name="name"
          label="Project Name"
          placeholder="My Awesome Product"
          description="The display name for your project"
          required
          onChange={handleNameChange}
        />

        {/* Accent Color Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Accent Color</label>
          <p className="text-xs text-muted-foreground mb-2">
            Used when no logo is uploaded
          </p>
          <div className="flex gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => onColorChange(color)}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  color.bg,
                  selectedColor.id === color.id
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "hover:scale-105 opacity-70 hover:opacity-100",
                )}
                title={color.id}
              />
            ))}
          </div>
        </div>

        {/* Slug with URL Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Project URL</label>
            {userEditedSlug && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={handleResetSlug}
              >
                <RefreshCw className="h-3 w-3" />
                Auto-generate
              </Button>
            )}
          </div>

          <div className="flex items-center gap-0 rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-muted text-muted-foreground text-sm border-r shrink-0">
              <Link2 className="h-3.5 w-3.5" />
              <span>tresta.co/p/</span>
            </div>
            <input
              type="text"
              value={currentSlug || ""}
              onChange={(e) => {
                setValue("slug", e.target.value);
                handleSlugChange(e.target.value);
              }}
              placeholder="your-project-slug"
              className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
            />
            {currentSlug && (
              <div className="px-3 text-emerald-600 dark:text-emerald-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {userEditedSlug
              ? "Custom URL (you edited this)"
              : "Auto-generated from your project name"}
          </p>
        </div>

        {/* Industry Preset Cards */}
        <IndustryPresetCards value={selectedPreset} onChange={onPresetChange} />

        {/* Short Description */}
        <CustomFormField
          type="text"
          control={control}
          name="shortDescription"
          label="Tagline"
          placeholder="A brief elevator pitch for your product..."
          description="Optional but helps visitors understand your product"
          optional
        />
      </CardContent>
    </Card>
  );
}
