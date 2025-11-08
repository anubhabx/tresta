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
  const scriptLoadedRef = useRef(false);
  const widgetInstanceRef = useRef<any>(null);

  // Load the widget script only once
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const loadWidget = async () => {
      console.log("[WidgetPreview] Starting script load...");
      setIsLoading(true);
      setError(null);

      try {
        // Check if script is already loaded
        if (typeof (window as any).TrestaWidget !== "undefined") {
          console.log("[WidgetPreview] Script already loaded");
          scriptLoadedRef.current = true;
          setIsLoading(false);
          return;
        }

        // Load the widget script dynamically
        const script = document.createElement("script");
        script.src = `${window.location.origin}/widget/tresta-widget.js`;
        script.async = true;

        console.log("[WidgetPreview] Loading script from:", script.src);

        script.onload = () => {
          console.log("[WidgetPreview] Script loaded");
          // Wait for TrestaWidget to be available
          if (typeof (window as any).TrestaWidget !== "undefined") {
            console.log("[WidgetPreview] TrestaWidget is available");
            scriptLoadedRef.current = true;
            setIsLoading(false);
          } else {
            console.error("[WidgetPreview] TrestaWidget not found after load");
            setError("Widget library loaded but TrestaWidget not found");
            setIsLoading(false);
          }
        };

        script.onerror = (e) => {
          console.error("[WidgetPreview] Script load error:", e);
          setError("Failed to load widget library");
          setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
          // Only remove if we added it
          if (script.parentNode) {
            document.body.removeChild(script);
          }
        };
      } catch (err) {
        console.error("[WidgetPreview] Exception during load:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    loadWidget();
  }, []); // Only run once on mount

  // Render/update widget when config changes
  useEffect(() => {
    console.log("[WidgetPreview] Render effect triggered", {
      scriptLoaded: scriptLoadedRef.current,
      hasContainer: !!containerRef.current,
      configLayout: config.layout,
    });

    if (!scriptLoadedRef.current || !containerRef.current) {
      console.log(
        "[WidgetPreview] Not ready - script loaded:",
        scriptLoadedRef.current,
        "has container:",
        !!containerRef.current,
      );
      return;
    }

    const renderWidget = () => {
      if (!containerRef.current) return;

      console.log("[WidgetPreview] Starting render...");

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
              authorName: "Sarah Johnson",
              authorRole: "CEO",
              authorCompany: "Tech Innovations Inc",
              content:
                "This is an amazing product! It has completely transformed how we collect and display customer testimonials. The ease of use and beautiful design make it a no-brainer.",
              rating: 5,
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              authorAvatar: undefined,
            },
            {
              id: "2",
              authorName: "Michael Chen",
              authorRole: "Marketing Director",
              authorCompany: "Digital Solutions",
              content:
                "Highly recommended! The widget looks professional and integrates seamlessly with our website. Our conversion rates have improved significantly.",
              rating: 5,
              createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
              authorAvatar: undefined,
            },
            {
              id: "3",
              authorName: "Emily Rodriguez",
              authorRole: "Product Manager",
              authorCompany: "StartupXYZ",
              content:
                "Easy to use and very powerful. Our team loves how simple it is to customize the widget to match our brand. Great support too!",
              rating: 5,
              createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
              authorAvatar: undefined,
            },
            {
              id: "4",
              authorName: "David Thompson",
              authorRole: "Founder",
              authorCompany: "Growth Labs",
              content:
                "The best testimonial solution we've tried. The variety of layouts and customization options are exactly what we needed.",
              rating: 4,
              createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
              authorAvatar: undefined,
            },
            {
              id: "5",
              authorName: "Lisa Anderson",
              authorRole: "Head of Sales",
              authorCompany: "Enterprise Corp",
              content:
                "Our clients trust us more now that they can see authentic testimonials beautifully displayed on our site. Worth every penny!",
              rating: 5,
              createdAt: new Date(Date.now() - 1814400000).toISOString(), // 3 weeks ago
              authorAvatar: undefined,
            },
            {
              id: "6",
              authorName: "James Wilson",
              authorRole: "CTO",
              authorCompany: "Cloud Systems",
              content:
                "Excellent! The widget is lightweight, fast, and doesn't impact our page load times. Exactly what we were looking for.",
              rating: 5,
              createdAt: new Date(Date.now() - 2592000000).toISOString(), // 1 month ago
              authorAvatar: undefined,
            },
          ];

      // Configure widget based on form data
      const widgetConfig = {
        widgetId: widgetId || "preview-" + Date.now(),
        container: widgetDiv,
        adaptToHost: false, // Disable auto-theming in preview mode
        theme: {
          primaryColor: config.primaryColor || "#0066FF",
          backgroundColor: config.theme === "dark" ? "#1a1a1a" : "#ffffff",
          textColor: config.theme === "dark" ? "#e5e7eb" : "#1f2937",
          cardBackgroundColor: config.theme === "dark" ? "#2a2a2a" : "#f9fafb",
          borderRadius: 12,
          starColor: "#fbbf24",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        settings: {
          layout: config.layout,
          showRating: config.showRating ?? true,
          showDate: config.showDate ?? true,
          showAvatar: config.showAvatar ?? false,
          showAuthorRole: config.showAuthorRole ?? true,
          showAuthorCompany: config.showAuthorCompany ?? true,
          maxTestimonials: Math.min(config.maxTestimonials || 10, 6), // Limit to 6 for preview
          autoplay: config.autoRotate ?? true, // Enable autoplay by default for preview
          autoplaySpeed: config.rotateInterval || 5000,
          columns: config.columns || 3,
          gap: 16,
          showNavigation: false, // Hide navigation buttons in preview for cleaner look
        },
        // Mock widget data for preview
        mockData: {
          widget: {
            id: widgetId || "preview",
            name: "Preview Widget",
            type: "testimonial" as const,
            layout: config.layout as any,
            theme: {
              primaryColor: config.primaryColor || "#0066FF",
              backgroundColor: config.theme === "dark" ? "#1a1a1a" : "#ffffff",
              textColor: config.theme === "dark" ? "#e5e7eb" : "#1f2937",
              cardBackgroundColor:
                config.theme === "dark" ? "#2a2a2a" : "#f9fafb",
              borderRadius: 8,
              starColor: "#fbbf24",
            },
            settings: {
              layout: config.layout,
              showRating: config.showRating ?? true,
              showDate: config.showDate ?? true,
              showAvatar: config.showAvatar ?? false,
              showAuthorRole: config.showAuthorRole ?? true,
              showAuthorCompany: config.showAuthorCompany ?? true,
              maxTestimonials: Math.min(config.maxTestimonials || 10, 6),
              autoplay: config.autoRotate ?? true, // Enable autoplay by default
              autoplaySpeed: config.rotateInterval || 5000,
              columns: config.columns || 3,
              showNavigation: false, // Hide navigation buttons in preview
            },
            testimonials: mockTestimonials,
          },
          testimonials: mockTestimonials,
        },
      };

      // Initialize widget
      try {
        console.log("[WidgetPreview] Attempting to initialize widget");
        console.log(
          "[WidgetPreview] TrestaWidget available?",
          typeof (window as any).TrestaWidget,
        );
        console.log("[WidgetPreview] Widget config:", widgetConfig);

        if ((window as any).TrestaWidget) {
          // Instantiate widget directly for preview with mock data
          const widgetInstance = new (window as any).TrestaWidget(widgetConfig);
          console.log(
            "[WidgetPreview] Widget instance created:",
            widgetInstance,
          );
        } else {
          console.error("[WidgetPreview] TrestaWidget not available");
          setError("Widget library not loaded");
        }
      } catch (err) {
        console.error("[WidgetPreview] Error initializing widget:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render widget",
        );
      }
    };

    renderWidget();
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

      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: config.theme === "dark" ? "#0a0a0a" : "#fafafa",
        }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-destructive mb-2">Preview Error</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure the widget is built:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded">
                cd packages/widget && pnpm build
              </code>
            </p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="min-h-[500px] max-h-[700px] w-full overflow-auto p-8"
          />
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Preview updates in real-time as you change settings. Mock testimonials
        are shown for demonstration.
      </p>
    </div>
  );
}
