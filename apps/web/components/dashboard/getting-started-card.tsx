"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";

const STORAGE_KEY = "tresta-getting-started-dismissed";

export function GettingStartedCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Load dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleRestore = () => {
    setIsDismissed(false);
    setIsExpanded(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (isDismissed) {
    return (
      <button
        onClick={handleRestore}
        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 touch-manipulation min-h-[44px]"
      >
        Show getting started tips
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-muted/30">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm sm:text-base">Getting Started</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Tips to get the most out of Tresta
            </CardDescription>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 touch-manipulation"
              aria-label={isExpanded ? "Collapse tips" : "Expand tips"}
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground touch-manipulation"
              aria-label="Dismiss tips"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 sm:p-6 pt-0">
          <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                1
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Create a project and customize its branding
              </span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                2
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Share the collection link with your customers
              </span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                3
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Review and approve testimonials as they come in
              </span>
            </li>
            <li className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                4
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Publish approved testimonials to display them
              </span>
            </li>
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
