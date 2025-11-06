/**
 * Moderation Queue Filters
 * Controls for filtering and searching the moderation queue
 */

"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Filter, ShieldCheck, ShieldX } from "lucide-react";

interface ModerationFiltersProps {
  statusFilter: string;
  verifiedFilter: string;
  onStatusChange: (value: string) => void;
  onVerifiedChange: (value: string) => void;
  onReset: () => void;
}

export function ModerationFilters({
  statusFilter,
  verifiedFilter,
  onStatusChange,
  onVerifiedChange,
  onReset,
}: ModerationFiltersProps) {
  const hasFilters = statusFilter !== "all" || verifiedFilter !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending Review</SelectItem>
          <SelectItem value="flagged">Flagged</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={verifiedFilter} onValueChange={onVerifiedChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Verification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Verification</SelectItem>
          <SelectItem value="true">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>Verified</span>
            </div>
          </SelectItem>
          <SelectItem value="false">
            <div className="flex items-center gap-2">
              <ShieldX className="h-4 w-4 text-gray-400" />
              <span>Unverified</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="outline" onClick={onReset} size="sm">
          Reset Filters
        </Button>
      )}
    </div>
  );
}
