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
import { CodeBlock } from "@workspace/ui/components/code-block";
import { Code } from "lucide-react";
import type { Project } from "@/types/api";
import { generateEmbedCodes, API_KEY_PLACEHOLDER } from "@/lib/embed-code";

interface EmbedDialogProps {
  project: Project;
  trigger?: React.ReactNode;
}

/**
 * Embed Dialog Component
 *
 * Provides easy access to embed codes in multiple formats:
 * - Script tag (recommended)
 * - iframe
 * - React component
 *
 * Design principle: Developer-first, copy-paste focused
 *
 * Note: This dialog works at the project level and uses a placeholder
 * widget ID. For production embed codes with the correct widget ID,
 * users should use the Embed button in the project's Widgets tab.
 */
export function EmbedDialog({ project, trigger }: EmbedDialogProps) {
  const [open, setOpen] = useState(false);

  const embedCodes = generateEmbedCodes({
    widgetId: "YOUR_WIDGET_ID",
  });

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

        {/* Placeholder notice */}
        <div className="p-3 bg-info-bg border border-border rounded-md">
          <p className="text-xs text-info-text">
            Replace{" "}
            <code className="bg-info-highlight-bg px-1 py-0.5 rounded">
              {API_KEY_PLACEHOLDER}
            </code>{" "}
            and{" "}
            <code className="bg-info-highlight-bg px-1 py-0.5 rounded">
              YOUR_WIDGET_ID
            </code>{" "}
            with your actual values from the <strong>Widgets</strong> tab in
            your project settings.
          </p>
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
            <CodeBlock code={embedCodes.script} language="html" copyable />
          </TabsContent>

          <TabsContent value="iframe" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Use an iframe for sandboxed embedding. Simple but less
              customizable.
            </p>
            <CodeBlock code={embedCodes.iframe} language="html" copyable />
          </TabsContent>

          <TabsContent value="react" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              For React/Next.js projects. The widget script handles all
              rendering automatically with your configured settings.
            </p>
            <CodeBlock code={embedCodes.react} language="tsx" copyable />
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
