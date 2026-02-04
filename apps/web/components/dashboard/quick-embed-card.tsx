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

interface QuickEmbedCardProps {
  projects: Project[];
}

/**
 * Quick Embed Card for the dashboard sidebar
 * Allows quick copying of embed code and collection links
 * 
 * Design principle: Developer-first, copy-paste focused
 */
export function QuickEmbedCard({ projects }: QuickEmbedCardProps) {
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>(
    projects[0]?.slug || ""
  );

  const selectedProject = projects.find((p) => p.slug === selectedProjectSlug);

  const handleCopyCollectionLink = async () => {
    if (!selectedProject) return;
    const link = `${window.location.origin}/collect/${selectedProject.slug}`;
    await navigator.clipboard.writeText(link);
  };

  if (projects.length === 0) {
    return null;
  }

  const embedCode = selectedProjectSlug
    ? `<script src="https://tresta.app/widget.js" 
  data-project="${selectedProjectSlug}"
  data-layout="carousel">
</script>`
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
        <Select value={selectedProjectSlug} onValueChange={setSelectedProjectSlug}>
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
