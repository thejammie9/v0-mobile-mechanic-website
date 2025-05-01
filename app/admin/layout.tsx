import type React from "react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard | Jamie's Auto Care",
  description: "Admin dashboard for Jamie's Auto Care",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-950 text-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="font-bold text-xl">
              Jamie's Auto Care Admin
            </Link>
          </div>
          <nav className="flex space-x-4">
            <Link href="/admin/bookings" className="hover:text-orange-300">
              Bookings
            </Link>
            <Link href="/admin/settings" className="hover:text-orange-300">
              Settings
            </Link>
            <Link href="/admin/logout" className="hover:text-orange-300">
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
