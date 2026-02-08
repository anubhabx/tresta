/**
 * Industry Preset Cards Component
 *
 * Card-based industry selection inspired by Vercel's framework presets.
 * Uses Lucide icons instead of emojis for professionalism.
 */

"use client";

import * as React from "react";
import { Rocket, ShoppingCart, Palette, Sparkles } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { IndustryPreset } from "../types";

// ============================================================================
// PRESET DATA
// ============================================================================

const PRESETS: {
  id: IndustryPreset;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: "SAAS",
    label: "SaaS",
    description: "Software products",
    icon: Rocket,
  },
  {
    id: "ECOMMERCE",
    label: "E-commerce",
    description: "Online stores",
    icon: ShoppingCart,
  },
  {
    id: "AGENCY",
    label: "Agency",
    description: "Services & creative",
    icon: Palette,
  },
  {
    id: "OTHER",
    label: "Other",
    description: "Something else",
    icon: Sparkles,
  },
];

// ============================================================================
// TYPES
// ============================================================================

interface IndustryPresetCardsProps {
  /** Currently selected preset */
  value: IndustryPreset;
  /** Callback when preset changes */
  onChange: (preset: IndustryPreset) => void;
  /** Optional class name */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function IndustryPresetCards({
  value,
  onChange,
  className,
}: IndustryPresetCardsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Industry Type</label>
        <span className="text-xs text-muted-foreground">
          Helps us suggest settings
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = value === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                "hover:border-primary/50 hover:bg-muted/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border",
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : "text-foreground",
                )}
              >
                {preset.label}
              </span>

              {/* Description */}
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {preset.description}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="h-2.5 w-2.5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default IndustryPresetCards;
