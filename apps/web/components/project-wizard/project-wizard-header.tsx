/**
 * Project Wizard Header Component
 *
 * Navigation header with back button and context-aware title
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface ProjectWizardHeaderProps {
  /** Create or edit mode */
  mode: "create" | "edit";
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Optional class name */
  className?: string;
}

export function ProjectWizardHeader({
  mode,
  isSubmitting,
  onBack,
  className,
}: ProjectWizardHeaderProps) {
  const title = mode === "create" ? "Create New Project" : "Edit Project";
  const subtitle =
    mode === "create"
      ? "Set up your project to start collecting testimonials"
      : "Update your project settings";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="hidden sm:block h-6 w-px bg-border" />

            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                {mode === "create" && (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
                {title}
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right: Progress indicator or actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Configure</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <span>Preview</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted" />
                <span>Launch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
