/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/widget"],
  serverExternalPackages: ["ably"],
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
};

export default nextConfig;
