"use client"

import { useEffect } from "react"
import { logoutAdmin } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      const result = await logoutAdmin()

      // Clear the cookie on the client side
      document.cookie = "admin_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Redirect to login page
      window.location.href = "/admin/login"
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Logging Out</h1>
        <p>Please wait while we log you out...</p>
      </div>
    </div>
  )
}
