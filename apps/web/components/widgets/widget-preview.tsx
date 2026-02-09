"use client";

import { useEffect, useMemo, useState } from "react";
import type { WidgetFormData } from "./widget-form";
import { Loader2 } from "lucide-react";
import { DEFAULT_WIDGET_CONFIG, type WidgetConfig } from "@workspace/types";

const WIDGET_SCRIPT_PATH = "/widget/tresta-widget.js";
const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const PREVIEW_MAX_TESTIMONIALS = 6;

const PREVIEW_FETCHED_AT = "2024-01-01T00:00:00.000Z";
const INLINE_SOURCE_URL = "tresta-preview-inline.js";
const INLINE_SOURCE_MAP_DATA_URL =
  "data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlc3RhLXByZXZpZXctaW5saW5lLmpzIiwic291cmNlcyI6WyJ0cmVzdGEtcHJldmlldy1pbmxpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiJ9";

type PreviewTestimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  content: string;
  rating: number;
  createdAt: string;
  authorAvatar?: string;
};

const DEFAULT_PREVIEW_TESTIMONIALS: ReadonlyArray<PreviewTestimonial> = [
  {
    id: "1",
    authorName: "Sarah Johnson",
    authorRole: "CEO",
    authorCompany: "Tech Innovations Inc",
    content:
      "This is an amazing product! It has completely transformed how we collect and display customer testimonials.",
    rating: 5,
    createdAt: "2024-01-10T12:00:00.000Z",
  },
  {
    id: "2",
    authorName: "Michael Chen",
    authorRole: "Marketing Director",
    authorCompany: "Digital Solutions",
    content:
      "Highly recommended! The widget looks professional and integrates seamlessly with our website.",
    rating: 5,
    createdAt: "2024-01-08T15:30:00.000Z",
  },
  {
    id: "3",
    authorName: "Emily Rodriguez",
    authorRole: "Product Manager",
    authorCompany: "StartupXYZ",
    content:
      "Easy to use and powerful. Our team loves how simple it is to customize the widget to match our brand.",
    rating: 5,
    createdAt: "2024-01-05T09:45:00.000Z",
  },
  {
    id: "4",
    authorName: "David Thompson",
    authorRole: "Founder",
    authorCompany: "Growth Labs",
    content:
      "The best testimonial solution we've tried. Layout and customization options are exactly what we needed.",
    rating: 4,
    createdAt: "2023-12-30T18:20:00.000Z",
  },
  {
    id: "5",
    authorName: "Lisa Anderson",
    authorRole: "Head of Sales",
    authorCompany: "Enterprise Corp",
    content:
      "Our clients trust us more now that they can see authentic testimonials beautifully displayed on our site.",
    rating: 5,
    createdAt: "2023-12-20T11:10:00.000Z",
  },
  {
    id: "6",
    authorName: "James Wilson",
    authorRole: "CTO",
    authorCompany: "Cloud Systems",
    content:
      "Excellent! The widget is lightweight, fast, and doesn't impact our page load times.",
    rating: 5,
    createdAt: "2023-12-12T08:55:00.000Z",
  },
];

interface WidgetPreviewProps {
  config: WidgetFormData;
  widgetId?: string;
  testimonials?: any[];
}

type NormalizedPreviewConfig = {
  layout: "grid" | "list";
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  showRating: boolean;
  showAvatar: boolean;
  maxTestimonials: number;
};

type PreviewDocumentPayload = {
  widgetId: string;
  apiUrl: string;
  scriptSources: string[];
  config: NormalizedPreviewConfig;
  mockResponse: ReturnType<typeof buildMockApiResponse>;
  nonce?: string;
  displayDefaults: {
    secondaryColor: string;
    showDate: boolean;
    showAuthorRole: boolean;
    showAuthorCompany: boolean;
  };
};

type PreviewMessage = {
  type?: "tresta-preview-ready" | "tresta-preview-error";
  error?: string;
};

