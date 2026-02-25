import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@workspace/ui"],
  async headers() {
    const clerkDomain = "https://clerk.tresta.app";
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkDomain} https://*.clerk.accounts.dev`,
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' ${clerkDomain} https://img.clerk.com data: blob:`,
              "font-src 'self'",
              `connect-src 'self' ${clerkDomain} https://*.clerk.accounts.dev https://clerk-telemetry.com https://*.clerk-telemetry.com`,
              `frame-src 'self' ${clerkDomain} https://challenges.cloudflare.com`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
