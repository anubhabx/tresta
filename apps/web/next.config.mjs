/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
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
};

export default nextConfig;
