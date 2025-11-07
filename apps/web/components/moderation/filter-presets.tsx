"use client";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { AlertTriangle, Clock, Shield, Zap } from "lucide-react";

export type FilterPreset =
  | "all"
  | "needs-review"
  | "high-risk"
  | "pending"
  | "flagged"
  | "approved"
  | "rejected"
  | "verified";

interface FilterPresetsProps {
  activePreset: FilterPreset;
  onPresetChange: (preset: FilterPreset) => void;
  counts?: {
    all: number;
    needsReview: number;
    highRisk: number;
    pending: number;
    flagged: number;
    approved: number;
    rejected: number;
    verified: number;
  };
}

export function FilterPresets({
  activePreset,
  onPresetChange,
  counts,
}: FilterPresetsProps) {
  const presets = [
    {
      id: "all" as FilterPreset,
      label: "All",
      icon: Zap,
      count: counts?.all,
    },
    {
      id: "needs-review" as FilterPreset,
      label: "Needs Review",
      icon: AlertTriangle,
      count: counts?.needsReview,
    },
    {
      id: "high-risk" as FilterPreset,
      label: "High Risk",
      icon: AlertTriangle,
      count: counts?.highRisk,
    },
    {
      id: "pending" as FilterPreset,
      label: "Pending",
      icon: Clock,
      count: counts?.pending,
    },
    {
      id: "flagged" as FilterPreset,
      label: "Flagged",
      icon: AlertTriangle,
      count: counts?.flagged,
    },
    {
      id: "verified" as FilterPreset,
      label: "Verified",
      icon: Shield,
      count: counts?.verified,
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => (
        <Button
          key={preset.id}
          onClick={() => onPresetChange(preset.id)}
          size="sm"
          variant={activePreset === preset.id ? "secondary" : "outline"}
          className={cn(
            "transition-all",
            activePreset === preset.id && "shadow-sm",
          )}
        >
          {preset.label}
          {preset.count !== undefined && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-1.5 px-1.5 py-0.5 text-xs",
                activePreset === preset.id && "bg-primary-foreground/50",
              )}
            >
              {preset.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
