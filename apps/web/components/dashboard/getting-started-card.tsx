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
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
      >
        Show getting started tips
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-muted/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Getting Started</CardTitle>
            <CardDescription>Tips to get the most out of Tresta</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
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
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                1
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Create a project and customize its branding
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                2
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Share the collection link with your customers
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                3
              </span>
              <span className="text-muted-foreground leading-relaxed">
                Review and approve testimonials as they come in
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
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
