"use client";

import { useState } from "react";
import { testimonials, moderation } from "@/lib/queries";
import { TestimonialCard } from "./testimonial-card";
import { LoadingStars } from "./loader";
import type { Testimonial, ModerationStatus } from "@/types/api";

import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent } from "@workspace/ui/components/card";

interface TestimonialListProps {
  projectSlug: string;
}

type FilterStatus = "all" | "pending" | "approved" | "published";
type ModerationFilter = "all" | "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";

export function TestimonialList({ projectSlug }: TestimonialListProps) {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [filterModeration, setFilterModeration] = useState<ModerationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const limit = 10;

  const collectionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/testimonials/${projectSlug}`
      : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(collectionUrl);
    toast.success("Collection URL copied to clipboard!");
  };

  const { data, isLoading } = testimonials.queries.useList(
    projectSlug,
    page,
    limit,
  );

  // Create mutation hooks at component level
  const updateMutation = testimonials.mutations.useUpdate(projectSlug);
  const deleteMutation = testimonials.mutations.useDelete(projectSlug);
  const bulkModerationMutation = moderation.mutations.useBulkAction(projectSlug);

  // Filter testimonials based on all criteria
  const filteredTestimonials = data?.data?.filter((t: Testimonial) => {
    // Status filter
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && !t.isApproved) ||
      (filterStatus === "approved" && t.isApproved && !t.isPublished) ||
      (filterStatus === "published" && t.isPublished);

    // Verification filter
    const matchesVerified =
      filterVerified === "all" ||
      (filterVerified === "verified" && t.isOAuthVerified) ||
      (filterVerified === "unverified" && !t.isOAuthVerified);

    // Moderation filter
    const matchesModeration =
      filterModeration === "all" ||
      t.moderationStatus === filterModeration;

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.authorEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesVerified && matchesModeration && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { isApproved: true } });
      toast.success("Testimonial approved!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve testimonial");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { isApproved: false } });
      toast.success("Testimonial rejected");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject testimonial");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: true } });
      toast.success("Testimonial published!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to publish testimonial");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { isPublished: false } });
      toast.success("Testimonial unpublished");
    } catch (error: any) {
      toast.error(error?.message || "Failed to unpublish testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Testimonial deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete testimonial");
    }
  };

  // Bulk moderation handlers
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }
    
    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: selectedIds,
        action: "approve"
      });
      toast.success(`${selectedIds.length} testimonial(s) approved`);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve testimonials");
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }
    
    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: selectedIds,
        action: "reject"
      });
      toast.success(`${selectedIds.length} testimonial(s) rejected`);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject testimonials");
    }
  };

  const handleBulkFlag = async () => {
    if (selectedIds.length === 0) {
      toast.error("No testimonials selected");
      return;
    }
    
    try {
      await bulkModerationMutation.mutateAsync({
        testimonialIds: selectedIds,
        action: "flag"
      });
      toast.success(`${selectedIds.length} testimonial(s) flagged for review`);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to flag testimonials");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTestimonials?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTestimonials?.map((t: Testimonial) => t.id) || []);
    }
  };

  const getStatusCounts = () => {
    if (!data?.data) return { pending: 0, approved: 0, published: 0 };
    return {
      pending: data.data.filter((t: Testimonial) => !t.isApproved).length,
      approved: data.data.filter(
        (t: Testimonial) => t.isApproved && !t.isPublished,
      ).length,
      published: data.data.filter((t: Testimonial) => t.isPublished).length,
    };
  };

  const getModerationCounts = () => {
    if (!data?.data) return { pending: 0, approved: 0, flagged: 0, rejected: 0 };
    return {
      pending: data.data.filter((t: Testimonial) => t.moderationStatus === 'PENDING').length,
      approved: data.data.filter((t: Testimonial) => t.moderationStatus === 'APPROVED').length,
      flagged: data.data.filter((t: Testimonial) => t.moderationStatus === 'FLAGGED').length,
      rejected: data.data.filter((t: Testimonial) => t.moderationStatus === 'REJECTED').length,
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full h-64 items-center justify-center">
        <LoadingStars />
        <p className="text-sm text-muted-foreground">Loading testimonials...</p>
      </div>
    );
  }

  const counts = getStatusCounts();
  const moderationCounts = getModerationCounts();
  const hasTestimonials = data?.data && data.data.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Total: {data?.meta?.pagination?.total || 0}
          </Badge>
          {counts.pending > 0 && (
            <Badge
              variant="outline"
              className="text-sm border-yellow-500 text-yellow-600"
            >
              Pending: {counts.pending}
            </Badge>
          )}
          {counts.approved > 0 && (
            <Badge variant="secondary" className="text-sm">
              Approved: {counts.approved}
            </Badge>
          )}
          {counts.published > 0 && (
            <Badge variant="default" className="text-sm bg-green-500">
              Published: {counts.published}
            </Badge>
          )}
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          {moderationCounts.flagged > 0 && (
            <Badge variant="destructive" className="text-sm">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Flagged: {moderationCounts.flagged}
            </Badge>
          )}
          {moderationCounts.rejected > 0 && (
            <Badge variant="outline" className="text-sm border-red-500 text-red-600">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected: {moderationCounts.rejected}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      {hasTestimonials && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.length === filteredTestimonials?.length && filteredTestimonials?.length > 0}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Select All ({filteredTestimonials?.length || 0})
            </label>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedIds.length} selected
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Testimonials</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterVerified}
              onValueChange={(value) => setFilterVerified(value as "all" | "verified" | "unverified")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterModeration}
              onValueChange={(value) => setFilterModeration(value as ModerationFilter)}
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
          </div>
        </div>
      )}

      {/* Testimonials Grid */}
      {!hasTestimonials ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Testimonials Yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Share your collection link to start receiving testimonials from your
            customers.
          </p>
          <Button variant="outline" size="lg" onClick={handleCopyUrl}>
            <Sparkles className="h-4 w-4 mr-2" />
            Copy Collection Link
          </Button>
        </div>
      ) : filteredTestimonials && filteredTestimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTestimonials?.map((testimonial: Testimonial) => (
              <div key={testimonial.id} className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedIds.includes(testimonial.id)}
                    onCheckedChange={() => toggleSelection(testimonial.id)}
                    className="bg-background border-2"
                  />
                </div>
                <TestimonialCard
                  testimonial={testimonial}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onPublish={handlePublish}
                  onUnpublish={handleUnpublish}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Fixed Bottom Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
              <Card className="shadow-2xl border-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-base font-semibold">
                        {selectedIds.length}
                      </Badge>
                      <span className="text-sm font-medium">selected</span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleBulkApprove}
                        disabled={bulkModerationMutation.isPending}
                        size="sm"
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={handleBulkFlag}
                        disabled={bulkModerationMutation.isPending}
                        size="sm"
                        variant="secondary"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Flag
                      </Button>
                      <Button
                        onClick={handleBulkReject}
                        disabled={bulkModerationMutation.isPending}
                        size="sm"
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <Button
                      onClick={() => setSelectedIds([])}
                      size="sm"
                      variant="ghost"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pagination */}
          {data?.meta?.pagination && data.meta.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.pagination.page} of{" "}
                {data.meta.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.meta.pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.meta.pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
