import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob Storage — your uploaded product images
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Meesho CDN — your original seed product images
      {
        protocol: "https",
        hostname: "images.meesho.com",
      },
      // Extra: in case your blob store uses a different subdomain format
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
