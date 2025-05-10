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
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebug = (message: string) => {
    console.log(`[AdminLayout] ${message}`)
    setDebugInfo((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]}: ${message}`])
  }

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === "/admin/login") {
      addDebug("On login page, skipping auth check")
      setIsLoading(false)
      return
    }

    addDebug("Checking for admin cookie")
    const cookies = document.cookie.split(";").map((c) => c.trim())
    addDebug(`All cookies: ${cookies.join(", ")}`)

    const hasAdminCookie = cookies.some((c) => c.startsWith("admin_logged_in=true"))
    addDebug(`Has admin cookie: ${hasAdminCookie}`)

    if (!hasAdminCookie) {
      addDebug("No admin cookie found, redirecting to login")
      router.push("/admin/login")
    } else {
      addDebug("Admin cookie found, allowing access")
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
              <button
                onClick={() => {
                  // Clear the cookie on the client side
                  document.cookie = "admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
                  // Redirect to login page
                  window.location.href = "/admin/login"
                }}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}

            {/* Debug information */}
            <div className="mt-6 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60">
              <p className="font-bold">Debug Info:</p>
              {debugInfo.map((msg, i) => (
                <div key={i} className="mt-1">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
