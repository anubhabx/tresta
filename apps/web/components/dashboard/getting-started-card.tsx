"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function GettingStartedCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <CardDescription>
          Tips to get the most out of Tresta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
              1
            </span>
            <span className="text-muted-foreground">
              Create a project and customize its branding
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
              2
            </span>
            <span className="text-muted-foreground">
              Share the collection link with your customers
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
              3
            </span>
            <span className="text-muted-foreground">
              Review and approve testimonials as they come in
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
              4
            </span>
            <span className="text-muted-foreground">
              Publish approved testimonials to display them
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