export function WidgetPreview({
  config,
  widgetId,
  testimonials,
}: WidgetPreviewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedTestimonials = testimonials ?? DEFAULT_PREVIEW_TESTIMONIALS;
  const documentNonce =
    typeof window !== "undefined" ? getDocumentNonce() : undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const previewPayload = useMemo<PreviewDocumentPayload | null>(() => {
    if (!isMounted) {
      return null;
    }

    const apiUrl = resolveApiBaseUrl();
    if (!apiUrl) {
      return null;
    }

    const scriptSources = getWidgetScriptSources(apiUrl);
    if (!scriptSources.length) {
      return null;
    }

    const normalizedConfig = normalizePreviewConfig(config);
    const previewWidgetId = widgetId || "preview-widget";
    const mockResponse = buildMockApiResponse({
      widgetId: previewWidgetId,
      config: normalizedConfig,
      testimonials: resolvedTestimonials,
    });

    return {
      widgetId: previewWidgetId,
      apiUrl,
      scriptSources,
      config: normalizedConfig,
      mockResponse,
      nonce: documentNonce,
      displayDefaults: {
        secondaryColor: DEFAULT_WIDGET_CONFIG.secondaryColor,
        showDate: DEFAULT_WIDGET_CONFIG.showDate,
        showAuthorRole: DEFAULT_WIDGET_CONFIG.showAuthorRole,
        showAuthorCompany: DEFAULT_WIDGET_CONFIG.showAuthorCompany,
      },
    };
  }, [config, widgetId, resolvedTestimonials, isMounted]);

  const iframeDocument = useMemo(() => {
    if (!previewPayload) {
      return null;
    }
    return buildPreviewDocument(previewPayload);
  }, [previewPayload]);

  useEffect(() => {
    if (!iframeDocument) {
      setError("Unable to prepare preview environment");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIframeKey((key) => key + 1);
  }, [iframeDocument]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure message comes from same origin
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!event?.data || typeof event.data !== "object") {
        return;
      }

      const message = event.data as PreviewMessage;
      if (message.type === "tresta-preview-ready") {
        setIsLoading(false);
        setError(null);
      } else if (message.type === "tresta-preview-error") {
        setIsLoading(false);
        setError(message.error || "Failed to render widget preview");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Rendering preview...
          </div>
        )}
      </div>

      <div className="rounded-xl border overflow-hidden shadow-sm bg-card">
        {error || !iframeDocument ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-destructive mb-2">Preview Error</p>
            <p className="text-xs text-muted-foreground">
              {error || "Widget preview unavailable"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Ensure the widget assets are built:
              <code className="bg-muted px-1.5 py-0.5 rounded ml-1">
                cd packages/widget &amp;&amp; pnpm build
              </code>
            </p>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="mt-4 text-xs text-primary hover:underline"
            >
              Retry Preview
            </button>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            srcDoc={iframeDocument}
            sandbox="allow-scripts allow-same-origin"
            className="min-h-[520px] w-full border-0"
            title="Widget preview"
          />
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Preview updates instantly with mock testimonials to match your settings.
      </p>
    </div>
  );
}

interface MockResponseConfig {
  widgetId: string;
  config: NormalizedPreviewConfig;
  testimonials: ReadonlyArray<any>;
}

function buildMockApiResponse({
  widgetId,
  config,
  testimonials,
}: MockResponseConfig) {
  const defaultedSettings = {
    ...DEFAULT_WIDGET_CONFIG,
    ...config,
    showDate: DEFAULT_WIDGET_CONFIG.showDate,
    showAuthorRole: DEFAULT_WIDGET_CONFIG.showAuthorRole,
    showAuthorCompany: DEFAULT_WIDGET_CONFIG.showAuthorCompany,
    columns: config.layout === "grid" ? 3 : 1,
    showNavigation: false,
  } satisfies WidgetConfig;

  defaultedSettings.maxTestimonials = config.maxTestimonials;
  defaultedSettings.autoRotate = false;
  defaultedSettings.rotateInterval = DEFAULT_WIDGET_CONFIG.rotateInterval;

  const primaryColor = defaultedSettings.primaryColor;
  const secondaryColor = DEFAULT_WIDGET_CONFIG.secondaryColor;

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
        settings: defaultedSettings,
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
      fetchedAt: PREVIEW_FETCHED_AT,
      total: testimonials.length,
    },
  };
}

