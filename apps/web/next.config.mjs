/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/widget"],
  serverExternalPackages: ["ably", "@workspace/database", "@prisma/client", "prisma"],
  images: {
    remotePatterns: [
      {
        hostname: "tresta.blob.core.windows.net",
        protocol: "https",
        pathname: "/**",
      },
    ],
    // Disable image optimization for Azure Blob Storage
    // Azure already serves optimized images, and SAS URLs can cause issues
    unoptimized: false,
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    return config
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/((?!api/).*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: [
  //             "default-src 'self'",
  //             "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tresta.app https://*.clerk.accounts.dev https://*.clerk.com https://checkout.razorpay.com",
  //             "style-src 'self' 'unsafe-inline'",
  //             "img-src 'self' https://*.tresta.app https://img.clerk.com https://tresta.blob.core.windows.net data: blob:",
  //             "font-src 'self'",
  //             "connect-src 'self' https://*.tresta.app https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com https://*.clerk-telemetry.com https://*.ably.io wss://*.ably-realtime.com https://*.ably-realtime.com https://tresta.blob.core.windows.net https://api.razorpay.com https://lumberjack.razorpay.com",
  //             "frame-src 'self' https://*.tresta.app https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://api.razorpay.com",
  //             "object-src 'none'",
  //             "base-uri 'self'",
  //             "form-action 'self'",
  //             "worker-src 'self' blob:"
  //           ].join("; ")
  //         },
  //         {
  //           key: "Strict-Transport-Security",
  //           value: "max-age=31536000; includeSubDomains; preload"
  //         },
  //         {
  //           key: "X-Frame-Options",
  //           value: "DENY"
  //         },
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff"
  //         },
  //         {
  //           key: "Referrer-Policy",
  //           value: "strict-origin-when-cross-origin"
  //         },
  //         {
  //           key: "Permissions-Policy",
  //           value: "camera=(), microphone=(), geolocation=()"
  //         }
  //       ]
  //     }
  //   ];
  // }
};

export default nextConfig;
