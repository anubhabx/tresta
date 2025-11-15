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
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors touch-manipulation">
          <Checkbox
            checked={selectAllChecked}
            onCheckedChange={onToggleSelectAll}
            id="select-all"
            className="h-5 w-5 flex-shrink-0"
          />
          <label
            htmlFor="select-all"
            className="text-xs sm:text-sm font-medium leading-none cursor-pointer flex items-center gap-2 flex-1 min-w-0"
          >
            <span className="flex-shrink-0">Select All</span>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {totalCount}
            </Badge>
            {selectedCount > 0 && (
              <span className="text-muted-foreground text-xs truncate">
                ({selectedCount} selected)
              </span>
            )}
          </label>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, or content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 sm:h-10 text-sm"
          />
        </div>
        
        {/* Filter Selects */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">

          {/* Basic Status Filter - Normal mode only */}
          {!moderationMode && (
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10">
                <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
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
                <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Moderation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moderation</SelectItem>
                  <SelectItem value="PENDING">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-warning mr-2 flex-shrink-0" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="APPROVED">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-success mr-2 flex-shrink-0" />
                      Approved
                    </div>
                  </SelectItem>
                  <SelectItem value="FLAGGED">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-destructive mr-2 flex-shrink-0" />
                      Flagged
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground mr-2 flex-shrink-0" />
                      Rejected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterVerified}
                onValueChange={onFilterVerifiedChange}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10">
                  <ShieldCheck className="h-4 w-4 mr-2 flex-shrink-0" />
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
    </div>
  );
}
