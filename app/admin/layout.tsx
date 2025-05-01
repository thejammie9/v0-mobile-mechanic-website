import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { LogOut } from "lucide-react"
import AdminAuthCheck from "@/components/admin-auth-check"

export const metadata: Metadata = {
  title: "Admin Dashboard - Edinburgh Mobile Mechanic",
  description: "Admin dashboard for Edinburgh Mobile Mechanic",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-950 text-white py-4 px-6 flex justify-between items-center">
          <div className="font-bold text-xl">Edinburgh Mobile Mechanic - Admin</div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-300 hover:text-white">
              View Website
            </Link>
            <Link href="/admin/logout" className="flex items-center text-sm text-gray-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Link>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-64px)]">
          <aside className="w-64 bg-white border-r border-gray-200 p-4">
            <nav className="space-y-2">
              <Link href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-100">
                Bookings
              </Link>
              <Link href="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-100">
                Settings
              </Link>
            </nav>
          </aside>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminAuthCheck>
  )
}
