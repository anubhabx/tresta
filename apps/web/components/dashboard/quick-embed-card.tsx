"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { CodeBlock } from "@workspace/ui/components/code-block";
import { Code2, Link2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import type { Project } from "@/types/api";
import { generateScriptEmbed, API_KEY_PLACEHOLDER } from "@/lib/embed-code";

interface QuickEmbedCardProps {
  projects: Project[];
}

/**
 * Quick Embed Card for the dashboard sidebar
 * Allows quick copying of embed code and collection links
 *
 * Design principle: Developer-first, copy-paste focused
 *
 * Note: This card requires a widget ID for correct embed code.
 * Since we only have project-level data here, we show a placeholder
 * widget ID that the user should replace with their actual widget ID
 * from the project's Widgets tab.
 */
export function QuickEmbedCard({ projects }: QuickEmbedCardProps) {
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>(
    projects[0]?.slug || "",
  );

  const selectedProject = projects.find((p) => p.slug === selectedProjectSlug);

  const handleCopyCollectionLink = async () => {
    if (!selectedProject) return;
    const link = `${window.location.origin}/testimonials/${selectedProject.slug}`;
    await navigator.clipboard.writeText(link);
  };

  if (projects.length === 0) {
    return null;
  }

  const embedCode = selectedProjectSlug
    ? generateScriptEmbed({
        widgetId: "YOUR_WIDGET_ID",
      })
    : "";

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Code2 className="h-4 w-4 text-primary" />
          Quick Embed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Selector */}
        <Select
          value={selectedProjectSlug}
          onValueChange={setSelectedProjectSlug}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.slug}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Embed Code */}
        {selectedProjectSlug && (
          <>
            <CodeBlock code={embedCode} language="html" copyable />

            <p className="text-xs text-muted-foreground">
              Replace{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                {API_KEY_PLACEHOLDER}
              </code>{" "}
              and{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                YOUR_WIDGET_ID
              </code>{" "}
              with values from the project&apos;s Widgets tab.
            </p>

            {/* Collection Link Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleCopyCollectionLink}
            >
              <Link2 className="h-4 w-4" />
              Copy Collection Link
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
