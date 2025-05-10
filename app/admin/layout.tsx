"use client"

import type React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, Settings, LogOut, Home, BarChart3, Users, FileText, Package } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === "/admin/login") {
      setIsLoading(false)
      return
    }

    // Check if the admin_logged_in cookie exists
    const hasAdminCookie = document.cookie.split(";").some((item) => item.trim().startsWith("admin_logged_in=true"))

    if (!hasAdminCookie) {
      router.push("/admin/login")
    } else {
      setIsLoading(false)
    }
  }, [router, pathname])

  // Show loading state
  if (isLoading && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  // If we're on the login page, just render children
  if (pathname === "/admin/login") {
    return <>{children}</>
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
