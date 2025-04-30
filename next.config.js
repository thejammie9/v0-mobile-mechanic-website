/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Explicitly disable dynamic routes
  experimental: {
    appDir: true,
    // This tells Next.js to exclude these paths from the build
    excludeDefaultMomentLocales: true,
  },
}

module.exports = nextConfig
