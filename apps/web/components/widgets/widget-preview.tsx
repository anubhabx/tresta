"use client";

import { useEffect, useRef, useState } from "react";
import type { WidgetFormData } from "./widget-form";
import { Loader2 } from "lucide-react";

interface WidgetPreviewProps {
  config: WidgetFormData;
  widgetId?: string;
  testimonials?: any[];
}

export function WidgetPreview({
  config,
  widgetId,
  testimonials = [],
}: WidgetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWidget = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load the widget script dynamically
        const script = document.createElement("script");
        script.src = `${window.location.origin}/widget/tresta-widget.js`;
        script.async = true;

        script.onload = () => {
          // Wait for TrestaWidget to be available
          if (typeof (window as any).TrestaWidget !== "undefined") {
            renderWidget();
          } else {
            setError("Widget library loaded but TrestaWidget not found");
            setIsLoading(false);
          }
        };

        script.onerror = () => {
          setError("Failed to load widget library");
          setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    const renderWidget = () => {
      if (!containerRef.current) return;

      // Clear previous content
      containerRef.current.innerHTML = "";

      // Create widget container
      const widgetDiv = document.createElement("div");
      widgetDiv.className = "tresta-widget-preview";
      containerRef.current.appendChild(widgetDiv);

      // Mock testimonials if none provided
      const mockTestimonials = testimonials.length
        ? testimonials
        : [
            {
              id: "1",
              authorName: "John Doe",
              authorRole: "CEO",
              authorCompany: "Tech Corp",
              content:
                "This is an amazing product! It has completely transformed how we do business.",
              rating: 5,
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              authorName: "Jane Smith",
              authorRole: "Marketing Director",
              content:
                "Highly recommended. Great features and excellent support.",
              rating: 5,
              createdAt: new Date().toISOString(),
            },
            {
              id: "3",
              authorName: "Bob Johnson",
              authorRole: "Product Manager",
              authorCompany: "StartupXYZ",
              content:
                "Easy to use and very powerful. Our team loves it!",
              rating: 5,
              createdAt: new Date().toISOString(),
            },
          ];

      // Configure widget based on form data
      const widgetConfig = {
        id: widgetId || "preview",
        layout: config.layout,
        theme: {
          primaryColor: config.primaryColor || "#0066FF",
          secondaryColor: config.secondaryColor || "#00CC99",
          mode: config.theme || "light",
        },
        settings: {
          showRating: config.showRating,
          showDate: config.showDate,
          showAvatar: config.showAvatar,
          maxTestimonials: config.maxTestimonials,
          autoRotate: config.autoRotate,
          rotateInterval: config.rotateInterval,
          columns: config.columns,
          cardStyle: config.cardStyle,
          animation: config.animation,
        },
        testimonials: mockTestimonials,
      };

      // Initialize widget
      try {
        if ((window as any).TrestaWidget && (window as any).TrestaWidget.init) {
          (window as any).TrestaWidget.init(widgetDiv, widgetConfig);
          setIsLoading(false);
        } else {
          setError("Widget init method not found");
          setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to render widget");
        setIsLoading(false);
      }
    };

    loadWidget();
  }, [config, widgetId, testimonials]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading preview...
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-muted/20 p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-destructive mb-2">Preview Error</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure the widget is built: <code className="bg-muted px-1.5 py-0.5 rounded">cd packages/widget && pnpm build</code>
            </p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="min-h-[400px] w-full"
          />
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        This preview updates in real-time as you change settings above
      </p>
    </div>
  );
}
