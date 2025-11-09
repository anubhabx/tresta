"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@workspace/ui/components/tabs";
import {
  CopyIcon,
  CheckIcon,
  Code2Icon,
  ExternalLinkIcon,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface EmbedCodeDialogProps {
  widgetId: string;
  apiKey?: string; // API key for the widget (optional for backward compatibility)
  projectSlug?: string; // Project slug to link to API keys page
  isOpen: boolean;
  onClose: () => void;
}

interface CodeTabProps {
  title: string;
  code: string;
  description: string;
  tabId: string;
  copiedTab: string | null;
  onCopy: (code: string, tabId: string) => void;
  extraAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
  additionalContent?: React.ReactNode;
}

function CodeTab({
  title,
  code,
  description,
  tabId,
  copiedTab,
  onCopy,
  extraAction,
  additionalContent
}: CodeTabProps) {
  return (
    <div className="space-y-3 min-h-[300px]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(code, tabId)}
          >
            {copiedTab === tabId ? (
              <CheckIcon className="h-4 w-4 mr-1.5" />
            ) : (
              <CopyIcon className="h-4 w-4 mr-1.5" />
            )}
            {copiedTab === tabId ? "Copied!" : "Copy"}
          </Button>
          {extraAction && (
            <Button size="sm" variant="outline" onClick={extraAction.onClick}>
              {extraAction.icon}
              {extraAction.label}
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[200px] text-xs border">
          <code className="text-xs font-mono">{code}</code>
        </pre>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
      {additionalContent}
    </div>
  );
}

export function EmbedCodeDialog({
  widgetId,
  apiKey,
  projectSlug,
  isOpen,
  onClose
}: EmbedCodeDialogProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const widgetScriptUrl = `${apiUrl}/widget/tresta-widget.js`;
  const iframeUrl = `${apiUrl}/api/public/embed/${widgetId}`;
  const apiEndpointUrl = `${apiUrl}/api/widgets/${widgetId}/public`;

  const apiKeyPlaceholder = "YOUR_API_KEY_HERE";
  const displayApiKey = apiKey || apiKeyPlaceholder;

  const embedCodes = {
    script: `<!-- Tresta Widget -->
<script 
  src="${widgetScriptUrl}" 
  data-tresta-widget="${widgetId}" 
  data-api-url="${apiUrl}"
  data-api-key="${displayApiKey}">
</script>`,

    iframe: `<!-- Tresta Widget (iframe) -->
<iframe
  src="${iframeUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="Testimonials"
></iframe>`,

    react: `import { useEffect } from 'react';

function TestimonialWidget() {
  useEffect(() => {
    // Load widget script
    const script = document.createElement('script');
    script.src = '${widgetScriptUrl}';
    script.setAttribute('data-tresta-widget', '${widgetId}');
    script.setAttribute('data-api-key', '${displayApiKey}');
    document.body.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (window.TrestaWidget) {
        window.TrestaWidget.destroy('${widgetId}');
      }
      document.body.removeChild(script);
    };
  }, []);

  return <div id="tresta-widget-container" />;
}`,

    api: `curl -X GET "${apiEndpointUrl}" \\
  -H "Authorization: Bearer ${displayApiKey}"`
  };

  const tabConfigs = [
    {
      id: "script",
      label: "JavaScript",
      title: "Vanilla JavaScript",
      code: embedCodes.script,
      description:
        "Paste this code anywhere in your HTML. The widget will automatically load and display your testimonials with the configured layout and styling."
    },
    {
      id: "iframe",
      label: "iframe",
      title: "iframe Embed",
      code: embedCodes.iframe,
      description:
        "Simple iframe embed. Adjust width and height as needed for your design."
    },
    {
      id: "react",
      label: "React",
      title: "React Component",
      code: embedCodes.react,
      description:
        "For React/Next.js projects. The widget script handles all rendering automatically with your configured settings."
    },
    {
      id: "api",
      label: "API",
      title: "API Endpoint",
      code: embedCodes.api,
      description:
        "Public API endpoint with API key authentication. Cached for 5 minutes. Build your own custom integration.",
      extraAction: {
        label: "Test",
        icon: <ExternalLinkIcon className="h-4 w-4 mr-1.5" />,
        onClick: () => {
          // Open with API key in authorization header (browser can't set headers directly, so just show the URL)
          toast.info(
            "Include Authorization: Bearer YOUR_API_KEY header when making requests"
          );
          window.open(apiEndpointUrl, "_blank");
        }
      },
      additionalContent: (
        <div>
          <p className="text-xs font-medium mb-2">Response Format:</p>
          <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-[120px] border">
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
      )
    }
  ];

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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Code2Icon className="h-5 w-5" />
            Embed Code
          </DialogTitle>
          <DialogDescription>
            Copy and paste the code below to embed testimonials on your website
          </DialogDescription>
        </DialogHeader>

        {!apiKey && (
          <div className="shrink-0 p-3 bg-info-bg border border-border rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-info-text mt-0.5" />
              <div className="flex-1 text-sm text-info-text">
                <p className="font-medium">API Key Required</p>
                <p className="text-xs mt-1">
                  Create an API key in the <strong>API Keys</strong> tab to
                  enable widget embedding. Replace{" "}
                  <code className="px-1 py-0.5 bg-info-highlight-bg rounded">
                    YOUR_API_KEY_HERE
                  </code>{" "}
                  with your actual API key.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs
          defaultValue="script"
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4 shrink-0">
            {tabConfigs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            {tabConfigs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <CodeTab
                  title={tab.title}
                  code={tab.code}
                  description={tab.description}
                  tabId={tab.id}
                  copiedTab={copiedTab}
                  onCopy={handleCopy}
                  extraAction={tab.extraAction}
                  additionalContent={tab.additionalContent}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t shrink-0">
          <p className="text-xs text-muted-foreground">
            Widget ID:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
              {widgetId}
            </code>
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
