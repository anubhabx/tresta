"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WidgetFormData } from "./widget-form";
import { Loader2 } from "lucide-react";

const WIDGET_SCRIPT_PATH = "/widget/tresta-widget.js";
const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface WidgetPreviewProps {
  config: WidgetFormData;
  widgetId?: string;
  testimonials?: any[];
}

type WidgetGlobal = {
  mount: (container: HTMLElement | string, options: Record<string, unknown>) => Promise<unknown>;
};

export function WidgetPreview({
  config,
  widgetId,
  testimonials = [],
}: WidgetPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const scriptElementRef = useRef<HTMLScriptElement | null>(null);
  const widgetInstanceRef = useRef<{ instance: any; container: HTMLElement } | null>(null);
  const restoreFetchRef = useRef<(() => void) | null>(null);
  const inlineLoadAttemptedRef = useRef(false);

  const loadWidgetInline = useCallback(async () => {
    if (inlineLoadAttemptedRef.current) {
      return hasWidgetGlobal();
    }

    inlineLoadAttemptedRef.current = true;

    try {
      await import("@workspace/widget");

      if (hasWidgetGlobal()) {
        console.info("[WidgetPreview] Loaded widget library via inline fallback");
        scriptLoadedRef.current = true;
        setScriptReady(true);
        return true;
      }

      throw new Error("TrestaWidget global missing after inline import");
    } catch (inlineError) {
      console.error("[WidgetPreview] Inline widget load failed", inlineError);
      setError("Failed to load widget library");
      setIsLoading(false);
      return false;
    }
  }, []);

  // Load the widget script only once
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (hasWidgetGlobal()) {
      scriptLoadedRef.current = true;
      setScriptReady(true);
      return;
    }

    if (scriptLoadedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const sources = getWidgetScriptSources();
    if (!sources.length) {
      setError("Unable to resolve widget script URL");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const attemptLoad = (index: number) => {
      if (cancelled || scriptLoadedRef.current) {
        return;
      }

      if (index >= sources.length) {
        console.error("[WidgetPreview] Unable to load widget script from any source");
        void loadWidgetInline();
        return;
      }

      const src = sources[index];
      if (!src) {
        attemptLoad(index + 1);
        return;
      }
      console.log(`[WidgetPreview] Loading widget script from ${src}`);

      const script = document.createElement("script");
      script.async = true;
      script.src = src;
      script.crossOrigin = "anonymous";
      scriptElementRef.current = script;

      script.onload = () => {
        if (cancelled) {
          return;
        }

        if (hasWidgetGlobal()) {
          console.log("[WidgetPreview] Widget script loaded successfully");
          scriptLoadedRef.current = true;
          setScriptReady(true);
        } else {
          console.warn(
            "[WidgetPreview] Script loaded but TrestaWidget global missing, trying next source",
          );
          script.remove();
          attemptLoad(index + 1);
        }
      };

      script.onerror = (error) => {
        if (cancelled) {
          return;
        }
        console.error(`[WidgetPreview] Failed to load widget script from ${src}`, error);
        script.remove();
        attemptLoad(index + 1);
      };

      document.body.appendChild(script);
    };

    attemptLoad(0);

    return () => {
      cancelled = true;
      if (!scriptLoadedRef.current && scriptElementRef.current?.parentNode) {
        scriptElementRef.current.parentNode.removeChild(scriptElementRef.current);
      }
    };
  }, [loadWidgetInline]); // Only run once on mount

  useEffect(() => {
    return () => {
      if (restoreFetchRef.current) {
        restoreFetchRef.current();
        restoreFetchRef.current = null;
      }

      if (widgetInstanceRef.current?.instance) {
        try {
          widgetInstanceRef.current.instance.unmount?.();
        } catch (err) {
          console.warn("[WidgetPreview] Failed to unmount widget instance", err);
        }
      }
      widgetInstanceRef.current = null;
    };
  }, []);

  // Render/update widget when config changes
  useEffect(() => {
    if (!scriptReady || !containerRef.current || typeof window === "undefined") {
      return;
    }

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
            createdAt: new Date(Date.now() - 86400000).toISOString(),
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
            createdAt: new Date(Date.now() - 259200000).toISOString(),
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
            createdAt: new Date(Date.now() - 604800000).toISOString(),
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
            createdAt: new Date(Date.now() - 1209600000).toISOString(),
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
            createdAt: new Date(Date.now() - 1814400000).toISOString(),
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
            createdAt: new Date(Date.now() - 2592000000).toISOString(),
            authorAvatar: undefined,
          },
        ];

    const previewWidgetId = widgetId || "preview-widget";
    const apiBaseUrl = resolveApiBaseUrl();

    if (!apiBaseUrl) {
      setError("Unable to determine API base URL for preview");
      setIsLoading(false);
      return;
    }

    const targetUrl = `${apiBaseUrl}/api/widgets/${previewWidgetId}/public`;

    const mockResponse = buildMockApiResponse({
      widgetId: previewWidgetId,
      config,
      testimonials: mockTestimonials,
    });

    const mountPreview = async () => {
      if (!containerRef.current) return;

      setIsLoading(true);
      setError(null);

      if (restoreFetchRef.current) {
        restoreFetchRef.current();
        restoreFetchRef.current = null;
      }

      if (widgetInstanceRef.current) {
        try {
          widgetInstanceRef.current.instance.unmount?.();
        } catch (err) {
          console.warn("[WidgetPreview] Failed to unmount previous instance", err);
        }
        widgetInstanceRef.current.container.remove();
        widgetInstanceRef.current = null;
      }

      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url ?? "";

        if (requestUrl === targetUrl) {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        return originalFetch(input, init);
      };

      restoreFetchRef.current = () => {
        window.fetch = originalFetch;
      };

      const previewWrapper = document.createElement("div");
      previewWrapper.className = "tresta-widget-preview";
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(previewWrapper);

      try {
        const trestaWidget = await waitForWidgetGlobal();

        const instance = await trestaWidget.mount(previewWrapper, {
          widgetId: previewWidgetId,
          apiKey: "preview-api-key",
          apiUrl: apiBaseUrl,
          debug: true,
          telemetry: false,
          version: "preview",
          theme: {
            mode: config.theme ?? "light",
            primaryColor: config.primaryColor || "#0066FF",
            secondaryColor: config.secondaryColor || "#00CC99",
          },
          layout: {
            type: config.layout,
            columns: config.columns || 3,
            autoRotate: config.autoRotate ?? false,
            rotateInterval: config.rotateInterval || 5000,
            showNavigation: false,
          },
          display: {
            showRating: config.showRating ?? true,
            showDate: config.showDate ?? true,
            showAvatar: config.showAvatar ?? false,
            showAuthorRole: config.showAuthorRole ?? true,
            showAuthorCompany: config.showAuthorCompany ?? true,
            maxTestimonials: Math.min(config.maxTestimonials || 10, 6),
          },
        });

        widgetInstanceRef.current = {
          instance,
          container: previewWrapper,
        };

        setIsLoading(false);
      } catch (err) {
        console.error("[WidgetPreview] Error initializing widget:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render widget",
        );
        setIsLoading(false);
      }
    };

    mountPreview();
  }, [config, widgetId, testimonials, scriptReady]);

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

