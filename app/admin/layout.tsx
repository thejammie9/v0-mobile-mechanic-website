import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminWarningBanner } from "@/components/admin-warning-banner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const cookieStore = cookies()
  const adminAuth = cookieStore.get("admin_auth")

  if (!adminAuth) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">Jamie's Auto Care</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/admin/bookings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  Bookings
                </Link>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                href="/admin/logout"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Add the warning banner */}
            <AdminWarningBanner />

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
