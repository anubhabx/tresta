"use client";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { Search, Eye, Shield, ShieldCheck } from "lucide-react";
import type {
  FilterStatus,
  ModerationFilter,
} from "@/lib/testimonial-list-utils";

interface SearchAndFiltersProps {
  moderationMode?: boolean;
  searchQuery: string;
  filterStatus: FilterStatus;
  filterModeration: ModerationFilter;
  filterVerified: "all" | "verified" | "unverified";
  selectedCount: number;
  totalCount: number;
  selectAllChecked: boolean;
  onSearchChange: (query: string) => void;
  onFilterStatusChange: (status: FilterStatus) => void;
  onFilterModerationChange: (moderation: ModerationFilter) => void;
  onFilterVerifiedChange: (verified: "all" | "verified" | "unverified") => void;
  onToggleSelectAll: () => void;
}

export function SearchAndFilters({
  moderationMode = false,
  searchQuery,
  filterStatus,
  filterModeration,
  filterVerified,
  selectedCount,
  totalCount,
  selectAllChecked,
  onSearchChange,
  onFilterStatusChange,
  onFilterModerationChange,
  onFilterVerifiedChange,
  onToggleSelectAll,
}: SearchAndFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Select All Checkbox - Only show in moderation mode */}
      {moderationMode && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <Checkbox
            checked={selectAllChecked}
            onCheckedChange={onToggleSelectAll}
            id="select-all"
            className="h-5 w-5"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2 flex-1"
          >
            Select All
            <Badge variant="secondary" className="ml-1">
              {totalCount}
            </Badge>
            {selectedCount > 0 && (
              <span className="text-muted-foreground text-xs ml-2">
                ({selectedCount} selected)
              </span>
            )}
          </label>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Status Filter - Normal mode only */}
        {!moderationMode && (
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Eye className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Moderation Mode Filters */}
        {moderationMode && (
          <>
            <Select
              value={filterModeration}
              onValueChange={onFilterModerationChange}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Moderation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moderation</SelectItem>
                <SelectItem value="PENDING">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="APPROVED">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Approved
                  </div>
                </SelectItem>
                <SelectItem value="FLAGGED">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                    Flagged
                  </div>
                </SelectItem>
                <SelectItem value="REJECTED">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
                    Rejected
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterVerified}
              onValueChange={onFilterVerifiedChange}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}
