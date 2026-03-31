/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        // Unsplash — temporary placeholder images
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Strict mode for catching bugs early
  reactStrictMode: true,
};

export default nextConfig;
