"use client";

import { useState } from "react";
import { testimonials } from "@/lib/queries";
import { TestimonialCard } from "./testimonial-card";
import { LoadingStars } from "./loader";
import type { Testimonial } from "@/types/api";

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
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

interface TestimonialListProps {
  projectSlug: string;
}

type FilterStatus = "all" | "pending" | "approved" | "published";

export function TestimonialList({ projectSlug }: TestimonialListProps) {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    limit
  );

  const updateTestimonial = testimonials.mutations.useUpdate(
    projectSlug,
    "" // ID will be provided in the action
  );
  const deleteTestimonial = testimonials.mutations.useDelete(
    projectSlug,
    "" // ID will be provided in the action
  );

  // Filter testimonials based on status and search
  const filteredTestimonials = data?.data?.filter((t: Testimonial) => {
    // Status filter
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && !t.isApproved) ||
      (filterStatus === "approved" && t.isApproved && !t.isPublished) ||
      (filterStatus === "published" && t.isPublished);

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.authorEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    await testimonials.mutations
      .useUpdate(projectSlug, id)
      .mutateAsync({ isApproved: true });
  };

  const handleReject = async (id: string) => {
    await testimonials.mutations
      .useUpdate(projectSlug, id)
      .mutateAsync({ isApproved: false });
  };

  const handlePublish = async (id: string) => {
    await testimonials.mutations
      .useUpdate(projectSlug, id)
      .mutateAsync({ isPublished: true });
  };

  const handleUnpublish = async (id: string) => {
    await testimonials.mutations
      .useUpdate(projectSlug, id)
      .mutateAsync({ isPublished: false });
  };

  const handleDelete = async (id: string) => {
    await testimonials.mutations.useDelete(projectSlug, id).mutateAsync();
  };

  const getStatusCounts = () => {
    if (!data?.data) return { pending: 0, approved: 0, published: 0 };
    return {
      pending: data.data.filter((t: Testimonial) => !t.isApproved).length,
      approved: data.data.filter(
        (t: Testimonial) => t.isApproved && !t.isPublished
      ).length,
      published: data.data.filter((t: Testimonial) => t.isPublished).length,
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
            <Badge variant="outline" className="text-sm border-yellow-500 text-yellow-600">
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
      </div>

      {/* Filters */}
      {hasTestimonials && (
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
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onApprove={handleApprove}
                onReject={handleReject}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onDelete={handleDelete}
              />
            ))}
          </div>

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
