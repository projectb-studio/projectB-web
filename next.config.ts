import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 — product images
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        // Supabase Storage (if used)
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Strict mode for catching bugs early
  reactStrictMode: true,
};

export default nextConfig;
