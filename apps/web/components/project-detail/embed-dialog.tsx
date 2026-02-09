"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { CodeBlock } from "@workspace/ui/components/code-block";
import { Code, Copy, Check } from "lucide-react";
import type { Project } from "@/types/api";

interface EmbedDialogProps {
  project: Project;
  trigger?: React.ReactNode;
}

type LayoutType = "carousel" | "grid" | "masonry" | "wall" | "list";

const layouts: { id: LayoutType; label: string }[] = [
  { id: "carousel", label: "Carousel" },
  { id: "grid", label: "Grid" },
  { id: "masonry", label: "Masonry" },
  { id: "wall", label: "Wall of Love" },
  { id: "list", label: "List" },
];

/**
 * Embed Dialog Component
 *
 * Provides easy access to embed codes in multiple formats:
 * - Script tag (recommended)
 * - iframe
 * - React component
 *
 * Design principle: Developer-first, copy-paste focused
 */
export function EmbedDialog({ project, trigger }: EmbedDialogProps) {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>("carousel");
  const [open, setOpen] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://tresta.app";

  const scriptCode = `<!-- Tresta Testimonial Widget -->
<div id="tresta-widget"></div>
<script 
  src="${baseUrl}/widget.js" 
  data-project="${project.slug}"
  data-layout="${selectedLayout}"
></script>`;

  const iframeCode = `<iframe 
  src="${baseUrl}/embed/${project.slug}?layout=${selectedLayout}"
  width="100%" 
  height="400"
  frameborder="0"
  loading="lazy"
></iframe>`;

  const reactCode = `import { TrestaWidget } from '@tresta/react';

function App() {
  return (
    <TrestaWidget 
      project="${project.slug}"
      layout="${selectedLayout}"
    />
  );
}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Code className="h-4 w-4" />
            Get Embed Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed on your website</DialogTitle>
          <DialogDescription>
            Copy one of these code snippets to display testimonials from{" "}
            <strong>{project.name}</strong> on your site.
          </DialogDescription>
        </DialogHeader>

        {/* Layout Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Layout:</span>
          <Select
            value={selectedLayout}
            onValueChange={(v) => setSelectedLayout(v as LayoutType)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layouts.map((layout) => (
                <SelectItem key={layout.id} value={layout.id}>
                  {layout.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Code Tabs */}
        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="script">Script Tag</TabsTrigger>
            <TabsTrigger value="iframe">iframe</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Add this script to your HTML. Works with any website.
            </p>
            <CodeBlock code={scriptCode} language="html" copyable />
          </TabsContent>

          <TabsContent value="iframe" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Use an iframe for sandboxed embedding. Simple but less
              customizable.
            </p>
            <CodeBlock code={iframeCode} language="html" copyable />
          </TabsContent>

          <TabsContent value="react" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Install the package first:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                npm install @tresta/react
              </code>
            </p>
            <CodeBlock code={reactCode} language="tsx" copyable />
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <a href="/docs" className="text-primary hover:underline">
            Read our integration guide
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
