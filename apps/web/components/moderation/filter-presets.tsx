"use client";

import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { AlertTriangle, Clock, Shield, Zap, Filter } from "lucide-react";

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
      label: "All Testimonials",
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

  const activePresetData = presets.find((p) => p.id === activePreset);

  return (
    <Select value={activePreset} onValueChange={onPresetChange}>
      <SelectTrigger className="w-full sm:w-[240px] h-11 sm:h-10">
        <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
        <SelectValue>
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">{activePresetData?.label}</span>
            {activePresetData?.count !== undefined && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {activePresetData.count}
              </Badge>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <SelectItem key={preset.id} value={preset.id}>
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{preset.label}</span>
                </div>
                {preset.count !== undefined && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {preset.count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
