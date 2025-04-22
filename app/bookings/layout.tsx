import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Manage Your Booking - Jamie's Auto Care",
  description: "View, manage or cancel your booking with Jamie's Auto Care",
}

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 text-white py-4 px-6">
        <div className="container mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-gray-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Home</span>
            </Link>
            <div className="mx-auto font-bold">Jamie's Auto Care</div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
