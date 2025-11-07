"use client";

import { Button } from "@workspace/ui/components/button";
import { Inbox, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

interface EmptyStatesProps {
  moderationMode?: boolean;
  hasTestimonials: boolean;
  hasFilteredResults: boolean;
  onCopyUrl: () => void;
}

export function EmptyStates({
  moderationMode = false,
  hasTestimonials,
  hasFilteredResults,
  onCopyUrl,
}: EmptyStatesProps) {
  // No testimonials at all
  if (!hasTestimonials) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Testimonials Yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Share your collection link to start receiving testimonials from your
          customers.
        </p>
        <Button variant="outline" size="lg" onClick={onCopyUrl}>
          <Sparkles className="h-4 w-4 mr-2" />
          Copy Collection Link
        </Button>
      </div>
    );
  }

  // Has testimonials but no filtered results
  if (!hasFilteredResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          {moderationMode ? (
            <ShieldCheck className="h-8 w-8 text-muted-foreground" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {moderationMode ? "All Clear!" : "No Approved Testimonials"}
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          {moderationMode
            ? "No testimonials need review. All submissions have been processed."
            : "Approve testimonials in the Moderation tab first, then publish them here."}
        </p>
      </div>
    );
  }

  return null;
}
