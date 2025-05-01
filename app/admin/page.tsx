import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Dashboard | Jamie's Auto Care",
  description: "Admin dashboard for Jamie's Auto Care",
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/bookings"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <h2 className="text-xl font-bold mb-2">Booking Requests</h2>
          <p className="text-gray-600">View and manage customer booking requests</p>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <h2 className="text-xl font-bold mb-2">Settings</h2>
          <p className="text-gray-600">Manage website settings and preferences</p>
        </Link>
      </div>
    </div>
  )
}
