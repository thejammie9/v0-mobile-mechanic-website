import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Calendar, Settings, LogOut, Home, BarChart3, Users, FileText, Package } from "lucide-react"

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
                  href="/admin"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/bookings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Bookings
                </Link>
                <Link
                  href="/admin/customers"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Customers
                </Link>
                <Link
                  href="/admin/invoices"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Invoices
                </Link>
                <Link
                  href="/admin/parts"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Parts
                </Link>
                <Link
                  href="/admin/reports"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Reports
                </Link>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 hover:text-gray-200"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4 mr-4">
                <Link
                  href="/#services"
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  Services
                </Link>
                <Link
                  href="/#gallery"
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  Gallery
                </Link>
                <Link
                  href="/#reviews"
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  Reviews
                </Link>
                <Link
                  href="/#booking"
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  Book Now
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  Contact
                </Link>
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 mr-2"
              >
                View Website
              </Link>
              <Link
                href="/admin/logout"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
