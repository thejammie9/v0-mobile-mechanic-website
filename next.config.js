/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.com"],
    unoptimized: true,
  },
  // Enable server actions
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
