"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { logoutAdmin } from "@/app/actions/auth-actions"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutAdmin()
        // Force a hard navigation to the login page
        window.location.href = "/admin/login"
      } catch (error) {
        console.error("Logout error:", error)
        // If there's an error, still try to redirect
        window.location.href = "/admin/login"
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold text-blue-900">Logging Out...</h1>
        <p className="text-gray-600">Please wait while we log you out.</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
        </div>
      </div>
    </div>
  )
}
