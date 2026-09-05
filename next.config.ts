import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "placeholder.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/media/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Recortado a proposito: menos variantes = menos transformaciones facturadas.
    deviceSizes: [360, 640, 828, 1080, 1200],
    imageSizes: [96, 160, 256, 384],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