interface MockResponseConfig {
  widgetId: string;
  config: WidgetFormData;
  testimonials: any[];
}

function buildMockApiResponse({
  widgetId,
  config,
  testimonials,
}: MockResponseConfig) {
  const primaryColor = config.primaryColor || "#0066FF";
  const secondaryColor = config.secondaryColor || "#00CC99";
  const settings = {
    layout: config.layout,
    theme: config.theme ?? "light",
    showRating: config.showRating ?? true,
    showDate: config.showDate ?? true,
    showAvatar: config.showAvatar ?? false,
    showAuthorRole: config.showAuthorRole ?? true,
    showAuthorCompany: config.showAuthorCompany ?? true,
    maxTestimonials: Math.min(config.maxTestimonials || 10, 6),
    columns: config.columns || 3,
    autoRotate: config.autoRotate ?? false,
    rotateInterval: config.rotateInterval || 5000,
    showNavigation: false,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    cardStyle: config.cardStyle || "default",
  } as const;

  return {
    success: true,
    data: {
      widget: {
        id: widgetId,
        name: "Preview Widget",
        type: "testimonial" as const,
        layout: config.layout,
        theme: {
          primaryColor,
          secondaryColor,
        },
        settings,
      },
      project: {
        name: "Preview Project",
        slug: "preview-project",
        logoUrl: null,
        brandColorPrimary: primaryColor,
        brandColorSecondary: secondaryColor,
      },
      testimonials: testimonials.map((testimonial) => ({
        id: testimonial.id,
        content: testimonial.content,
        rating: testimonial.rating ?? 5,
        createdAt: testimonial.createdAt,
        authorName: testimonial.authorName,
        authorRole: testimonial.authorRole,
        authorCompany: testimonial.authorCompany,
        authorAvatar: testimonial.authorAvatar,
        videoUrl: testimonial.videoUrl,
        type: testimonial.type || "text",
        isOAuthVerified: testimonial.isOAuthVerified ?? false,
        oauthProvider: testimonial.oauthProvider,
      })),
    },
    meta: {
      fetchedAt: new Date().toISOString(),
      total: testimonials.length,
    },
  };
}

function resolveApiBaseUrl() {
  const normalizedEnv = ENV_API_BASE_URL?.replace(/\/$/, "");
  if (normalizedEnv) {
    return normalizedEnv;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

function getWidgetScriptSources(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const sources = new Set<string>();
  const apiBase = resolveApiBaseUrl();
  const origin = window.location.origin;

  if (apiBase) {
    sources.add(`${apiBase}${WIDGET_SCRIPT_PATH}`);
  }

  if (!apiBase || apiBase !== origin) {
    sources.add(`${origin}${WIDGET_SCRIPT_PATH}`);
  }

  return Array.from(sources);
}

async function waitForWidgetGlobal(timeout = 5000, interval = 50): Promise<WidgetGlobal> {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();

  while (true) {
    const widget = getWidgetGlobal();
    if (widget) {
      return widget;
    }

    const elapsed = (typeof performance !== "undefined" ? performance.now() : Date.now()) - start;
    if (elapsed >= timeout) {
      throw new Error("Widget library not loaded");
    }

    await sleep(interval);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasWidgetGlobal() {
  return Boolean(getWidgetGlobal());
}

function getWidgetGlobal(): WidgetGlobal | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const widget = (window as Window & { TrestaWidget?: WidgetGlobal }).TrestaWidget;
  if (widget && typeof widget.mount === "function") {
    return widget;
  }

  return undefined;
}
