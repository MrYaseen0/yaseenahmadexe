import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      // Inline scripts are required by this static Next.js layout. No unsafe-eval.
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; media-src 'self' https:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://vitals.vercel-insights.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ] }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
