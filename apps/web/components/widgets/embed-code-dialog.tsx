"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { CopyIcon, CheckIcon, Code2Icon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

interface EmbedCodeDialogProps {
  widgetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedCodeDialog({
  widgetId,
  isOpen,
  onClose,
}: EmbedCodeDialogProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const embedUrl = `${apiUrl}/api/widgets/${widgetId}/public`;

  const scriptCode = `<!-- Tresta Widget -->
<div id="tresta-widget-${widgetId}"></div>
<script>
  (function() {
    fetch('${embedUrl}')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const container = document.getElementById('tresta-widget-${widgetId}');
          const testimonials = data.data.testimonials;

          testimonials.forEach(testimonial => {
            const card = document.createElement('div');
            card.className = 'tresta-testimonial-card';
            card.innerHTML = \`
              <div class="tresta-testimonial-header">
                <h4>\${testimonial.authorName}</h4>
                \${testimonial.rating ? '<div class="tresta-rating">' + '⭐'.repeat(testimonial.rating) + '</div>' : ''}
              </div>
              <p class="tresta-testimonial-content">\${testimonial.content}</p>
            \`;
            container.appendChild(card);
          });
        }
      })
      .catch(err => console.error('Tresta widget error:', err));
  })();
</script>
<style>
  .tresta-testimonial-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .tresta-testimonial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .tresta-testimonial-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  .tresta-rating {
    font-size: 14px;
  }
  .tresta-testimonial-content {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
  }
</style>`;

  const iframeCode = `<!-- Tresta Widget (iframe) -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="Testimonials"
></iframe>`;

  const reactCode = `import { widgets } from '@/lib/queries';

function TestimonialWidget() {
  const { data, isLoading } = widgets.queries.usePublicData('${widgetId}');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="testimonial-widget">
      {data?.testimonials.map((testimonial) => (
        <div key={testimonial.id} className="testimonial-card">
          <div className="testimonial-header">
            <h4>{testimonial.authorName}</h4>
            {testimonial.rating && (
              <div className="rating">
                {'⭐'.repeat(testimonial.rating)}
              </div>
            )}
          </div>
          <p>{testimonial.content}</p>
        </div>
      ))}
    </div>
  );
}`;

  const apiEndpoint = `GET ${embedUrl}`;

  const handleCopy = async (code: string, tab: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTab(tab);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2Icon className="h-5 w-5" />
            Embed Code
          </DialogTitle>
          <DialogDescription>
            Copy and paste the code below to embed testimonials on your website
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="script">JavaScript</TabsTrigger>
            <TabsTrigger value="iframe">iframe</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Vanilla JavaScript</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(scriptCode, "script")}
                >
                  {copiedTab === "script" ? (
                    <CheckIcon className="h-4 w-4 mr-1.5" />
                  ) : (
                    <CopyIcon className="h-4 w-4 mr-1.5" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{scriptCode}</code>
              </pre>
              <p className="text-xs text-muted-foreground">
                Paste this code anywhere in your HTML. The widget will
                automatically load and display your testimonials.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="iframe" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">iframe Embed</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(iframeCode, "iframe")}
                >
                  {copiedTab === "iframe" ? (
                    <CheckIcon className="h-4 w-4 mr-1.5" />
                  ) : (
                    <CopyIcon className="h-4 w-4 mr-1.5" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{iframeCode}</code>
              </pre>
              <p className="text-xs text-muted-foreground">
                Simple iframe embed. Adjust width and height as needed for your
                design.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="react" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">React Component</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(reactCode, "react")}
                >
                  {copiedTab === "react" ? (
                    <CheckIcon className="h-4 w-4 mr-1.5" />
                  ) : (
                    <CopyIcon className="h-4 w-4 mr-1.5" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{reactCode}</code>
              </pre>
              <p className="text-xs text-muted-foreground">
                For React/Next.js projects. Requires TanStack Query setup.
                Customize the component to match your design.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">API Endpoint</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(embedUrl, "api")}
                  >
                    {copiedTab === "api" ? (
                      <CheckIcon className="h-4 w-4 mr-1.5" />
                    ) : (
                      <CopyIcon className="h-4 w-4 mr-1.5" />
                    )}
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(embedUrl, "_blank")}
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1.5" />
                    Test
                  </Button>
                </div>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{apiEndpoint}</code>
              </pre>
              <p className="text-xs text-muted-foreground">
                Public API endpoint. No authentication required. Cached for 5
                minutes. Build your own custom integration.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
                <p className="text-xs font-medium mb-1">Response Format:</p>
                <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
                  <code>{`{
  "success": true,
  "data": {
    "widget": { "id": "...", "config": {...} },
    "project": { "name": "...", "logoUrl": "..." },
    "testimonials": [
      {
        "id": "...",
        "authorName": "...",
        "content": "...",
        "rating": 5,
        "createdAt": "..."
      }
    ]
  }
}`}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Widget ID:{" "}
            <code className="bg-muted px-1 py-0.5 rounded">{widgetId}</code>
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