function normalizePreviewConfig(
  config: WidgetFormData,
): NormalizedPreviewConfig {
  const layout = config.layout === "list" ? "list" : "grid";

  return {
    layout,
    theme: config.theme ?? DEFAULT_WIDGET_CONFIG.theme,
    primaryColor: config.primaryColor || DEFAULT_WIDGET_CONFIG.primaryColor,
    showRating: config.showRating ?? DEFAULT_WIDGET_CONFIG.showRating,
    showAvatar: config.showAvatar ?? DEFAULT_WIDGET_CONFIG.showAvatar,
    maxTestimonials: Math.min(
      config.maxTestimonials ?? DEFAULT_WIDGET_CONFIG.maxTestimonials,
      PREVIEW_MAX_TESTIMONIALS,
    ),
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

function getWidgetScriptSources(apiUrl: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const sources = new Set<string>();
  const normalizedApi = apiUrl.replace(/\/$/, "");
  const origin = window.location.origin;

  if (origin) {
    sources.add(`${origin}${WIDGET_SCRIPT_PATH}`);
  }

  if (normalizedApi && normalizedApi !== origin) {
    sources.add(`${normalizedApi}${WIDGET_SCRIPT_PATH}`);
  }

  return Array.from(sources);
}

function buildPreviewDocument(payload: PreviewDocumentPayload): string {
  const dataJson = serializeForInlineScript(payload);
  const nonceAttr = payload.nonce ? ` nonce="${payload.nonce}"` : "";

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Tresta Widget Preview</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 24px;
          min-height: 100vh;
          background-color: lab(7.24807% 0 0);
        }
        body::-webkit-scrollbar {
          width: 12px;
        }
        body::-webkit-scrollbar-track {
          background-color: lab(7.24807% 0 0);
        }
        body::-webkit-scrollbar-thumb {
          background-color: lab(7.24807% 0 0);
          border-radius: 6px;
        }
        #preview-status {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 16px;
          text-align: center;
        }
        #tresta-widget-preview-root {
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div id="preview-status">Loading widget preview…</div>
      <div id="tresta-widget-preview-root" aria-live="polite"></div>
      <script type="application/json" id="tresta-preview-data">${dataJson}</script>
      <script${nonceAttr}>
        (() => {
          if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            try {
              window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {};
            } catch (err) {
              console.warn('[TrestaWidget] Failed to patch React DevTools hook', err);
            }
          }

          const log = (msg, data) => {
            // console.log('[Preview Iframe] ' + msg, data || '');
          };

          const dataElement = document.getElementById('tresta-preview-data');
          if (!dataElement) {
            window.parent?.postMessage({ type: 'tresta-preview-error', error: 'Missing preview data' }, '*');
            return;
          }

          const previewData = JSON.parse(dataElement.textContent || '{}');
          const statusEl = document.getElementById('preview-status');

          const notify = (type, payload) => {
            window.parent?.postMessage({ type, ...payload }, '*');
          };

          const originalFetch = window.fetch.bind(window);
          const targetUrl = previewData.apiUrl + '/api/widgets/' + previewData.widgetId + '/public';

          window.fetch = (input, init) => {
            const url = typeof input === 'string'
              ? input
              : input instanceof Request
                ? input.url
                : typeof input === 'object' && input?.url
                  ? input.url
                  : '';

            if (url === targetUrl) {
              return Promise.resolve(new Response(JSON.stringify(previewData.mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }));
            }

            return originalFetch(input, init);
          };

          const mountWidget = () => {
            const root = document.getElementById('tresta-widget-preview-root');
            if (!root || !window.TrestaWidget) {
              notify('tresta-preview-error', { error: 'Widget mount target missing' });
              return;
            }

            root.innerHTML = '';
            window.TrestaWidget.mount(root, {
              widgetId: previewData.widgetId,
              apiKey: 'preview-api-key',
              apiUrl: previewData.apiUrl,
              debug: true,
              telemetry: false,
              theme: {
                mode: previewData.config.theme,
                primaryColor: previewData.config.primaryColor,
                secondaryColor: previewData.displayDefaults.secondaryColor,
              },
              layout: {
                type: previewData.config.layout,
                columns: previewData.config.layout === 'grid' ? 3 : 1,
                autoRotate: false,
                rotateInterval: 0,
                showNavigation: false,
              },
              display: {
                showRating: previewData.config.showRating,
                showDate: previewData.displayDefaults.showDate,
                showAvatar: previewData.config.showAvatar,
                showAuthorRole: previewData.displayDefaults.showAuthorRole,
                showAuthorCompany: previewData.displayDefaults.showAuthorCompany,
                maxTestimonials: previewData.config.maxTestimonials,
              },
            }).then(() => {
              statusEl?.remove();
              notify('tresta-preview-ready', {});
            }).catch((error) => {
              notify('tresta-preview-error', { error: error?.message || 'Failed to render widget' });
            });
          };

          const waitForWidget = (attempts) => {
            if (window.TrestaWidget?.mount) {
              mountWidget();
              return;
            }
            if (attempts <= 0) {
              notify('tresta-preview-error', { error: 'Widget library failed to initialize' });
              return;
            }
            setTimeout(() => waitForWidget(attempts - 1), 50);
          };

          const scriptSources = previewData.scriptSources || [];

          const loadScriptFromSource = (index) => {
            if (window.TrestaWidget?.mount) {
              waitForWidget(10);
              return;
            }

            if (index >= scriptSources.length) {
              notify('tresta-preview-error', { error: 'Unable to load widget library' });
              return;
            }

            const src = scriptSources[index];

            const script = document.createElement('script');
            script.async = true;
            script.src = src;
            script.crossOrigin = 'anonymous';
            if (previewData.nonce) {
              script.setAttribute('nonce', previewData.nonce);
            }

            script.onload = () => {
              waitForWidget(200);
            };
            script.onerror = (e) => {
              loadScriptFromSource(index + 1);
            };
            document.body.appendChild(script);
          };

          loadScriptFromSource(0);
        })();
        //# sourceURL=${INLINE_SOURCE_URL}
        //# sourceMappingURL=${INLINE_SOURCE_MAP_DATA_URL}
      </script>
    </body>
  </html>`;
}

function serializeForInlineScript(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E");
}

function getDocumentNonce(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const scriptWithNonce =
    document.querySelector<HTMLScriptElement>("script[nonce]");
  return scriptWithNonce?.getAttribute("nonce") ?? undefined;
}
