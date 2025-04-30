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
  assetPrefix: "/",
  // Exclude dynamic routes from the export
  exportPathMap: async () => ({
    "/": { page: "/" },
    "/admin/login": { page: "/admin/login" },
    "/admin/bookings": { page: "/admin/bookings" },
    "/admin/settings": { page: "/admin/settings" },
    "/admin/logout": { page: "/admin/logout" },
    // Add any other static routes you need
  }),
}

module.exports = nextConfig
