/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WIDGET_CDN_BASE_URL: string
    readonly VITE_WIDGET_API_BASE_URL: string
    readonly VITE_WIDGET_TELEMETRY_ENDPOINT: string
    readonly VITE_WIDGET_BRANDING_URL: string
    readonly VITE_WIDGET_ALLOWED_DOMAINS: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
