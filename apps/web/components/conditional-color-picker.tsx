/**
 * Conditional Color Picker
 *
 * A unified color selection component that gates the custom hex color picker
 * behind the Pro plan while providing Free users a curated swatch palette.
 *
 * - Free tier: Clickable preset swatches + disabled hex input with ProBadge
 * - Pro tier:  Clickable preset swatches + full ColorPicker (popover)
 *
 * @module components/conditional-color-picker
 */

"use client";

import * as React from "react";
import { Crown } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@workspace/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { FREE_COLOR_PALETTE, type FreeColorPreset } from "@workspace/types";

import { ColorPicker } from "@/components/color-picker";
import { ProBadge } from "@/components/paywall";
import { useUpgradeModal } from "@/components/billing/upgrade-modal";

// ============================================================================
// TYPES
// ============================================================================

export interface ConditionalColorPickerProps {
  /** Whether the user has Pro access */
  isPro: boolean;
  /** Current hex color value */
  value?: string;
  /** Called with a 6-digit hex string on change */
  onChange?: (hex: string) => void;
  /** Disable all interaction */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Label text shown above the picker */
  label?: string;
  /** Description text shown below the label */
  description?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConditionalColorPicker({
  isPro,
  value,
  onChange,
  disabled = false,
  className,
  label,
  description,
}: ConditionalColorPickerProps) {
  const { open: openUpgrade } = useUpgradeModal();

  const handlePresetClick = React.useCallback(
    (preset: FreeColorPreset) => {
      if (disabled) return;
      onChange?.(preset.hex);
    },
    [onChange, disabled],
  );

  const handleProFeatureClick = React.useCallback(() => {
    toast.info("Custom colors are a Pro feature", {
      description: "Upgrade to Pro for unlimited color customization.",
      action: {
        label: "Upgrade",
        onClick: () => openUpgrade(),
      },
    });
  }, [openUpgrade]);

  // Check if the current value matches a preset
  const activePresetId = React.useMemo(() => {
    if (!value) return null;
    const match = FREE_COLOR_PALETTE.find(
      (p) => p.hex.toUpperCase() === value.toUpperCase(),
    );
    return match?.id ?? null;
  }, [value]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label */}
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{label}</label>
          {!isPro && <ProBadge size="sm" />}
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground -mt-1">{description}</p>
      )}

      {/* Preset Swatches — always shown */}
      <div className="flex items-center gap-2">
        {FREE_COLOR_PALETTE.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <TooltipProvider key={preset.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePresetClick(preset)}
                    aria-label={preset.label}
                    className={cn(
                      "h-8 w-8 shrink-0 rounded-md border-2 transition-all duration-150",
                      isActive
                        ? "border-primary ring-2 ring-primary/20 scale-110"
                        : "border-transparent hover:border-border hover:scale-105",
                      disabled && "pointer-events-none opacity-50",
                    )}
                    style={{ backgroundColor: preset.hex }}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {preset.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Pro: Full color picker | Free: Locked trigger */}
        {isPro ? (
          <ColorPicker
            value={value}
            defaultValue={value || "#3B82F6"}
            onChange={onChange}
            disabled={disabled}
            className="flex-1"
          />
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={handleProFeatureClick}
            className={cn(
              "flex h-9 flex-1 items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-all duration-150",
              "hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-700 dark:hover:bg-amber-900/10",
              "cursor-pointer",
              disabled && "pointer-events-none opacity-50",
              "dark:bg-input/30",
            )}
          >
            <span
              className="h-5 w-5 shrink-0 rounded border border-border"
              style={{ backgroundColor: value || "#3B82F6" }}
            />
            <span className="font-mono text-xs text-muted-foreground flex-1 text-left uppercase">
              {value || "#3B82F6"}
            </span>
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          </button>
        )}
      </div>

      {/* Free tier hint */}
      {!isPro && (
        <p className="text-xs text-muted-foreground">
          <button
            type="button"
            onClick={handleProFeatureClick}
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            Upgrade to Pro
          </button>{" "}
          for custom hex colors
        </p>
      )}
    </div>
  );
}
