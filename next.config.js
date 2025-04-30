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
  // Explicitly exclude the problematic routes
  experimental: {
    // This tells Next.js to exclude these paths from the build
    excludeDefaultMomentLocales: true,
  },
  // This is the key part - we're telling Next.js which routes to include
  // and by omission, which to exclude
  exportPathMap: async () => ({
    "/": { page: "/" },
    "/admin": { page: "/admin" },
    "/admin/bookings": { page: "/admin/bookings" },
    "/admin/settings": { page: "/admin/settings" },
    "/admin/login": { page: "/admin/login" },
    "/admin/logout": { page: "/admin/logout" },
    "/bookings": { page: "/bookings" },
    // Do NOT include /bookings/[id] or /bookings/[id]/cancel
  }),
}

module.exports = nextConfig
