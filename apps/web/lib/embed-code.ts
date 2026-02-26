/**
 * Centralized embed code generation utility.
 *
 * All UI surfaces that display embed snippets MUST use these helpers
 * so the generated code stays consistent with the widget runtime
 * (see packages/widget/src/core/config.ts).
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const getApiUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getWidgetScriptUrl = (): string =>
  `${getApiUrl()}/widget/tresta-widget.js`;

const API_KEY_PLACEHOLDER = "YOUR_API_KEY_HERE";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmbedCodeOptions {
  /** Widget ID (required) */
  widgetId: string;
  /** User's API key – falls back to a placeholder when absent */
  apiKey?: string;
}

export interface EmbedCodes {
  script: string;
  iframe: string;
  react: string;
  api: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate all embed code variants for a given widget.
 *
 * The returned object contains ready-to-copy strings for:
 * - `script`  – vanilla JS script tag (recommended)
 * - `iframe`  – sandboxed iframe embed
 * - `react`   – React component snippet
 * - `api`     – cURL command for the public API
 */
export function generateEmbedCodes(options: EmbedCodeOptions): EmbedCodes {
  const { widgetId, apiKey } = options;
  const apiUrl = getApiUrl();
  const widgetScriptUrl = getWidgetScriptUrl();
  const displayApiKey = apiKey || API_KEY_PLACEHOLDER;
  const iframeUrl = `${apiUrl}/api/public/embed/${widgetId}?apiKey=${displayApiKey}`;
  const apiEndpointUrl = `${apiUrl}/api/widgets/${widgetId}/public`;

  return {
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
  -H "Authorization: Bearer ${displayApiKey}"`,
  };
}

/**
 * Generate only the script-tag embed code (convenience shorthand).
 */
export function generateScriptEmbed(options: EmbedCodeOptions): string {
  return generateEmbedCodes(options).script;
}

/** Constant API key placeholder exported for UI hints */
export { API_KEY_PLACEHOLDER };
