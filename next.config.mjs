/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["better-sqlite3-multiple-ciphers", "better-sqlite3", "node-cron", "nodemailer", "puppeteer"],

  // Cache headers — tell CDN (Cloudflare etc.) what it can cache and for how long
  async headers() {
    return [
      {
        // Next.js static chunks (JS/CSS) — these have content hashes so are safe to cache forever
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Public images, fonts, icons — cache for 30 days
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        // favicon, manifest, robots, sitemap — cache for 24 hours
        source: "/:file(favicon.*|robots.txt|sitemap.xml|manifest.json)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        // Admin and API routes — never cache
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ]
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Node.js built-ins (fs, path, etc.) are never bundled
      config.externalsPresets = { ...config.externalsPresets, node: true }
    }
    return config
  },
}

export default nextConfig
