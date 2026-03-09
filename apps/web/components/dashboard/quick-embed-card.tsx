"use client";

import { useState } from "react";
import {
  Card,
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
    <Card className="backdrop-blur-xl border border-white/5 p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Quick Embed
        </h3>
      </div>

      <div className="space-y-4">
        {/* Project Selector */}
        <Select
          value={selectedProjectSlug}
          onValueChange={setSelectedProjectSlug}
        >
          <SelectTrigger className="w-full border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 hover:bg-white/10 transition-colors">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-zinc-300">
            {projects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.slug}
                className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Embed Code */}
        {selectedProjectSlug && (
          <>
            <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0d0d0d]">
              <CodeBlock code={embedCode} language="html" copyable />
            </div>

            <p className="text-xs text-zinc-400">
              Replace{" "}
              <code className="border border-white/10 text-zinc-300 px-1 py-0.5 rounded text-xs font-mono">
                {API_KEY_PLACEHOLDER}
              </code>{" "}
              and{" "}
              <code className="border border-white/10 text-zinc-300 px-1 py-0.5 rounded text-xs font-mono">
                YOUR_WIDGET_ID
              </code>{" "}
              with values from the project&apos;s Widgets tab.
            </p>

            {/* Collection Link Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              onClick={handleCopyCollectionLink}
            >
              <Link2 className="h-4 w-4" />
              Copy Collection Link
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
