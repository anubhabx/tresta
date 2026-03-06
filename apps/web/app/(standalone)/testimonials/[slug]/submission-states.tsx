"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Ban, CheckCircle2, Linkedin, Twitter } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { CollectionPageShell } from "@/components/testimonials/collection-page-shell";
import type { Project } from "@/types/api";

interface ExistingSubmissionStateProps {
  slug: string;
  formattedExistingDate: string | null;
}

export function ExistingSubmissionState({
  slug,
  formattedExistingDate,
}: ExistingSubmissionStateProps) {
  return (
    <CollectionPageShell centered>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="w-full border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardContent className="card-spacious text-center stack-loose">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Ban className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-3">
                Already Submitted
              </h1>
              <p className="text-muted-foreground">
                Thanks for your enthusiasm! We already have your testimonial on
                file.
              </p>
            </div>
            {formattedExistingDate && (
              <p className="text-sm text-muted-foreground">
                Submitted on {formattedExistingDate}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href={`/testimonials/${slug}`}>View Testimonials</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@tresta.app?subject=Testimonial%20Update">
                  Need to update yours?
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </CollectionPageShell>
  );
}

interface SuccessSubmissionStateProps {
  project: Project | null;
}

export function SuccessSubmissionState({ project }: SuccessSubmissionStateProps) {
  return (
    <CollectionPageShell centered>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full"
      >
        <Card className="w-full border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CardContent className="card-spacious text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="flex justify-center mb-6"
            >
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-semibold tracking-tight mb-3">
                Thank You!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {project?.formConfig?.thankYouMessage ||
                  "Your testimonial has been submitted and is pending review. We truly appreciate your feedback!"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">Share your experience</p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const text = `I just shared my testimonial for ${project?.name || "this product"}! 🎉`;
                    const url =
                      typeof window !== "undefined" ? window.location.origin : "";
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                      "_blank",
                    );
                  }}
                  className="h-10 w-10"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const text = `I just shared my testimonial for ${project?.name || "this product"}!`;
                    const url =
                      typeof window !== "undefined" ? window.location.origin : "";
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
                      "_blank",
                    );
                  }}
                  className="h-10 w-10"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>

              {project && (
                <Button variant="ghost" asChild className="mt-4">
                  <Link href={project.websiteUrl || "/"}>Visit {project.name}</Link>
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </CollectionPageShell>
  );
}

export function LoadingSubmissionState() {
  return (
    <CollectionPageShell>
      <Card className="w-full border-border/60 bg-card shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="text-center pt-8 pb-5 px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2.5 w-full max-w-xs mx-auto">
              <div className="h-7 bg-muted animate-pulse rounded mx-auto w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded mx-auto w-full" />
            </div>
          </div>
        </CardHeader>
        <div className="px-6 pb-8 space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-10 bg-muted animate-pulse rounded-md" />
          ))}
          <div className="h-24 bg-muted animate-pulse rounded-md" />
          <div className="h-12 bg-muted animate-pulse rounded-lg" />
        </div>
      </Card>
    </CollectionPageShell>
  );
}
