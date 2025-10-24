"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { LayoutGridIcon, PlusIcon } from "lucide-react";

interface WidgetEmptyStateProps {
  onCreateWidget: () => void;
}

export function WidgetEmptyState({ onCreateWidget }: WidgetEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <LayoutGridIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No Widgets Yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Create your first widget to display testimonials on your website.
          Widgets are embeddable components that showcase your social proof.
        </p>
        <Button size="lg" onClick={onCreateWidget}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Your First Widget
        </Button>
      </CardContent>
    </Card>
  );
}
